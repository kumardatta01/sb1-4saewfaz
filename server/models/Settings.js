import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  schoolName: {
    type: String,
    default: 'School Name'
  },
  schoolHours: {
    start: {
      type: String,
      default: '08:00'
    },
    end: {
      type: String,
      default: '15:00'
    }
  },
  holidays: [{
    date: Date,
    name: String
  }],
  emailSettings: {
    enabled: {
      type: Boolean,
      default: true
    },
    template: {
      type: String,
      default: 'Dear {{parentName}}, your child {{studentName}} was marked {{status}} on {{date}}.'
    }
  },
  smsSettings: {
    enabled: {
      type: Boolean,
      default: false
    },
    template: {
      type: String,
      default: 'Alert: {{studentName}} was {{status}} on {{date}}.'
    }
  },
  classes: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

export default mongoose.model('Settings', settingsSchema);