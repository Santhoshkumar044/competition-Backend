import Student from '../models/studentDetails.js';

// @desc    Create a new student
// @route   POST /api/students
// @access  Public
export const createStudent = async (req, res, next) => {
  try {
    const { name, email, GraduationYear, department, RegisterNo } = req.body;

    const student = await Student.create({
      name,
      email,
      GraduationYear,
      department,
      RegisterNo,
      role: 'student',     // default role
      isVerified: false    // default verification
    });

    res.status(201).json({
      success: true,
      data: {
        id: student._id,
        name: student.name,
        email: student.email,
        department: student.department,
        GraduationYear: student.GraduationYear,
        RegisterNo: student.RegisterNo,
        role: student.role
      }
    });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    }

    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'Duplicate field value entered' });
    }

    next(err);
  }
};

// @desc    Get all students
// @route   GET /api/students
// @access  Public
export const getStudents = async (req, res, next) => {
  try {
    const students = await Student.find({ role: 'student' })
      .sort({ createdAt: -1 })
      .select('-__v -createdAt -updatedAt,-_id');

    res.status(200).json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (err) {
    next(err);
  }
};
