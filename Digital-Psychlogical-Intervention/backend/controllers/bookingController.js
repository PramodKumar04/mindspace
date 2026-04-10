import mongoose from 'mongoose';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import { createNotification } from './notificationController.js';

const MEETING_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const generateMeetingCode = async () => {
  for (let attempt = 0; attempt < 10; attempt += 1) {
    let code = '';
    for (let i = 0; i < 6; i += 1) {
      code += MEETING_CODE_ALPHABET[Math.floor(Math.random() * MEETING_CODE_ALPHABET.length)];
    }

    const exists = await Booking.exists({ meetingCode: code });
    if (!exists) {
      return code;
    }
  }

  throw new Error('Unable to generate a unique meeting code');
};

/**
 * Set counselor availability (Counselor only)
 */
export const setAvailability = async (req, res, next) => {
  try {
    const { slotStart, slotEnd } = req.body;

    if (!slotStart || !slotEnd) {
      return res.status(400).json({ message: 'Start and end times are required' });
    }

    const start = new Date(slotStart);
    const end = new Date(slotEnd);

    if (start >= end) {
      return res.status(400).json({ message: 'End time must be after start time' });
    }

    if (start < new Date()) {
      return res.status(400).json({ message: 'Cannot create slots in the past' });
    }

    // Check for conflicts with pending/approved/available slots
    const conflict = await Booking.findOne({
      counselorId: req.user.userId,
      status: { $in: ['available', 'pending', 'approved'] },
      $or: [
        {
          slotStart: { $lt: end },
          slotEnd: { $gt: start }
        }
      ]
    });

    if (conflict) {
      return res.status(400).json({ message: 'Time slot conflicts with an existing booking or availability block.' });
    }

    // Create availability slot natively
    const availability = await Booking.create({
      counselorId: req.user.userId,
      collegeId: req.user.collegeId,
      slotStart: start,
      slotEnd: end,
      status: 'available'
    });

    res.status(201).json({ message: 'Availability slot published successfully.', availability });
  } catch (error) {
    next(error);
  }
};

export const getAvailableSlots = async (req, res, next) => {
  try {
    const { counselorId } = req.params;
    
    // Optional: add collegeId constraint if students can strictly only see their own counselors
    const slots = await Booking.find({
      counselorId,
      status: 'available',
      slotStart: { $gt: new Date() } // Only show future slots
    }).sort({ slotStart: 1 });

    res.json({ slots });
  } catch (error) {
    next(error);
  }
};

/**
 * Book counseling session (Student only)
 * Uses atomic operations (findOneAndUpdate) to prevent double booking (FCFS).
 */
export const bookSession = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bookingId, studentNotes } = req.body;

    if (!bookingId) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'Booking ID is required' });
    }

    // Lock the booking if it's currently 'available'
    const booking = await Booking.findOneAndUpdate(
      { _id: bookingId, status: 'available' },
      { 
        status: 'pending',
        studentId: req.user.userId,
        studentNotes: studentNotes || ''
      },
      { new: true, session }
    );

    if (!booking) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'This slot was just taken. Please choose another one.' });
    }

    await session.commitTransaction();
    session.endSession();

    // Notify Counselor
    await createNotification({
      userId: booking.counselorId,
      collegeId: booking.collegeId,
      message: `New booking request received for ${new Date(booking.slotStart).toLocaleDateString()}.`,
      type: 'booking_request',
      link: '/connect'
    });

    res.status(200).json({
      message: 'Session requested successfully.',
      booking
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    next(error);
  }
};

/**
 * Get bookings for student
 */
export const getStudentBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      studentId: req.user.userId
    })
      .populate('counselorId', 'name email profile.specialization')
      .sort({ slotStart: 1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * Get bookings for counselor
 */
export const getCounselorBookings = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = {
      counselorId: req.user.userId
    };

    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('studentId', 'name email')
      .sort({ slotStart: 1 });

    res.json({ bookings });
  } catch (error) {
    next(error);
  }
};

/**
 * Get counselors for current college
 */
export const getCounselors = async (req, res, next) => {
  try {
    const counselors = await User.find({
      role: 'counselor',
      collegeId: req.user.collegeId,
      isActive: true
    })
      .select('name email profile.specialization')
      .sort({ name: 1 });

    res.json({ counselors });
  } catch (error) {
    next(error);
  }
};

/**
 * Update booking status (Counselor only)
 */
export const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    const { bookingId } = req.params;

    if (!['approved', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      counselorId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.status = status;
    if (notes !== undefined) booking.notes = notes;
    if (status === 'approved' && !booking.meetingCode) {
      booking.meetingCode = await generateMeetingCode();
    }
    await booking.save();

    res.json({
      message: 'Booking status updated successfully',
      booking
    });

    // Notify Student
    if (status === 'approved' || status === 'rejected') {
      await createNotification({
        userId: booking.studentId,
        collegeId: booking.collegeId,
        message: `Your session request has been ${status}${status === 'approved' ? '. Check the meeting code in your dashboard.' : '.'}`,
        type: status === 'approved' ? 'booking_confirmed' : 'booking_rejected',
        link: '/connect'
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a booking slot (Counselor only)
 */
export const deleteBookingSlot = async (req, res, next) => {
  try {
    const { bookingId } = req.params;

    const booking = await Booking.findOne({
      _id: bookingId,
      counselorId: req.user.userId
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    // Only allow deletion of available or rejected slots. 
    // If pending or approved, we should probably reject first or handle with care.
    // For now, let's allow it but clean up notifications.
    
    await Booking.deleteOne({ _id: bookingId });

    // Clean up notifications related to this user/link if we had a specific link system
    // Or just clear pending notifications for this user about bookings if we want to be thorough.
    // Since notifications are generic messages, we'll just delete the booking.
    
    res.json({ success: true, message: 'Slot deleted successfully' });
  } catch (error) {
    next(error);
  }
};
