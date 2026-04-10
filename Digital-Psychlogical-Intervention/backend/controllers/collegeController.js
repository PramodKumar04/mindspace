import College from '../models/College.js';

/**
 * Create new college (Admin only)
 */
export const createCollege = async (req, res, next) => {
  try {
    const { name, code, description } = req.body;

    if (!name || !code) {
      return res.status(400).json({ message: 'Name and code are required' });
    }

    const college = await College.create({
      name,
      code: code.toUpperCase(),
      description
    });

    res.status(201).json({
      message: 'College created successfully',
      college
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all colleges
 */
export const getAllColleges = async (req, res, next) => {
  try {
    const colleges = await College.find({ isActive: true })
      .select('name code description')
      .sort({ name: 1 });

    res.json({ colleges });
  } catch (error) {
    next(error);
  }
};

/**
 * Get college by ID
 */
export const getCollegeById = async (req, res, next) => {
  try {
    const college = await College.findById(req.params.id);
    
    if (!college) {
      return res.status(404).json({ message: 'College not found' });
    }

    res.json({ college });
  } catch (error) {
    next(error);
  }
};
