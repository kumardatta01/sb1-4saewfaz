import React, { useState, useEffect } from 'react';
import { Save, School, Clock, Mail, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { settingsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Settings {
  schoolName: string;
  schoolHours: {
    start: string;
    end: string;
  };
  holidays: Array<{
    date: string;
    name: string;
  }>;
  emailSettings: {
    enabled: boolean;
    template: string;
  };
  smsSettings: {
    enabled: boolean;
    template: string;
  };
  classes: string[];
}

export const Settings: React.FC = () => {
  const [settings, setSettings] = useState<Settings>({
    schoolName: '',
    schoolHours: { start: '08:00', end: '15:00' },
    holidays: [],
    emailSettings: { enabled: true, template: '' },
    smsSettings: { enabled: false, template: '' },
    classes: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newHoliday, setNewHoliday] = useState({ date: '', name: '' });
  const [newClass, setNewClass] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await settingsAPI.get();
      setSettings(response.data);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsAPI.update(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const addHoliday = () => {
    if (newHoliday.date && newHoliday.name) {
      setSettings({
        ...settings,
        holidays: [...settings.holidays, newHoliday],
      });
      setNewHoliday({ date: '', name: '' });
    }
  };

  const removeHoliday = (index: number) => {
    setSettings({
      ...settings,
      holidays: settings.holidays.filter((_, i) => i !== index),
    });
  };

  const addClass = () => {
    if (newClass && !settings.classes.includes(newClass)) {
      setSettings({
        ...settings,
        classes: [...settings.classes, newClass],
      });
      setNewClass('');
    }
  };

  const removeClass = (className: string) => {
    setSettings({
      ...settings,
      classes: settings.classes.filter(c => c !== className),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600 mt-1">Configure system preferences and notifications</p>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 font-medium"
          >
            <Save className="w-5 h-5" />
            <span>{saving ? 'Saving...' : 'Save Settings'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* School Information */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <School className="w-5 h-5 mr-2" />
            School Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                School Name
              </label>
              <input
                type="text"
                value={settings.schoolName}
                onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* School Hours */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            School Hours
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={settings.schoolHours.start}
                onChange={(e) => setSettings({
                  ...settings,
                  schoolHours: { ...settings.schoolHours, start: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={settings.schoolHours.end}
                onChange={(e) => setSettings({
                  ...settings,
                  schoolHours: { ...settings.schoolHours, end: e.target.value }
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Classes */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Classes</h3>
          <div className="space-y-4">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newClass}
                onChange={(e) => setNewClass(e.target.value)}
                placeholder="Add new class"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={addClass}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {settings.classes.map((className) => (
                <div key={className} className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                  <span>{className}</span>
                  <button
                    onClick={() => removeClass(className)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Holidays */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Holidays</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={newHoliday.date}
                onChange={(e) => setNewHoliday({ ...newHoliday, date: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newHoliday.name}
                  onChange={(e) => setNewHoliday({ ...newHoliday, name: e.target.value })}
                  placeholder="Holiday name"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  onClick={addHoliday}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {settings.holidays.map((holiday, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{holiday.name}</div>
                    <div className="text-sm text-gray-500">{new Date(holiday.date).toLocaleDateString()}</div>
                  </div>
                  <button
                    onClick={() => removeHoliday(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Email Settings */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2" />
            Email Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.emailSettings.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  emailSettings: { ...settings.emailSettings, enabled: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Enable email notifications</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Template
              </label>
              <textarea
                value={settings.emailSettings.template}
                onChange={(e) => setSettings({
                  ...settings,
                  emailSettings: { ...settings.emailSettings, template: e.target.value }
                })}
                rows={4}
                placeholder="Use {{parentName}}, {{studentName}}, {{status}}, {{date}} as placeholders"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* SMS Settings */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg p-6 border border-white/20">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            SMS Notifications
          </h3>
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={settings.smsSettings.enabled}
                onChange={(e) => setSettings({
                  ...settings,
                  smsSettings: { ...settings.smsSettings, enabled: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700">Enable SMS notifications</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMS Template
              </label>
              <textarea
                value={settings.smsSettings.template}
                onChange={(e) => setSettings({
                  ...settings,
                  smsSettings: { ...settings.smsSettings, template: e.target.value }
                })}
                rows={4}
                placeholder="Use {{parentName}}, {{studentName}}, {{status}}, {{date}} as placeholders"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};