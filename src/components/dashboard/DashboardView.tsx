import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users2,
  GraduationCap,
  Layers,
  Calendar,
  Clock,
  CheckSquare,
  Award,
  ShieldAlert,
  ArrowRight,
  Printer,
  AlertTriangle,
  UserCheck,
  UserX,
  CheckCheck,
  RotateCcw,
} from 'lucide-react';
import { computePedagogicalAlerts } from '../../services/calculations';

interface DashboardViewProps {
  onOpenAlerts: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ onOpenAlerts }) => {
  const {
    data,
    setActiveTab,
    startAttendanceForSession,
    openStudentProfile,
    readAlertIds,
    markAllAlertsAsRead,
    restoreAllAlerts,
    t,
  } = useApp();

  // Stats
  const totalClasses = data.classes.length;
  const totalStudents = data.students.length;
  const totalGroups = totalClasses * 2;
  const scheduledSessions = data.timetable.length;

  // Next session determination
  const now = new Date();
  const currentDayOfWeek = now.getDay() === 0 ? 7 : now.getDay(); // 1 = Monday
  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const todaySessions = data.timetable
    .filter((s) => s.dayOfWeek === currentDayOfWeek)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const upcomingSession =
    todaySessions.find((s) => s.startTime >= currentTimeStr) ||
    todaySessions[0] ||
    data.timetable[0];

  const upcomingClass = upcomingSession
    ? data.classes.find((c) => c.id === upcomingSession.classId)
    : null;

  // Recent attendances
  const recentAttendances = [...data.attendances].slice(0, 3);

  // Recent disciplines
  const recentDisciplines = [...data.disciplines].slice(0, 4);

  // Alerts
  const alerts = computePedagogicalAlerts(
    data.students,
    data.attendances,
    data.grades,
    data.disciplines,
    data.settings
  );

  const allAlertItemIds = [
    ...alerts.absenceAlerts.map((a) => `absence-${a.student.id}`),
    ...alerts.lowGradeAlerts.map((a) => `grade-${a.student.id}`),
    ...alerts.disciplineAlerts.map((a) => `disc-${a.student.id}`),
    ...alerts.incompleteGradeAlerts.map((a) => `inc-${a.student.id}`),
  ];

  const unreadAlertItemIds = allAlertItemIds.filter(
    (id) => !readAlertIds.includes(id)
  );

  const unreadAbsenceAlerts = alerts.absenceAlerts.filter(
    (a) => !readAlertIds.includes(`absence-${a.student.id}`)
  );
  const unreadLowGradeAlerts = alerts.lowGradeAlerts.filter(
    (a) => !readAlertIds.includes(`grade-${a.student.id}`)
  );
  const unreadDisciplineAlerts = alerts.disciplineAlerts.filter(
    (a) => !readAlertIds.includes(`disc-${a.student.id}`)
  );
  const unreadIncompleteAlerts = alerts.incompleteGradeAlerts.filter(
    (a) => !readAlertIds.includes(`inc-${a.student.id}`)
  );

  const totalUnreadAlerts = unreadAlertItemIds.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 p-4 sm:p-6 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-white/20 px-2.5 sm:px-3 py-1 text-[11px] sm:text-xs font-semibold backdrop-blur-md">
              {data.settings.academicYear} • {data.settings.schoolName}
            </span>
            <h2 className="mt-2 text-xl font-black sm:text-3xl">
              {t.dashboard.welcome}, {data.settings.teacherName}
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-blue-100 max-w-xl">
              Espace de gestion pédagogique, suivi des présences, évaluations et accompagnement individuel de vos élèves.
            </p>
          </div>

          <div className="flex flex-col xs:flex-row gap-2 sm:gap-2.5 w-full md:w-auto">
            <button
              onClick={() => setActiveTab('attendance')}
              className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs sm:text-sm font-bold text-blue-600 shadow-md hover:bg-blue-50 transition-all active:scale-95"
            >
              <CheckSquare className="h-4 w-4" />
              <span>{t.dashboard.takeAttendance}</span>
            </button>
            <button
              onClick={() => setActiveTab('grades')}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-500/30 px-4 py-2.5 text-xs sm:text-sm font-bold text-white backdrop-blur-md hover:bg-blue-500/40 transition-all active:scale-95 border border-white/20"
            >
              <Award className="h-4 w-4" />
              <span>{t.dashboard.enterGrades}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Summary Cards */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Classes */}
        <div
          onClick={() => setActiveTab('classes')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.dashboard.totalClasses}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
              <Users2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalClasses}</span>
            <span className="text-xs text-slate-500">actives</span>
          </div>
        </div>

        {/* Students */}
        <div
          onClick={() => setActiveTab('students')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-emerald-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.dashboard.totalStudents}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <GraduationCap className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalStudents}</span>
            <span className="text-xs text-slate-500">inscrits</span>
          </div>
        </div>

        {/* Groups */}
        <div
          onClick={() => setActiveTab('classes')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.dashboard.totalGroups}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600 group-hover:scale-110 transition-transform">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalGroups}</span>
            <span className="text-xs text-slate-500">(2 par classe)</span>
          </div>
        </div>

        {/* Sessions */}
        <div
          onClick={() => setActiveTab('timetable')}
          className="group cursor-pointer rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:border-amber-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {t.dashboard.scheduledSessions}
            </span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600 group-hover:scale-110 transition-transform">
              <Calendar className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{scheduledSessions}</span>
            <span className="text-xs text-slate-500">par semaine</span>
          </div>
        </div>
      </div>

      {/* Center 2-Column: Next Session & Pedagogical Alerts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Next Session Card (Section 2.1) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                {t.dashboard.nextSession}
              </h3>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                Aujourd'hui
              </span>
            </div>

            {upcomingSession && upcomingClass ? (
              <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/50 to-indigo-50/30 p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-lg font-black text-slate-900">
                      {upcomingClass.name}
                    </h4>
                    <p className="text-sm font-semibold text-blue-600">
                      {upcomingSession.subject}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                      <span className="rounded-md bg-white px-2 py-1 font-medium shadow-2xs border border-slate-100">
                        {upcomingSession.targetGroup === 'all'
                          ? 'Classe entière'
                          : `Groupe ${upcomingSession.targetGroup}`}
                      </span>
                      <span className="rounded-md bg-white px-2 py-1 font-medium shadow-2xs border border-slate-100">
                        {upcomingSession.startTime} - {upcomingSession.endTime}
                      </span>
                      {upcomingSession.room && (
                        <span className="rounded-md bg-white px-2 py-1 font-medium shadow-2xs border border-slate-100">
                          {upcomingSession.room}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-blue-100/60 flex flex-col sm:flex-row gap-2.5 sm:items-center sm:justify-between">
                  <span className="text-xs text-slate-500">
                    Liaison directe avec l'appel de classe
                  </span>
                  <button
                    onClick={() => startAttendanceForSession(upcomingSession.id)}
                    className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 sm:py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition-colors shadow-xs w-full sm:w-auto"
                  >
                    <CheckSquare className="h-3.5 w-3.5" />
                    <span>Faire l'appel maintenant</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-400">
                {t.dashboard.noNextSession}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
            <button
              onClick={() => setActiveTab('timetable')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Voir l'emploi du temps complet &rarr;
            </button>
          </div>
        </div>

        {/* Pedagogical Alerts Card (Section 16.5) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {t.dashboard.pedagogicalAlerts}
              </h3>
              <div className="flex items-center gap-2">
                {totalUnreadAlerts > 0 ? (
                  <button
                    onClick={() => markAllAlertsAsRead(allAlertItemIds)}
                    className="flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-700 transition-colors cursor-pointer"
                    title={t.dashboard.markAllAsRead}
                  >
                    <CheckCheck className="h-3.5 w-3.5 text-blue-600" />
                    <span>{t.dashboard.markAllAsRead}</span>
                  </button>
                ) : (
                  readAlertIds.length > 0 && (
                    <button
                      onClick={restoreAllAlerts}
                      className="flex items-center gap-1 rounded-lg bg-slate-100 hover:bg-slate-200 px-2.5 py-1 text-[11px] font-bold text-slate-600 transition-colors cursor-pointer"
                      title={t.dashboard.restoreAlerts}
                    >
                      <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
                      <span>{t.dashboard.restoreAlerts}</span>
                    </button>
                  )
                )}

                <button
                  onClick={onOpenAlerts}
                  className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  Tout voir ({allAlertItemIds.length})
                </button>
              </div>
            </div>

            {totalUnreadAlerts === 0 && allAlertItemIds.length > 0 ? (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-center">
                <p className="text-xs font-bold text-emerald-800 flex items-center justify-center gap-1.5">
                  <CheckCheck className="h-4 w-4 text-emerald-600" />
                  <span>{t.dashboard.allAlertsRead}</span>
                </p>
                <button
                  onClick={onOpenAlerts}
                  className="mt-2 text-[11px] font-bold text-emerald-700 underline"
                >
                  Consulter quand même le détail ({allAlertItemIds.length})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div
                  onClick={onOpenAlerts}
                  className="cursor-pointer rounded-xl border border-rose-100 bg-rose-50/60 p-3 hover:bg-rose-100/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-rose-700">
                      {unreadAbsenceAlerts.length}
                    </span>
                    <UserX className="h-4 w-4 text-rose-500" />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-rose-900">
                    {t.dashboard.alertAbsences}
                  </p>
                </div>

                <div
                  onClick={onOpenAlerts}
                  className="cursor-pointer rounded-xl border border-amber-100 bg-amber-50/60 p-3 hover:bg-amber-100/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-amber-700">
                      {unreadLowGradeAlerts.length}
                    </span>
                    <Award className="h-4 w-4 text-amber-500" />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-amber-900">
                    {t.dashboard.alertLowGrades}
                  </p>
                </div>

                <div
                  onClick={onOpenAlerts}
                  className="cursor-pointer rounded-xl border border-purple-100 bg-purple-50/60 p-3 hover:bg-purple-100/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-purple-700">
                      {unreadDisciplineAlerts.length}
                    </span>
                    <ShieldAlert className="h-4 w-4 text-purple-500" />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-purple-900">
                    {t.dashboard.alertDiscipline}
                  </p>
                </div>

                <div
                  onClick={onOpenAlerts}
                  className="cursor-pointer rounded-xl border border-blue-100 bg-blue-50/60 p-3 hover:bg-blue-100/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-blue-700">
                      {unreadIncompleteAlerts.length}
                    </span>
                    <Award className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="mt-1 text-xs font-semibold text-blue-900">
                    {t.dashboard.alertIncompleteGrades}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 flex items-center justify-between">
            <span>Signale automatiquement les élèves nécessitant un suivi particulier.</span>
            {totalUnreadAlerts > 0 && (
              <span className="font-bold text-amber-600">
                {totalUnreadAlerts} non lue{totalUnreadAlerts > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bottom 2-Column: Recent Attendance & Recent Discipline */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Attendance */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-emerald-600" />
              {t.dashboard.recentAttendance}
            </h3>
            <button
              onClick={() => setActiveTab('attendance')}
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              Historique complet &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentAttendances.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Aucun appel enregistré pour l'instant</p>
            ) : (
              recentAttendances.map((att) => {
                const cl = data.classes.find((c) => c.id === att.classId);
                const absents = att.records.filter((r) => r.status === 'absent').length;
                const presents = att.records.filter((r) => r.status === 'present').length;
                return (
                  <div
                    key={att.id}
                    onClick={() => setActiveTab('attendance')}
                    className="flex items-center justify-between rounded-xl border border-slate-100 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-sm">
                        {cl?.name || 'Classe'} • {att.group === 'all' ? 'Tous' : `Gr. ${att.group}`}
                      </span>
                      <p className="text-xs text-slate-500">
                        {att.date} • {att.startTime} - {att.endTime} ({att.subject})
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-bold text-emerald-700">
                        {presents} Présents
                      </span>
                      {absents > 0 && (
                        <span className="rounded-md bg-rose-50 px-2 py-0.5 text-xs font-bold text-rose-700">
                          {absents} Absents
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Disciplinary Observations */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              {t.dashboard.recentDiscipline}
            </h3>
            <button
              onClick={() => setActiveTab('discipline')}
              className="text-xs font-bold text-rose-600 hover:text-rose-700"
            >
              Toutes les observations &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {recentDisciplines.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">Aucune observation enregistrée</p>
            ) : (
              recentDisciplines.map((d) => {
                const st = data.students.find((s) => s.id === d.studentId);
                const isPositive =
                  d.category === 'Comportement positif' || d.category === 'Félicitations';
                return (
                  <div
                    key={d.id}
                    onClick={() => {
                      if (st) openStudentProfile(st.id);
                    }}
                    className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-sm">
                        {st ? `${st.lastName} ${st.firstName}` : 'Élève'}
                      </span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                          isPositive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {d.category}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-600 line-clamp-1">
                      {d.description}
                    </p>
                    <span className="mt-1 block text-[10px] text-slate-400">{d.date}</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
