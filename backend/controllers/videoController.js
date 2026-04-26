import Meeting from '../models/Meeting.js';

export const getUserHistory = async (req, res) => {
  try {
    const meetings = await Meeting.find({ userId: req.user.userId })
      .sort({ updatedAt: -1 });

    res.json({ meetings });
  } catch (e) {
    res.status(500).json({ message: `Something went wrong: ${e.message}` });
  }
};

export const addToHistory = async (req, res) => {
  const normalizedCode = req.body.meeting_code?.trim().toUpperCase();

  if (!normalizedCode) {
    return res.status(400).json({ message: 'Meeting code is required' });
  }

  try {
    const meeting = await Meeting.findOneAndUpdate(
      {
        userId: req.user.userId,
        meetingCode: normalizedCode
      },
      {
        $set: {
          collegeId: req.user.collegeId,
          role: req.user.role
        }
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true
      }
    );

    res.status(201).json({ message: 'Added code to history', meeting });
  } catch (e) {
    res.status(500).json({ message: `Something went wrong: ${e.message}` });
  }
};
