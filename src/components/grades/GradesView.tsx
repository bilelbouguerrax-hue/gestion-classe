import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { GradeRecord, Student, ActivityGrade } from '../../types';
import {
  Award,
  Plus,
  Trash2,
  FileSpreadsheet,
  Printer,
  Sparkles,
  ArrowUpDown,
  BookOpen,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { calculateRanks, calculateStudentGrade } from '../../services/calculations';
import { exportGradesToExcel } from '../../services/excel';

export const GradesView: React.FC = () => {
  const {
    data,
    updateGradeRecord,
    addActivityToStudent,
    deleteActivityFromStudent,
    openStudentProfile,
    t,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(
    data.classes[0]?.id || ''
  );
  const [selectedGroup, setSelectedGroup] = useState<1 | 2 | 'all'>('all');
  const [sortBy, setSortBy] = useState<'alpha' | 'rank'>('alpha');

  // Activities modal for a specific student
  const [managingActivitiesStudent, setManagingActivitiesStudent] = useState<Student | null>(null);
  const [newActivityTitle, setNewActivityTitle] = useState('');
  const [newActivityCategory, setNewActivityCategory] = useState(
    data.settings.activityCategories[0] || 'Participation en classe'
  );
  const [newActivityGrade, setNewActivityGrade] = useState<number | ''>('');
  const [newActivityDate, setNewActivityDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [newActivityObs, setNewActivityObs] = useState('');

  const activeClass = data.classes.find((c) => c.id === selectedClassId) || data.classes[0];

  const classStudents = activeClass
    ? data.students
        .filter((s) => s.classId === activeClass.id)
        .filter((s) => (selectedGroup === 'all' ? true : s.group === selectedGroup))
    : [];

  const ranksMap = calculateRanks(classStudents, data.grades, data.settings);

  // Sorting
  const sortedStudents = [...classStudents].sort((a, b) => {
    if (sortBy === 'rank') {
      const calcA = ranksMap.get(a.id);
      const calcB = ranksMap.get(b.id);
      if (calcA?.rank !== null && calcB?.rank !== null) {
        return (calcA?.rank || 999) - (calcB?.rank || 999);
      }
      if (calcA?.rank !== null) return -1;
      if (calcB?.rank !== null) return 1;
      return a.orderNumber - b.orderNumber;
    }
    return a.orderNumber - b.orderNumber;
  });

  // Direct inline editing handlers
  const handleControlChange = (studentId: string, val: string) => {
    const num = val === '' ? null : Math.min(20, Math.max(0, parseFloat(val)));
    const existing = data.grades.find((g) => g.studentId === studentId && g.term === 1);
    if (existing) {
      updateGradeRecord({
        ...existing,
        controlGrade: num,
      });
    } else {
      updateGradeRecord({
        studentId,
        classId: activeClass?.id || '',
        term: 1,
        controlGrade: num,
        activities: [],
      });
    }
  };

  const handleSynthesisChange = (studentId: string, val: string) => {
    const num = val === '' ? null : Math.min(20, Math.max(0, parseFloat(val)));
    const existing = data.grades.find((g) => g.studentId === studentId && g.term === 1);
    if (existing) {
      updateGradeRecord({
        ...existing,
        synthesisGrade: num,
      });
    } else {
      updateGradeRecord({
        studentId,
        classId: activeClass?.id || '',
        term: 1,
        synthesisGrade: num,
        activities: [],
      });
    }
  };

  const handleRemarkChange = (studentId: string, remark: string) => {
    const existing = data.grades.find((g) => g.studentId === studentId && g.term === 1);
    if (existing) {
      updateGradeRecord({
        ...existing,
        teacherRemarks: remark,
      });
    } else {
      updateGradeRecord({
        studentId,
        classId: activeClass?.id || '',
        term: 1,
        teacherRemarks: remark,
        activities: [],
      });
    }
  };

  const handleAddActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!managingActivitiesStudent || newActivityGrade === '') return;

    addActivityToStudent(managingActivitiesStudent.id, {
      title: newActivityTitle.trim() || newActivityCategory,
      category: newActivityCategory,
      grade: Number(newActivityGrade),
      date: newActivityDate,
      observation: newActivityObs.trim(),
    });

    setNewActivityTitle('');
    setNewActivityGrade('');
    setNewActivityObs('');
  };

  const handleExportExcel = () => {
    if (!activeClass) return;
    const groupLabel = selectedGroup === 'all' ? 'Tous' : `Groupe_${selectedGroup}`;
    exportGradesToExcel(sortedStudents, data.grades, data.settings, activeClass.name, groupLabel);
  };

  // Student currently selected for activities modal
  const studentActivitiesRecord = managingActivitiesStudent
    ? data.grades.find((g) => g.studentId === managingActivitiesStudent.id && g.term === 1)
    : undefined;

  return (
    <div className="space-y-6">
      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            {t.grades.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.grades.subtitle}</p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
          {/* Sort Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl max-w-full overflow-x-auto shrink-0">
            <button
              onClick={() => setSortBy('alpha')}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
                sortBy === 'alpha'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tri Alphabétique
            </button>
            <button
              onClick={() => setSortBy('rank')}
              className={`rounded-lg px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-bold transition-all shrink-0 ${
                sortBy === 'rank'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tri par Rang
            </button>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportExcel}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex-1 sm:flex-initial"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
              <span>{t.common.exportExcel}</span>
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs flex-1 sm:flex-initial"
            >
              <Printer className="h-4 w-4 text-slate-600" />
              <span>{t.common.print}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Formula Info Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Classe :</span>
          {data.classes.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                (activeClass?.id || '') === c.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}

          <span className="text-xs font-bold text-slate-400 ms-3">Groupe :</span>
          <div className="flex bg-slate-100 p-0.5 rounded-xl">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                selectedGroup === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Tous
            </button>
            <button
              onClick={() => setSelectedGroup(1)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                selectedGroup === 1 ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Gr. 1
            </button>
            <button
              onClick={() => setSelectedGroup(2)}
              className={`rounded-lg px-2.5 py-1 text-xs font-bold ${
                selectedGroup === 2 ? 'bg-white text-indigo-600 shadow-2xs' : 'text-slate-500'
              }`}
            >
              Gr. 2
            </button>
          </div>
        </div>

        {/* Formula reminder (Section 6.2) */}
        <div className="rounded-xl bg-blue-50/70 border border-blue-100 px-3 py-1.5 text-xs text-blue-900">
          <span className="font-bold">Formule : </span>
          <span>
            (Contrôle × {data.settings.evalCoefficients.control} + Activités ×{' '}
            {data.settings.evalCoefficients.activities} + Synthèse ×{' '}
            {data.settings.evalCoefficients.synthesis}) /{' '}
            {data.settings.evalCoefficients.control +
              data.settings.evalCoefficients.activities +
              data.settings.evalCoefficients.synthesis}
          </span>
        </div>
      </div>

      {/* Grade Table (Section 6.4) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-3.5 py-3.5 text-center w-12">N°</th>
                <th className="px-3.5 py-3.5 min-w-[180px]">Nom et Prénom</th>
                <th className="px-3 py-3.5 text-center w-28">
                  Contrôle <span className="text-[10px] text-blue-600 block">(Coeff {data.settings.evalCoefficients.control})</span>
                </th>
                <th className="px-3 py-3.5 text-center w-36">
                  Activités <span className="text-[10px] text-blue-600 block">(Coeff {data.settings.evalCoefficients.activities})</span>
                </th>
                <th className="px-3 py-3.5 text-center w-28">
                  Synthèse <span className="text-[10px] text-blue-600 block">(Coeff {data.settings.evalCoefficients.synthesis})</span>
                </th>
                <th className="px-3 py-3.5 text-center w-32 bg-blue-50/50">Moyenne Générale</th>
                <th className="px-3 py-3.5 text-center w-16 bg-blue-50/50">Rang</th>
                <th className="px-3.5 py-3.5 min-w-[160px]">Remarques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {sortedStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    Aucun élève trouvé
                  </td>
                </tr>
              ) : (
                sortedStudents.map((student) => {
                  const record = data.grades.find((g) => g.studentId === student.id && g.term === 1);
                  const calc = ranksMap.get(student.id);
                  const actsCount = record?.activities?.length || 0;

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      <td className="px-3.5 py-3 text-center font-bold text-slate-400">
                        {student.orderNumber}
                      </td>

                      <td className="px-3.5 py-3">
                        <button
                          onClick={() => openStudentProfile(student.id)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-start"
                        >
                          {student.lastName} {student.firstName}
                        </button>
                        <span className="block text-[10px] text-slate-400">
                          Gr. {student.group}
                        </span>
                      </td>

                      {/* Devoir de contrôle input */}
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="20"
                          value={
                            record?.controlGrade !== null && record?.controlGrade !== undefined
                              ? record.controlGrade
                              : ''
                          }
                          onChange={(e) => handleControlChange(student.id, e.target.value)}
                          placeholder="—"
                          className="w-20 text-center rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                        />
                      </td>

                      {/* Activités diverses: Display average + button to open detail modal */}
                      <td className="px-3 py-2 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <span
                            className={`font-bold px-2 py-1 rounded-md text-xs ${
                              calc?.activitiesAvg !== null
                                ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                                : 'text-slate-300'
                            }`}
                          >
                            {calc?.activitiesAvg !== null && calc?.activitiesAvg !== undefined ? calc.activitiesAvg : '—'}
                          </span>
                          <button
                            onClick={() => setManagingActivitiesStudent(student)}
                            className="rounded-md border border-slate-200 bg-white px-1.5 py-1 text-[10px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 shadow-2xs"
                            title="Gérer les activités diverses"
                          >
                            {actsCount > 0 ? `${actsCount} act.` : '+ Act.'}
                          </button>
                        </div>
                      </td>

                      {/* Devoir de synthèse input */}
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          step="0.25"
                          min="0"
                          max="20"
                          value={
                            record?.synthesisGrade !== null && record?.synthesisGrade !== undefined
                              ? record.synthesisGrade
                              : ''
                          }
                          onChange={(e) => handleSynthesisChange(student.id, e.target.value)}
                          placeholder="—"
                          className="w-20 text-center rounded-lg border border-slate-200 bg-slate-50/50 py-1.5 font-bold text-slate-900 focus:border-blue-500 focus:bg-white focus:outline-none"
                        />
                      </td>

                      {/* Moyenne Générale */}
                      <td className="px-3 py-2 text-center bg-blue-50/30">
                        {calc?.generalAverage !== null && calc?.generalAverage !== undefined ? (
                          <span
                            className={`inline-block px-2.5 py-1 rounded-lg font-black text-xs ${
                              calc.generalAverage >= 14
                                ? 'bg-emerald-100 text-emerald-800'
                                : calc.generalAverage >= 10
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {calc.generalAverage.toFixed(data.settings.gradeDisplayPrecision || 2)}
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 italic">
                            Incomplète
                          </span>
                        )}
                      </td>

                      {/* Rang */}
                      <td className="px-3 py-2 text-center font-black text-slate-800 bg-blue-50/30">
                        {calc?.rank ? (
                          <span className="flex h-6 w-6 mx-auto items-center justify-center rounded-full bg-slate-800 text-white text-[11px]">
                            {calc.rank}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      {/* Remarques */}
                      <td className="px-3.5 py-2">
                        <input
                          type="text"
                          value={record?.teacherRemarks || ''}
                          onChange={(e) => handleRemarkChange(student.id, e.target.value)}
                          placeholder="Remarque..."
                          className="w-full rounded-lg border border-slate-200 bg-transparent px-2 py-1 text-xs text-slate-700 focus:border-blue-500 focus:bg-white focus:outline-none"
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

      {/* Activities Modal (Section 6.1 B) */}
      {managingActivitiesStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl max-h-[88vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  Activités Diverses — {managingActivitiesStudent.lastName}{' '}
                  {managingActivitiesStudent.firstName}
                </h3>
                <p className="text-xs text-slate-500">
                  Ajoutez plusieurs évaluations indépendantes (Participation, Projet, Manuel...). La moyenne est calculée automatiquement.
                </p>
              </div>
              <button
                onClick={() => setManagingActivitiesStudent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            {/* List of current activities */}
            <div className="flex-1 overflow-y-auto py-4 space-y-2">
              {!studentActivitiesRecord?.activities ||
              studentActivitiesRecord.activities.length === 0 ? (
                <p className="py-6 text-center text-xs text-slate-400">
                  Aucune activité diverse enregistrée pour cet élève.
                </p>
              ) : (
                studentActivitiesRecord.activities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3"
                  >
                    <div>
                      <span className="font-bold text-slate-900 text-xs">{act.title}</span>
                      <span className="ms-2 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                        {act.category}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {act.date} {act.observation && `• ${act.observation}`}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-black text-blue-600 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                        {act.grade} / 20
                      </span>
                      <button
                        onClick={() =>
                          deleteActivityFromStudent(managingActivitiesStudent.id, act.id)
                        }
                        className="rounded-lg p-1 text-rose-500 hover:bg-rose-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Form to add a new activity */}
            <form onSubmit={handleAddActivity} className="border-t pt-4 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Ajouter une nouvelle activité
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Catégorie</label>
                  <select
                    value={newActivityCategory}
                    onChange={(e) => {
                      setNewActivityCategory(e.target.value);
                      if (!newActivityTitle) setNewActivityTitle(e.target.value);
                    }}
                    className="w-full rounded-xl border border-slate-200 p-2"
                  >
                    {data.settings.activityCategories.map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Titre spécifique</label>
                  <input
                    type="text"
                    value={newActivityTitle}
                    onChange={(e) => setNewActivityTitle(e.target.value)}
                    placeholder="Ex: TP Électricité, Exposé..."
                    className="w-full rounded-xl border border-slate-200 p-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Note (/20) *</label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    max="20"
                    required
                    value={newActivityGrade}
                    onChange={(e) =>
                      setNewActivityGrade(e.target.value === '' ? '' : Number(e.target.value))
                    }
                    placeholder="Ex: 16"
                    className="w-full rounded-xl border border-slate-200 p-2 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Date</label>
                  <input
                    type="date"
                    value={newActivityDate}
                    onChange={(e) => setNewActivityDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1">Observation</label>
                  <input
                    type="text"
                    value={newActivityObs}
                    onChange={(e) => setNewActivityObs(e.target.value)}
                    placeholder="Facultatif"
                    className="w-full rounded-xl border border-slate-200 p-2"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManagingActivitiesStudent(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  + Enregistrer cette note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
