import React from 'react';
import { useApp } from '../../context/AppContext';
import { computePedagogicalAlerts } from '../../services/calculations';
import { X, AlertCircle, AlertTriangle, UserX, Award, ShieldAlert, CheckCheck, RotateCcw } from 'lucide-react';

interface PedagogyAlertsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PedagogyAlertsModal: React.FC<PedagogyAlertsModalProps> = ({ isOpen, onClose }) => {
  const { data, openStudentProfile, readAlertIds, markAllAlertsAsRead, restoreAllAlerts, t } = useApp();

  if (!isOpen) return null;

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

  const unreadCount = allAlertItemIds.filter((id) => !readAlertIds.includes(id)).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-3 sm:p-4 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white p-4 sm:p-6 shadow-2xl ring-1 ring-slate-200 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 sm:pb-4 gap-3">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-slate-800 truncate">
                  {t.dashboard.pedagogicalAlerts}
                </h3>
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-rose-700">
                    {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCheck className="h-3.5 w-3.5" />
                    Toutes lues
                  </span>
                )}
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                Suivi proactif des élèves nécessitant une attention
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 w-full sm:w-auto">
            {unreadCount > 0 ? (
              <button
                onClick={() => markAllAlertsAsRead(allAlertItemIds)}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200/80 px-3 py-1.5 text-xs font-bold text-blue-700 transition-colors cursor-pointer flex-1 sm:flex-initial"
                title={t.dashboard.markAllAsRead}
              >
                <CheckCheck className="h-4 w-4 text-blue-600" />
                <span>{t.dashboard.markAllAsRead}</span>
              </button>
            ) : (
              readAlertIds.length > 0 && (
                <button
                  onClick={restoreAllAlerts}
                  className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition-colors cursor-pointer flex-1 sm:flex-initial"
                  title={t.dashboard.restoreAlerts}
                >
                  <RotateCcw className="h-4 w-4 text-slate-500" />
                  <span>{t.dashboard.restoreAlerts}</span>
                </button>
              )
            )}

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 cursor-pointer shrink-0"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {allAlertItemIds.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                ✓
              </div>
              <p className="font-semibold text-slate-700">{t.dashboard.noAlerts}</p>
            </div>
          ) : (
            <>
              {/* Absences alerts */}
              {alerts.absenceAlerts.length > 0 && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-rose-800 mb-3">
                    <UserX className="h-4 w-4" />
                    Absences répétées (3 absences ou plus) ({alerts.absenceAlerts.length})
                  </h4>
                  <div className="space-y-2">
                    {alerts.absenceAlerts.map(({ student, count }) => {
                      const cl = data.classes.find((c) => c.id === student.classId);
                      return (
                        <div
                          key={student.id}
                          onClick={() => {
                            openStudentProfile(student.id);
                            onClose();
                          }}
                          className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-rose-50 cursor-pointer border border-rose-100"
                        >
                          <div>
                            <span className="font-bold text-slate-900">
                              {student.lastName} {student.firstName}
                            </span>
                            <span className="ms-2 text-slate-500">
                              ({cl?.name} • Gr.{student.group})
                            </span>
                          </div>
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-700">
                            {count} absences
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Low grades alerts */}
              {alerts.lowGradeAlerts.length > 0 && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/40 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-amber-800 mb-3">
                    <Award className="h-4 w-4" />
                    Moyennes faibles (inférieures à 10/20) ({alerts.lowGradeAlerts.length})
                  </h4>
                  <div className="space-y-2">
                    {alerts.lowGradeAlerts.map(({ student, average }) => {
                      const cl = data.classes.find((c) => c.id === student.classId);
                      return (
                        <div
                          key={student.id}
                          onClick={() => {
                            openStudentProfile(student.id);
                            onClose();
                          }}
                          className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-amber-50 cursor-pointer border border-amber-100"
                        >
                          <div>
                            <span className="font-bold text-slate-900">
                              {student.lastName} {student.firstName}
                            </span>
                            <span className="ms-2 text-slate-500">
                              ({cl?.name} • Gr.{student.group})
                            </span>
                          </div>
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 font-bold text-amber-800">
                            Moyenne : {average}/20
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Discipline alerts */}
              {alerts.disciplineAlerts.length > 0 && (
                <div className="rounded-xl border border-purple-200 bg-purple-50/40 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-purple-800 mb-3">
                    <ShieldAlert className="h-4 w-4" />
                    Observations disciplinaires récurrentes ({alerts.disciplineAlerts.length})
                  </h4>
                  <div className="space-y-2">
                    {alerts.disciplineAlerts.map(({ student, count }) => {
                      const cl = data.classes.find((c) => c.id === student.classId);
                      return (
                        <div
                          key={student.id}
                          onClick={() => {
                            openStudentProfile(student.id);
                            onClose();
                          }}
                          className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-purple-50 cursor-pointer border border-purple-100"
                        >
                          <div>
                            <span className="font-bold text-slate-900">
                              {student.lastName} {student.firstName}
                            </span>
                            <span className="ms-2 text-slate-500">
                              ({cl?.name} • Gr.{student.group})
                            </span>
                          </div>
                          <span className="rounded-full bg-purple-100 px-2 py-0.5 font-bold text-purple-700">
                            {count} remarques
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Incomplete evaluations alerts */}
              {alerts.incompleteGradeAlerts.length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-4">
                  <h4 className="flex items-center gap-2 text-sm font-bold text-blue-800 mb-3">
                    <AlertCircle className="h-4 w-4" />
                    Évaluations incomplètes en attente ({alerts.incompleteGradeAlerts.length})
                  </h4>
                  <div className="space-y-2">
                    {alerts.incompleteGradeAlerts.map(({ student }) => {
                      const cl = data.classes.find((c) => c.id === student.classId);
                      return (
                        <div
                          key={student.id}
                          onClick={() => {
                            openStudentProfile(student.id);
                            onClose();
                          }}
                          className="flex items-center justify-between rounded-lg bg-white p-2.5 text-xs font-medium text-slate-700 shadow-xs hover:bg-blue-50 cursor-pointer border border-blue-100"
                        >
                          <div>
                            <span className="font-bold text-slate-900">
                              {student.lastName} {student.firstName}
                            </span>
                            <span className="ms-2 text-slate-500">
                              ({cl?.name} • Gr.{student.group})
                            </span>
                          </div>
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 font-bold text-blue-700">
                            Notes à compléter
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
