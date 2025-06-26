import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, MapPin, Calendar, TrendingUp, User } from 'lucide-react';
import { studentsAPI, attendanceAPI } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import toast from 'react-hot-toast';

interface Student {
  _id: string;
  name: string;
  rollNumber: string;
  class: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  address?: string;
  dateOfBirth?: string;
  enrollmentDate: string;
}

interface StudentStats {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  attendancePercentage: string;
}

interface AttendanceRecord {
  _id: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  remarks?: string;
}

export const StudentProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [student, setStudent] = useState<Student | null>(null);
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadStudentData();
      loadRecentAttendance();
    }
  }, [id]);

  const loadStudentData = async () => {
    try {
      const response = await studentsAPI.getById(id!);
      setStudent(response.data.student);
      setStats(response.data.stats);
    } catch (error) {
      toast.error('Failed to load student data');
    } finally {
      setLoading(false);
    }
  };

  const loadRecentAttendance = async () => {
    try {
      const response = await attendanceAPI.getHistory({ 
        studentId: id,
        limit: 10
      });
      setRecentAttendance(response.data.attendance);
    } catch (error) {
      console.error('Failed to load recent attendance');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!student || !stats) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Student not found</h3>
        <Link to="/students" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          ← Back to Students
        </Link>
      </div>
    );
  }

  const pieData = [
    { name: 'Present', value: stats.presentDays, color: '#10B981' },
    { name: 'Absent', value: stats.absentDays, color: '#EF4444' },
    { name: 'Late', value: stats.lateDays, color: '#F59E0B' },
  ];

  const getStatusBadge = (status: string) => {
    const styles = {
      present: 'bg-green-100 text-green-800',
      absent: 'bg-red-100 text-red-800',
      late: 'bg-yellow-100 text-yellow-800',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link 
              to="/students"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
              <p className="text-gray-600">Roll Number: {student.rollNumber} • Class: {student.class}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-blue-600">{stats.attendancePercentage}%</div>
            <div className="text-sm text-gray-500">Attendance Rate</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Information */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <User className="w-5 h-5 mr-2" />
            Student Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Parent Name</label>
              <p className="text-gray-900">{student.parentName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Email</label>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{student.parentEmail}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Phone</label>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{student.parentPhone}</p>
              </div>
            </div>
            {student.address && (
              <div>
                <label className="text-sm font-medium text-gray-500">Address</label>
                <div className="flex items-start space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-1" />
                  <p className="text-gray-900">{student.address}</p>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-gray-500">Enrollment Date</label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <p className="text-gray-900">{new Date(student.enrollmentDate).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Statistics */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Attendance Statistics
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
              <div className="text-sm text-green-700">Present</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.absentDays}</div>
              <div className="text-sm text-red-700">Absent</div>
            </div>
            <div className="text-center p-3 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.lateDays}</div>
              <div className="text-sm text-yellow-700">Late</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalDays}</div>
              <div className="text-sm text-blue-700">Total Days</div>
            </div>
          </div>

          {stats.totalDays > 0 && (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Recent Attendance */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance</h3>
          {recentAttendance.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No attendance records yet</p>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {recentAttendance.map((record) => (
                <div key={record._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(record.date).toLocaleDateString()}
                    </div>
                    {record.remarks && (
                      <div className="text-xs text-gray-500">{record.remarks}</div>
                    )}
                  </div>
                  {getStatusBadge(record.status)}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};