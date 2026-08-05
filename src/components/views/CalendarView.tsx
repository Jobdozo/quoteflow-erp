import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, Plus, MapPin, Phone, Users, CheckCircle2, X, Trash2, Inbox } from 'lucide-react';
import type { CalendarEvent } from '../../types';
import { StorageService } from '../../utils/storage';

export const CalendarView: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<CalendarEvent['type']>('Meeting');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState('10:00 AM');
  const [companyName, setCompanyName] = useState('');
  const [assignedTo, setAssignedTo] = useState('');

  useEffect(() => {
    setEvents(StorageService.getEvents());
  }, []);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvt: CalendarEvent = {
      id: `evt-${Date.now()}`,
      title,
      type,
      date,
      time,
      companyName: companyName || 'Client Site',
      assignedTo: assignedTo || 'Assigned Staff',
      status: 'Scheduled',
    };

    const updated = StorageService.saveEvent(newEvt);
    setEvents(updated);
    setShowModal(false);
    setTitle('');
    setCompanyName('');
    setAssignedTo('');
  };

  const handleDeleteEvent = (id: string) => {
    const updated = StorageService.deleteEvent(id);
    setEvents(updated);
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
      {events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                      evt.type === 'Site Visit'
                        ? 'bg-amber-100 text-amber-800'
                        : evt.type === 'Meeting'
                        ? 'bg-purple-100 text-purple-800'
                        : evt.type === 'Call'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {evt.type}
                  </span>
                  <span className="text-xs font-bold text-slate-500 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1 text-slate-400" />
                    {evt.time}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 mt-3">{evt.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{evt.companyName}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Assigned: {evt.assignedTo}</span>
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-indigo-600">{evt.date}</span>
                  <button
                    onClick={() => handleDeleteEvent(evt.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                    title="Delete Event"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 shadow-sm text-center max-w-md mx-auto space-y-3">
          <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">No Scheduled Activities</h3>
          <p className="text-xs text-slate-500">Your calendar is completely clean. Schedule meetings, site visits, or supervision calls below.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Schedule First Event</span>
          </button>
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <h3 className="font-bold text-slate-900 text-base flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5 text-indigo-600" />
                <span>Schedule New Activity</span>
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEvent} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Event Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Client Contract Meeting"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Activity Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as CalendarEvent['type'])}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  >
                    <option value="Meeting">Meeting</option>
                    <option value="Site Visit">Site Visit</option>
                    <option value="Call">Call</option>
                    <option value="Deadline">Deadline</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Time</label>
                  <input
                    type="text"
                    placeholder="10:30 AM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Company / Site</label>
                  <input
                    type="text"
                    placeholder="Client Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">Assigned Executive</label>
                <input
                  type="text"
                  placeholder="Executive Name"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20"
                >
                  Save Activity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
