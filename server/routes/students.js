import express from 'express';
import Student from '../models/Student.js';
import Attendance from '../models/Attendance.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get all students
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { class: className, search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (className) {
      query.class = className;
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { parentName: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query)
      .sort({ class: 1, rollNumber: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Student.countDocuments(query);

    res.json({
      students,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get student by ID with attendance stats
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    // Get attendance stats
    const totalDays = await Attendance.countDocuments({ student: student._id });
    const presentDays = await Attendance.countDocuments({ 
      student: student._id, 
      status: 'present' 
    });
    const absentDays = await Attendance.countDocuments({ 
      student: student._id, 
      status: 'absent' 
    });
    const lateDays = await Attendance.countDocuments({ 
      student: student._id, 
      status: 'late' 
    });

    const attendancePercentage = totalDays > 0 ? ((presentDays + lateDays) / totalDays * 100).toFixed(2) : 0;

    res.json({
      student,
      stats: {
        totalDays,
        presentDays,
        absentDays,
        lateDays,
        attendancePercentage
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create student
router.post('/', authMiddleware, async (req, res) => {
  try {
    const student = new Student(req.body);
    await student.save();
    res.status(201).json(student);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Roll number already exists' });
    }
    res.status(400).json({ message: error.message });
  }
});

// Update student
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete student
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }
    
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;