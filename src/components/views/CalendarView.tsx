import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, MapPin, Phone, Users, CheckCircle2, X } from 'lucide-react';
import type { CalendarEvent } from '../../types';

export const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: 'evt-1',
      title: 'VMart Site Survey & Security Guard Audit',
      type: 'Site Visit',
      date: '2026-05-20',
      time: '10:30 AM',
      companyName: 'VMart Retail Ltd.',
      assignedTo: 'Rahul Verma',
      status: 'Scheduled',
    },
    {
      id: 'evt-2',
      title: 'Reliance Smart Superstore Contract Meeting',
      type: 'Meeting',
      date: '2026-05-21',
      time: '02:00 PM',
      companyName: 'Reliance Smart Superstore',
      assignedTo: 'Ankit Sharma',
      status: 'Scheduled',
    },
    {
      id: 'evt-3',
      title: 'DLF Cyber City - Guard Shift Supervision Call',
      type: 'Call',
      date: '2026-05-22',
      time: '11:00 AM',
      companyName: 'DLF Cyber City Developers',
      assignedTo: 'Sneha Gupta',
      status: 'Scheduled',
    },
    {
      id: 'evt-4',
      title: 'Amazon Fulfillment Center Proposal Deadline',
      type: 'Deadline',
      date: '2026-05-25',
      time: '05:00 PM',
      companyName: 'Amazon India Fulfillment Center',
      assignedTo: 'Ankit Sharma',
      status: 'Scheduled',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('Meeting');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [companyName, setCompanyName] = useState('VMart Retail Ltd.');
  const [assignedTo, setAssignedTo] = useState('Ankit Sharma');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title,
      type,
      date,
      time,
      companyName,
      assignedTo,
      status: 'Scheduled',
    };
    setEvents([newEvt, ...events]);
    setShowModal(false);
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Calendar & Activity Schedule</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Schedule site surveys, client contract meetings, supervision calls, and proposal deadlines.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-lg shadow-indigo-600/20 flex items-center space-x-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Event</span>
        </button>
      </div>

      {/* Events List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {events.map((evt) => (
          <div
            key={evt.id}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full ${
                    evt.type === 'Site Visit'
                      ? 'bg-amber-100 text-amber-800'
                      : evt.type === 'Meeting'
                      ? 'bg-indigo-100 text-indigo-800'
                      : evt.type === 'Call'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {evt.type.toUpperCase()}
                </span>
                <span className="text-xs font-semibold text-slate-400">{evt.time}</span>
              </div>

              <h3 className="font-bold text-slate-900 text-sm mt-2">{evt.title}</h3>
              <p className="text-xs text-slate-500 font-medium">{evt.companyName}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <span className="font-semibold text-slate-700">Assigned: {evt.assignedTo}</span>
              <span className="font-bold text-slate-900">{evt.date}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900">Schedule New Activity</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="mt-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Security Audit & Guard Roster Review"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Activity Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="Call">Customer Call</option>
                    <option value="Deadline">Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Client Company</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Time</label>
                  <input
                    type="text"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    placeholder="10:30 AM"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
