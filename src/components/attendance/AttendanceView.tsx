import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { AttendanceStatus, StudentAttendanceItem } from '../../types';
import {
  CheckSquare,
  UserCheck,
  UserX,
  Clock,
  ShieldCheck,
  Save,
  Printer,
  FileSpreadsheet,
  Calendar,
  History,
  CheckCircle2,
  Sparkles,
  Search,
} from 'lucide-react';
import { exportAttendanceToExcel } from '../../services/excel';

export const AttendanceView: React.FC = () => {
  const {
    data,
    saveAttendanceSheet,
    activeAttendanceSessionId,
    clearActiveAttendanceSession,
    openStudentProfile,
    t,
  } = useApp();

  // Active session or customized session selection
  const linkedSession = activeAttendanceSessionId
    ? data.timetable.find((s) => s.id === activeAttendanceSessionId)
    : null;

  const [classId, setClassId] = useState<string>(
    linkedSession?.classId || data.classes[0]?.id || ''
  );
  const [targetGroup, setTargetGroup] = useState<1 | 2 | 'all'>(
    linkedSession?.targetGroup || 1
  );
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState<string>(linkedSession?.startTime || '08:00');
  const [endTime, setEndTime] = useState<string>(linkedSession?.endTime || '09:00');
  const [subject, setSubject] = useState<string>(
    linkedSession?.subject || data.settings.mainSubject || 'Mathématiques'
  );
  const [room, setRoom] = useState<string>(linkedSession?.room || '');

  // Active view: 'sheet' | 'history' | 'recap'
  const [viewMode, setViewMode] = useState<'sheet' | 'history' | 'recap'>('sheet');
  const [savedSuccessBanner, setSavedSuccessBanner] = useState(false);

  // If redirected from Timetable
  useEffect(() => {
    if (linkedSession) {
      setClassId(linkedSession.classId);
      setTargetGroup(linkedSession.targetGroup);
      setStartTime(linkedSession.startTime);
      setEndTime(linkedSession.endTime);
      setSubject(linkedSession.subject);
      setRoom(linkedSession.room || '');
      clearActiveAttendanceSession();
    }
  }, [linkedSession, clearActiveAttendanceSession]);

  const activeClass = data.classes.find((c) => c.id === classId) || data.classes[0];

  const groupStudents = activeClass
    ? data.students
        .filter((s) => s.classId === activeClass.id)
        .filter((s) => (targetGroup === 'all' ? true : s.group === targetGroup))
    : [];

  // Attendance states for current sheet
  const [records, setRecords] = useState<Record<string, { status: AttendanceStatus; observation: string }>>({});

  // Check if there is an existing attendance saved for this date & slot
  useEffect(() => {
    const existing = data.attendances.find(
      (a) =>
        a.classId === classId &&
        a.date === date &&
        a.startTime === startTime &&
        a.group === targetGroup
    );

    const initialMap: Record<string, { status: AttendanceStatus; observation: string }> = {};

    groupStudents.forEach((student) => {
      const match = existing?.records.find((r) => r.studentId === student.id);
      if (match) {
        initialMap[student.id] = {
          status: match.status,
          observation: match.observation || '',
        };
      } else {
        initialMap[student.id] = {
          status: 'present',
          observation: '',
        };
      }
    });

    setRecords(initialMap);
  }, [classId, date, startTime, targetGroup, data.attendances]);

  // Status toggle cycle: present -> absent -> late -> excused -> present
  const cycleStatus = (studentId: string) => {
    setRecords((prev) => {
      const current = prev[studentId]?.status || 'present';
      let next: AttendanceStatus = 'present';
      if (current === 'present') next = 'absent';
      else if (current === 'absent') next = 'late';
      else if (current === 'late') next = 'excused';
      else next = 'present';

      return {
        ...prev,
        [studentId]: {
          ...prev[studentId],
          status: next,
        },
      };
    });
  };

  const setExplicitStatus = (studentId: string, status: AttendanceStatus) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const setObservation = (studentId: string, obs: string) => {
    setRecords((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        observation: obs,
      },
    }));
  };

  // "Tous présents" 1-click function (Section 5.1)
  const handleMarkAllPresent = () => {
    const updated: Record<string, { status: AttendanceStatus; observation: string }> = {};
    groupStudents.forEach((s) => {
      updated[s.id] = {
        status: 'present',
        observation: records[s.id]?.observation || '',
      };
    });
    setRecords(updated);
  };

  const handleSaveSheet = () => {
    if (!activeClass) return;

    const studentList: StudentAttendanceItem[] = groupStudents.map((s) => ({
      studentId: s.id,
      status: records[s.id]?.status || 'present',
      observation: records[s.id]?.observation || '',
    }));

    saveAttendanceSheet({
      classId: activeClass.id,
      group: targetGroup,
      date,
      startTime,
      endTime,
      subject,
      room,
      records: studentList,
    });

    setSavedSuccessBanner(true);
    setTimeout(() => setSavedSuccessBanner(false), 3000);
  };

  const handleExportExcel = () => {
    if (!activeClass) return;
    exportAttendanceToExcel(data.students.filter((s) => s.classId === activeClass.id), data.attendances, activeClass.name);
  };

  // Summary counts for current sheet
  let currentPresents = 0;
  let currentAbsents = 0;
  let currentLates = 0;
  let currentExcused = 0;

  groupStudents.forEach((s) => {
    const st = records[s.id]?.status || 'present';
    if (st === 'present') currentPresents++;
    else if (st === 'absent') currentAbsents++;
    else if (st === 'late') currentLates++;
    else if (st === 'excused') currentExcused++;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            {t.attendance.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.attendance.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('sheet')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'sheet'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Feuille d'Appel
            </button>
            <button
              onClick={() => setViewMode('history')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'history'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Historique des Séances
            </button>
            <button
              onClick={() => setViewMode('recap')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                viewMode === 'recap'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Bilan Récapitulatif
            </button>
          </div>

          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {savedSuccessBanner && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <span>{t.attendance.sessionSaved}</span>
          </div>
        </div>
      )}

      {/* Sheet Mode */}
      {viewMode === 'sheet' && (
        <div className="space-y-6">
          {/* Session Parameters Toolbar */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Classe *</label>
              <select
                value={classId}
                onChange={(e) => setClassId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold"
              >
                {data.classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Groupe *</label>
              <select
                value={targetGroup}
                onChange={(e) =>
                  setTargetGroup(
                    e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2)
                  )
                }
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold"
              >
                <option value={1}>Groupe 1</option>
                <option value={2}>Groupe 2</option>
                <option value="all">Classe entière</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Horaire</label>
              <div className="flex items-center gap-1">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center"
                />
                <span>-</span>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-600 mb-1">Matière / Salle</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Matière"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold"
              />
            </div>
          </div>

          {/* Quick Stats & Mark All Present Button */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-xl bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100">
                {currentPresents} Présents
              </span>
              <span className="rounded-xl bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 border border-rose-100">
                {currentAbsents} Absents
              </span>
              <span className="rounded-xl bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-100">
                {currentLates} Retards
              </span>
              <span className="rounded-xl bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 border border-blue-100">
                {currentExcused} Justifiés
              </span>
            </div>

            <div className="flex items-center gap-2">
              {/* "Tous présents" button */}
              <button
                onClick={handleMarkAllPresent}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors shadow-2xs"
                title="Marquer l'ensemble du groupe comme présent en 1 clic"
              >
                <Sparkles className="h-4 w-4 text-emerald-600" />
                <span>{t.attendance.markAllPresent}</span>
              </button>

              <button
                onClick={handleSaveSheet}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
              >
                <Save className="h-4 w-4" />
                <span>Enregistrer l'Appel</span>
              </button>
            </div>
          </div>

          {/* Attendance Table (Section 5.1) */}
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3.5 text-center w-12">N°</th>
                    <th className="px-4 py-3.5">Nom et Prénom</th>
                    <th className="px-4 py-3.5 text-center w-72">Statut de Présence</th>
                    <th className="px-4 py-3.5">Observation (facultative)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {groupStudents.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-slate-400">
                        Aucun élève dans ce groupe
                      </td>
                    </tr>
                  ) : (
                    groupStudents.map((student) => {
                      const currentStatus = records[student.id]?.status || 'present';
                      const currentObs = records[student.id]?.observation || '';

                      return (
                        <tr
                          key={student.id}
                          className="hover:bg-slate-50/70 transition-colors"
                        >
                          <td className="px-4 py-3 text-center font-bold text-slate-400">
                            {student.orderNumber}
                          </td>

                          <td className="px-4 py-3">
                            <button
                              onClick={() => openStudentProfile(student.id)}
                              className="font-bold text-slate-900 hover:text-blue-600 transition-colors"
                            >
                              {student.lastName} {student.firstName}
                            </button>
                          </td>

                          <td className="px-4 py-3">
                            {/* Fast status selector buttons */}
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => setExplicitStatus(student.id, 'present')}
                                className={`flex-1 rounded-lg py-1.5 px-2 text-[11px] font-bold transition-all ${
                                  currentStatus === 'present'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                }`}
                              >
                                Présent
                              </button>
                              <button
                                onClick={() => setExplicitStatus(student.id, 'absent')}
                                className={`flex-1 rounded-lg py-1.5 px-2 text-[11px] font-bold transition-all ${
                                  currentStatus === 'absent'
                                    ? 'bg-rose-600 text-white shadow-xs'
                                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                                }`}
                              >
                                Absent
                              </button>
                              <button
                                onClick={() => setExplicitStatus(student.id, 'late')}
                                className={`flex-1 rounded-lg py-1.5 px-2 text-[11px] font-bold transition-all ${
                                  currentStatus === 'late'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                }`}
                              >
                                Retard
                              </button>
                              <button
                                onClick={() => setExplicitStatus(student.id, 'excused')}
                                className={`flex-1 rounded-lg py-1.5 px-2 text-[11px] font-bold transition-all ${
                                  currentStatus === 'excused'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                                }`}
                              >
                                Justifié
                              </button>
                            </div>
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="text"
                              value={currentObs}
                              onChange={(e) => setObservation(student.id, e.target.value)}
                              placeholder="Ex: Retard 10 min, motif médical..."
                              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none"
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* History Mode */}
      {viewMode === 'history' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
              <History className="h-5 w-5 text-blue-600" />
              Historique des séances d'appel enregistrées
            </h3>

            <div className="divide-y divide-slate-100">
              {data.attendances.length === 0 ? (
                <p className="py-8 text-center text-xs text-slate-400">
                  Aucun historique pour le moment
                </p>
              ) : (
                data.attendances.map((att) => {
                  const cl = data.classes.find((c) => c.id === att.classId);
                  const pCount = att.records.filter((r) => r.status === 'present').length;
                  const aCount = att.records.filter((r) => r.status === 'absent').length;
                  const lCount = att.records.filter((r) => r.status === 'late').length;
                  const eCount = att.records.filter((r) => r.status === 'excused').length;

                  return (
                    <div
                      key={att.id}
                      className="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-xl transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {cl?.name || 'Classe'} • {att.group === 'all' ? 'Classe entière' : `Groupe ${att.group}`}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {att.date}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {att.startTime} - {att.endTime} • {att.subject} {att.room && `• ${att.room}`}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="rounded-md bg-emerald-50 px-2 py-1 font-bold text-emerald-700">
                          {pCount} Présents
                        </span>
                        {aCount > 0 && (
                          <span className="rounded-md bg-rose-50 px-2 py-1 font-bold text-rose-700">
                            {aCount} Absents
                          </span>
                        )}
                        {lCount > 0 && (
                          <span className="rounded-md bg-amber-50 px-2 py-1 font-bold text-amber-700">
                            {lCount} Retards
                          </span>
                        )}
                        {eCount > 0 && (
                          <span className="rounded-md bg-blue-50 px-2 py-1 font-bold text-blue-700">
                            {eCount} Justifiés
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Recap Mode (Section 5.3) */}
      {viewMode === 'recap' && (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
          <div className="p-4 border-b border-slate-100 bg-slate-50/75 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">
              Tableau Récapitulatif Périodique des Présences — {activeClass?.name}
            </h3>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Imprimer A4</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 text-center w-12">N°</th>
                  <th className="px-4 py-3">Élève</th>
                  <th className="px-4 py-3 text-center">Groupe</th>
                  <th className="px-4 py-3 text-center">Présents</th>
                  <th className="px-4 py-3 text-center">Retards</th>
                  <th className="px-4 py-3 text-center">Absences</th>
                  <th className="px-4 py-3 text-center">Justifiés</th>
                  <th className="px-4 py-3 text-center">Taux Assiduité</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {groupStudents.map((s) => {
                  let p = 0;
                  let a = 0;
                  let l = 0;
                  let e = 0;
                  data.attendances.forEach((att) => {
                    const r = att.records.find((rec) => rec.studentId === s.id);
                    if (r) {
                      if (r.status === 'present') p++;
                      else if (r.status === 'absent') a++;
                      else if (r.status === 'late') l++;
                      else if (r.status === 'excused') e++;
                    }
                  });
                  const tot = p + a + l + e;
                  const rate = tot > 0 ? Math.round(((p + l) / tot) * 100) : 100;

                  return (
                    <tr key={s.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5 text-center font-bold text-slate-400">
                        {s.orderNumber}
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-900">
                        {s.lastName} {s.firstName}
                      </td>
                      <td className="px-4 py-2.5 text-center">Gr. {s.group}</td>
                      <td className="px-4 py-2.5 text-center text-emerald-600 font-bold">
                        {p}
                      </td>
                      <td className="px-4 py-2.5 text-center text-amber-600 font-bold">
                        {l}
                      </td>
                      <td className="px-4 py-2.5 text-center text-rose-600 font-bold">
                        {a}
                      </td>
                      <td className="px-4 py-2.5 text-center text-blue-600 font-bold">
                        {e}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 font-bold ${
                            rate >= 90
                              ? 'bg-emerald-100 text-emerald-800'
                              : rate >= 75
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {rate}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
