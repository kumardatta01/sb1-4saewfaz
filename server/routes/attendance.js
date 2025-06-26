import express from 'express';
import Attendance from '../models/Attendance.js';
import Student from '../models/Student.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendNotification } from '../services/notification.js';

const router = express.Router();

// Mark attendance
router.post('/mark', authMiddleware, async (req, res) => {
  try {
    const { attendanceData, date } = req.body;
    
    const results = [];
    
    for (const record of attendanceData) {
      const { studentId, status, remarks } = record;
      
      const attendance = await Attendance.findOneAndUpdate(
        { student: studentId, date: new Date(date) },
        {
          status,
          remarks,
          markedBy: req.user.userId,
          notificationSent: false
        },
        { upsert: true, new: true }
      );

      // Send notification for absent students
      if (status === 'absent') {
        const student = await Student.findById(studentId);
        if (student) {
          try {
            await sendNotification(student, status, date);
            attendance.notificationSent = true;
            await attendance.save();
          } catch (notificationError) {
            console.error('Notification error:', notificationError);
          }
        }
      }
      
      results.push(attendance);
    }
    
    res.json({ message: 'Attendance marked successfully', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance for a specific date and class
router.get('/date/:date', authMiddleware, async (req, res) => {
  try {
    const { date } = req.params;
    const { class: className } = req.query;
    
    let studentQuery = { isActive: true };
    if (className) {
      studentQuery.class = className;
    }
    
    const students = await Student.find(studentQuery).sort({ rollNumber: 1 });
    const attendance = await Attendance.find({
      date: new Date(date),
      student: { $in: students.map(s => s._id) }
    }).populate('student');

    const attendanceMap = {};
    attendance.forEach(record => {
      attendanceMap[record.student._id.toString()] = record;
    });

    const result = students.map(student => ({
      student,
      attendance: attendanceMap[student._id.toString()] || null
    }));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get attendance history
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      studentId, 
      class: className, 
      status,
      page = 1,
      limit = 50 
    } = req.query;

    let query = {};
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }
    
    if (status) {
      query.status = status;
    }

    let populateQuery = 'student markedBy';
    
    if (studentId) {
      query.student = studentId;
    } else if (className) {
      const students = await Student.find({ class: className, isActive: true });
      query.student = { $in: students.map(s => s._id) };
    }

    const attendance = await Attendance.find(query)
      .populate(populateQuery)
      .sort({ date: -1, 'student.rollNumber': 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Attendance.countDocuments(query);

    res.json({
      attendance,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get dashboard stats
router.get('/stats/dashboard', authMiddleware, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Today's stats
    const todayStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: today, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsMap = {
      present: 0,
      absent: 0,
      late: 0
    };

    todayStats.forEach(stat => {
      statsMap[stat._id] = stat.count;
    });

    // Weekly stats for the last 7 days
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);

    const weeklyStats = await Attendance.aggregate([
      {
        $match: {
          date: { $gte: weekAgo, $lt: tomorrow }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
            status: '$status'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          present: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'present'] }, '$count', 0] }
          },
          absent: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'absent'] }, '$count', 0] }
          },
          late: {
            $sum: { $cond: [{ $eq: ['$_id.status', 'late'] }, '$count', 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      today: statsMap,
      weekly: weeklyStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;