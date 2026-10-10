import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SessionSchedule } from '../../types';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  CheckSquare,
  Trash2,
  Edit2,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const TimetableView: React.FC = () => {
  const {
    data,
    addTimetableSession,
    updateTimetableSession,
    deleteTimetableSession,
    startAttendanceForSession,
    t,
  } = useApp();

  const [activeView, setActiveView] = useState<'week' | 'day' | 'class' | 'group'>('week');
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Monday
  const [filterClassId, setFilterClassId] = useState<string>('all');
  const [filterGroup, setFilterGroup] = useState<1 | 2 | 'all'>('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<SessionSchedule | null>(null);

  // Form states
  const [dayOfWeek, setDayOfWeek] = useState<number>(1);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('09:00');
  const [classId, setClassId] = useState(data.classes[0]?.id || '');
  const [targetGroup, setTargetGroup] = useState<'all' | 1 | 2>('all');
  const [subject, setSubject] = useState(data.settings.mainSubject || '');
  const [room, setRoom] = useState('');

  const daysOfWeek = [
    { id: 1, name: 'Lundi' },
    { id: 2, name: 'Mardi' },
    { id: 3, name: 'Mercredi' },
    { id: 4, name: 'Jeudi' },
    { id: 5, name: 'Vendredi' },
    { id: 6, name: 'Samedi' },
  ];

  const handleOpenAdd = (dayPreset?: number) => {
    setEditingSession(null);
    setDayOfWeek(dayPreset || 1);
    setStartTime('08:00');
    setEndTime('09:00');
    setClassId(data.classes[0]?.id || '');
    setTargetGroup('all');
    setSubject(data.settings.mainSubject || 'Mathématiques');
    setRoom('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: SessionSchedule) => {
    setEditingSession(s);
    setDayOfWeek(s.dayOfWeek);
    setStartTime(s.startTime);
    setEndTime(s.endTime);
    setClassId(s.classId);
    setTargetGroup(s.targetGroup);
    setSubject(s.subject);
    setRoom(s.room || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !subject.trim()) return;

    if (editingSession) {
      updateTimetableSession(editingSession.id, {
        dayOfWeek,
        startTime,
        endTime,
        classId,
        targetGroup,
        subject: subject.trim(),
        room: room.trim(),
      });
    } else {
      addTimetableSession({
        dayOfWeek,
        startTime,
        endTime,
        classId,
        targetGroup,
        subject: subject.trim(),
        room: room.trim(),
      });
    }
    setIsModalOpen(false);
  };

  // Filtered sessions
  const filteredSessions = data.timetable.filter((s) => {
    if (filterClassId !== 'all' && s.classId !== filterClassId) return false;
    if (filterGroup !== 'all' && s.targetGroup !== 'all' && s.targetGroup !== filterGroup)
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Title & View Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            {t.timetable.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.timetable.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveView('week')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeView === 'week'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.timetable.weekView}
            </button>
            <button
              onClick={() => setActiveView('day')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeView === 'day'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.timetable.dayView}
            </button>
            <button
              onClick={() => setActiveView('class')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeView === 'class'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.timetable.byClassView}
            </button>
            <button
              onClick={() => setActiveView('group')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                activeView === 'group'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.timetable.byGroupView}
            </button>
          </div>

          <button
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>{t.timetable.addSession}</span>
          </button>
        </div>
      </div>

      {/* Secondary filter bar for class and group */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Filtrer par classe :</span>
          <select
            value={filterClassId}
            onChange={(e) => setFilterClassId(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="all">Toutes les classes</option>
            {data.classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <span className="text-xs font-bold text-slate-400 ms-2">Groupe :</span>
          <select
            value={filterGroup}
            onChange={(e) =>
              setFilterGroup(e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2))
            }
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="all">Tous les groupes</option>
            <option value="1">Groupe 1</option>
            <option value="2">Groupe 2</option>
          </select>
        </div>

        {activeView === 'day' && (
          <div className="flex items-center gap-1">
            {daysOfWeek.map((d) => (
              <button
                key={d.id}
                onClick={() => setSelectedDay(d.id)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  selectedDay === d.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {d.name.slice(0, 3)}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Week View Grid */}
      {activeView === 'week' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {daysOfWeek.map((day) => {
            const daySessions = filteredSessions
              .filter((s) => s.dayOfWeek === day.id)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={day.id}
                className="rounded-2xl border border-slate-200/80 bg-white shadow-xs flex flex-col min-h-[420px]"
              >
                <div className="border-b border-slate-100 bg-slate-50/75 px-4 py-3 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">{day.name}</h3>
                  <button
                    onClick={() => handleOpenAdd(day.id)}
                    className="rounded-md p-1 text-slate-400 hover:bg-blue-50 hover:text-blue-600"
                    title={`Ajouter une séance le ${day.name}`}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>

                <div className="p-3 space-y-3 flex-1 overflow-y-auto">
                  {daySessions.length === 0 ? (
                    <div className="py-12 text-center text-[11px] text-slate-400">
                      Aucune séance
                    </div>
                  ) : (
                    daySessions.map((session) => {
                      const cl = data.classes.find((c) => c.id === session.classId);
                      return (
                        <div
                          key={session.id}
                          className="rounded-xl border border-blue-100/80 bg-gradient-to-br from-blue-50/40 to-indigo-50/20 p-3 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-slate-900 text-xs">
                                {cl?.name || 'Classe'}
                              </span>
                              <span
                                className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  session.targetGroup === 'all'
                                    ? 'bg-slate-200 text-slate-700'
                                    : session.targetGroup === 1
                                    ? 'bg-blue-200 text-blue-800'
                                    : 'bg-indigo-200 text-indigo-800'
                                }`}
                              >
                                {session.targetGroup === 'all'
                                  ? 'Classe'
                                  : `Gr. ${session.targetGroup}`}
                              </span>
                            </div>

                            <p className="mt-1 text-xs font-semibold text-blue-700">
                              {session.subject}
                            </p>

                            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                              <span className="flex items-center gap-1 font-mono">
                                <Clock className="h-3 w-3 text-slate-400" />
                                {session.startTime} - {session.endTime}
                              </span>
                              {session.room && (
                                <span className="flex items-center gap-0.5">
                                  <MapPin className="h-3 w-3 text-slate-400" />
                                  {session.room}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 pt-2 border-t border-blue-100 flex items-center justify-between">
                            <button
                              onClick={() => startAttendanceForSession(session.id)}
                              className="flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-blue-700 transition-colors shadow-2xs"
                              title="Démarrer directement l'appel pour cette séance"
                            >
                              <CheckSquare className="h-3 w-3" />
                              <span>Faire l'appel</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleOpenEdit(session)}
                                className="rounded-md p-1 text-slate-400 hover:text-slate-700"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => deleteTimetableSession(session.id)}
                                className="rounded-md p-1 text-rose-400 hover:text-rose-600"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Day / Class / Group Views */}
      {activeView !== 'week' && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSessions
              .filter((s) => (activeView === 'day' ? s.dayOfWeek === selectedDay : true))
              .map((session) => {
                const cl = data.classes.find((c) => c.id === session.classId);
                const dayName = daysOfWeek.find((d) => d.id === session.dayOfWeek)?.name;
                return (
                  <div
                    key={session.id}
                    className="rounded-2xl border border-slate-200 p-4 hover:border-blue-300 transition-all shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                          {dayName} • {session.startTime} - {session.endTime}
                        </span>
                        <span className="rounded-full bg-blue-50 px-2 py-0.5 text-xs font-bold text-blue-700">
                          {session.targetGroup === 'all' ? 'Tous' : `Gr. ${session.targetGroup}`}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900">{cl?.name}</h4>
                      <p className="text-sm font-semibold text-blue-600">{session.subject}</p>
                      {session.room && (
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />
                          {session.room}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-center justify-between">
                      <button
                        onClick={() => startAttendanceForSession(session.id)}
                        className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                      >
                        <CheckSquare className="h-3.5 w-3.5" />
                        <span>Faire l'appel</span>
                      </button>
                      <button
                        onClick={() => deleteTimetableSession(session.id)}
                        className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Add / Edit Session Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {editingSession ? 'Modifier la séance' : t.timetable.addSession}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Chaque séance est directement liée au module d'appel et de présence.
            </p>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jour de la semaine *</label>
                <select
                  value={dayOfWeek}
                  onChange={(e) => setDayOfWeek(Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 focus:border-blue-500 focus:outline-none"
                >
                  {daysOfWeek.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Heure de début *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Heure de fin *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Classe concernée *</label>
                  <select
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  >
                    {data.classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Groupe concerné *</label>
                  <select
                    value={targetGroup}
                    onChange={(e) =>
                      setTargetGroup(
                        e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2)
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 px-3 py-2"
                  >
                    <option value="all">Classe entière</option>
                    <option value="1">Groupe 1</option>
                    <option value="2">Groupe 2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Matière enseignée *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex: Mathématiques, TP Informatique..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Salle (facultatif)</label>
                <input
                  type="text"
                  value={room}
                  onChange={(e) => setRoom(e.target.value)}
                  placeholder="Ex: Salle 12, Labo 3..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
