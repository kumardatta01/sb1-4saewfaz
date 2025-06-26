import React, { useState, useEffect } from 'react';
import { Calendar, Users, Save, CheckCircle, XCircle, Clock } from 'lucide-react';
import { attendanceAPI, studentsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
}

interface AttendanceRecord {
  student: Student;
  attendance: {
    status: 'present' | 'absent' | 'late';
    remarks?: string;
  } | null;
}

interface AttendanceData {
  studentId: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export const MarkAttendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedClass, setSelectedClass] = useState('');
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const classes = ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10'];

  useEffect(() => {
    if (selectedClass && selectedDate) {
      loadAttendanceData();
    }
  }, [selectedClass, selectedDate]);

  const loadAttendanceData = async () => {
    try {
      setLoading(true);
      const response = await attendanceAPI.getByDate(selectedDate, selectedClass);
      setAttendanceRecords(response.data);
    } catch (error) {
      toast.error('Failed to load attendance data');
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttendanceRecords(records =>
      records.map(record => {
        if (record.student._id === studentId) {
          return {
            ...record,
            attendance: {
              status,
              remarks: record.attendance?.remarks || ''
            }
          };
        }
        return record;
      })
    );
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceRecords(records =>
      records.map(record => {
        if (record.student._id === studentId) {
          return {
            ...record,
            attendance: {
              status: record.attendance?.status || 'present',
              remarks
            }
          };
        }
        return record;
      })
    );
  };

  const handleSaveAttendance = async () => {
    if (!selectedClass || !selectedDate) {
      toast.error('Please select class and date');
      return;
    }

    const attendanceData: AttendanceData[] = attendanceRecords.map(record => ({
      studentId: record.student._id,
      status: record.attendance?.status || 'present',
      remarks: record.attendance?.remarks || ''
    }));

    try {
      setSaving(true);
      await attendanceAPI.markAttendance({
        attendanceData,
        date: selectedDate
      });
      toast.success('Attendance saved successfully');
    } catch (error) {
      toast.error('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const markAllPresent = () => {
    setAttendanceRecords(records =>
      records.map(record => ({
        ...record,
        attendance: {
          status: 'present' as const,
          remarks: record.attendance?.remarks || ''
        }
      }))
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'absent':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'late':
        return <Clock className="w-5 h-5 text-yellow-600" />;
      default:
        return null;
    }
  };

  const getStatusCounts = () => {
    const counts = { present: 0, absent: 0, late: 0 };
    attendanceRecords.forEach(record => {
      if (record.attendance?.status) {
        counts[record.attendance.status]++;
      }
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
            <p className="text-gray-600 mt-1">Record daily attendance for students</p>
          </div>
          <div className="mt-4 sm:mt-0 flex items-center space-x-2">
            {attendanceRecords.length > 0 && (
              <button
                onClick={markAllPresent}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                Mark All Present
              </button>
            )}
            <button
              onClick={handleSaveAttendance}
              disabled={saving || attendanceRecords.length === 0}
              className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
            >
              <Save className="w-5 h-5" />
              <span>{saving ? 'Saving...' : 'Save Attendance'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Class
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white"
              >
                <option value="">Select Class</option>
                {classes.map((cls) => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {attendanceRecords.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{statusCounts.present}</div>
              <div className="text-sm text-green-700">Present</div>
            </div>
            <div className="bg-red-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{statusCounts.absent}</div>
              <div className="text-sm text-red-700">Absent</div>
            </div>
            <div className="bg-yellow-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.late}</div>
              <div className="text-sm text-yellow-700">Late</div>
            </div>
          </div>
        )}
      </div>

      {/* Attendance List */}
      {loading ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-12 border border-white/20 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading students...</p>
        </div>
      ) : attendanceRecords.length === 0 ? (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-12 border border-white/20 text-center">
          <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No Students Found</h3>
          <p className="text-gray-500 mt-1">
            {selectedClass ? 'No students found in the selected class.' : 'Please select a class and date to view students.'}
          </p>
        </div>
      ) : (
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Present
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Absent
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Late
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Remarks
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white/50 divide-y divide-gray-200">
                {attendanceRecords.map((record) => (
                  <tr key={record.student._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(record.attendance?.status || 'present')}
                        <div>
                          <div className="text-sm font-medium text-gray-900">{record.student.name}</div>
                          <div className="text-sm text-gray-500">Roll: {record.student.rollNumber}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="radio"
                        name={`attendance-${record.student._id}`}
                        value="present"
                        checked={record.attendance?.status === 'present'}
                        onChange={() => handleAttendanceChange(record.student._id, 'present')}
                        className="h-4 w-4 text-green-600 focus:ring-green-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="radio"
                        name={`attendance-${record.student._id}`}
                        value="absent"
                        checked={record.attendance?.status === 'absent'}
                        onChange={() => handleAttendanceChange(record.student._id, 'absent')}
                        className="h-4 w-4 text-red-600 focus:ring-red-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <input
                        type="radio"
                        name={`attendance-${record.student._id}`}
                        value="late"
                        checked={record.attendance?.status === 'late'}
                        onChange={() => handleAttendanceChange(record.student._id, 'late')}
                        className="h-4 w-4 text-yellow-600 focus:ring-yellow-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="text"
                        value={record.attendance?.remarks || ''}
                        onChange={(e) => handleRemarksChange(record.student._id, e.target.value)}
                        placeholder="Optional remarks"
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};