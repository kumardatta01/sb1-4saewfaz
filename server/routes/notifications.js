import express from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { sendNotification } from '../services/notification.js';
import Student from '../models/Student.js';

const router = express.Router();

// Test notification
router.post('/test', authMiddleware, async (req, res) => {
  try {
    const { studentId, type = 'email' } = req.body;
    
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ message: 'Student not found' });
    }

    await sendNotification(student, 'absent', new Date().toISOString(), type);
    
    res.json({ message: 'Test notification sent successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;