import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Printer,
  FileSpreadsheet,
  Download,
  Calendar,
  CheckSquare,
  Award,
  ShieldAlert,
  Users2,
  FileText,
  Eye,
} from 'lucide-react';
import { calculateRanks } from '../../services/calculations';
import { exportGradesToExcel, exportAttendanceToExcel, exportStudentsToExcel } from '../../services/excel';

export const ReportsView: React.FC = () => {
  const { data, t } = useApp();

  type ReportType =
    | 'notes_sheet'
    | 'students_list'
    | 'attendance_sheet'
    | 'absence_summary'
    | 'discipline_sheet'
    | 'timetable_sheet';

  const [selectedReport, setSelectedReport] = useState<ReportType>('notes_sheet');
  const [selectedClassId, setSelectedClassId] = useState<string>(data.classes[0]?.id || '');
  const [selectedGroup, setSelectedGroup] = useState<1 | 2 | 'all'>('all');
  const [selectedAttendanceSessionId, setSelectedAttendanceSessionId] = useState<string>('latest');

  const activeClass = data.classes.find((c) => c.id === selectedClassId) || data.classes[0];

  // Available attendance records for this class
  const classAttendanceRecords = activeClass
    ? data.attendances
        .filter((att) => att.classId === activeClass.id)
        .sort((a, b) => b.date.localeCompare(a.date) || b.startTime.localeCompare(a.startTime))
    : [];

  const activeAttendanceRecord =
    selectedAttendanceSessionId === 'blank'
      ? null
      : selectedAttendanceSessionId === 'latest'
      ? classAttendanceRecords[0] || null
      : classAttendanceRecords.find((att) => att.id === selectedAttendanceSessionId) || null;

  const classStudents = activeClass
    ? data.students
        .filter((s) => s.classId === activeClass.id)
        .filter((s) => (selectedGroup === 'all' ? true : s.group === selectedGroup))
    : [];

  const ranksMap = calculateRanks(classStudents, data.grades, data.settings);

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = () => {
    if (!activeClass) return;
    if (selectedReport === 'notes_sheet') {
      exportGradesToExcel(
        classStudents,
        data.grades,
        data.settings,
        activeClass.name,
        selectedGroup === 'all' ? 'Classe' : `Groupe_${selectedGroup}`
      );
    } else if (selectedReport === 'attendance_sheet' || selectedReport === 'absence_summary') {
      exportAttendanceToExcel(classStudents, data.attendances, activeClass.name);
    } else {
      exportStudentsToExcel(classStudents, activeClass.name);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Print Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            {t.reports.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.reports.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>{t.common.exportExcel}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>{t.reports.printNow}</span>
          </button>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 no-print">
        <button
          onClick={() => setSelectedReport('notes_sheet')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
            selectedReport === 'notes_sheet'
              ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-2xs'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Award className="h-5 w-5 mb-1 text-blue-600" />
          <span className="text-xs">{t.reports.sheetNotes}</span>
        </button>

        <button
          onClick={() => setSelectedReport('students_list')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
            selectedReport === 'students_list'
              ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-2xs'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users2 className="h-5 w-5 mb-1 text-emerald-600" />
          <span className="text-xs">{t.reports.sheetStudents}</span>
        </button>

        <button
          onClick={() => setSelectedReport('attendance_sheet')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
            selectedReport === 'attendance_sheet'
              ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-2xs'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CheckSquare className="h-5 w-5 mb-1 text-indigo-600" />
          <span className="text-xs">{t.reports.sheetAttendance}</span>
        </button>

        <button
          onClick={() => setSelectedReport('absence_summary')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
            selectedReport === 'absence_summary'
              ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-2xs'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CheckSquare className="h-5 w-5 mb-1 text-amber-600" />
          <span className="text-xs">Bilan des Absences</span>
        </button>

        <button
          onClick={() => setSelectedReport('discipline_sheet')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
            selectedReport === 'discipline_sheet'
              ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-2xs'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <ShieldAlert className="h-5 w-5 mb-1 text-rose-600" />
          <span className="text-xs">{t.reports.sheetDiscipline}</span>
        </button>

        <button
          onClick={() => setSelectedReport('timetable_sheet')}
          className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
            selectedReport === 'timetable_sheet'
              ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold shadow-2xs'
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Calendar className="h-5 w-5 mb-1 text-purple-600" />
          <span className="text-xs">{t.reports.sheetTimetable}</span>
        </button>
      </div>

      {/* Filter toolbar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 no-print">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400">Classe :</span>
          {data.classes.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedClassId(c.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                (activeClass?.id || '') === c.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {selectedReport === 'attendance_sheet' && (
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">Séance :</span>
              <select
                value={selectedAttendanceSessionId}
                onChange={(e) => setSelectedAttendanceSessionId(e.target.value)}
                className="rounded-xl border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-bold text-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="latest">Dernière séance enregistrée</option>
                {classAttendanceRecords.map((att) => (
                  <option key={att.id} value={att.id}>
                    {att.date} ({att.startTime}-{att.endTime}) • Gr. {att.group === 'all' ? 'Tous' : att.group}
                  </option>
                ))}
                <option value="blank">Feuille vierge pour signature manuelle</option>
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Groupe :</span>
            <select
              value={selectedGroup}
              onChange={(e) =>
                setSelectedGroup(
                  e.target.value === 'all' ? 'all' : (Number(e.target.value) as 1 | 2)
                )
              }
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
            >
              <option value="all">Classe entière</option>
              <option value="1">Groupe 1</option>
              <option value="2">Groupe 2</option>
            </select>
          </div>
        </div>
      </div>

      {/* Direct A4 Landscape Print Configuration */}
      <style>{`
        @media print {
          @page {
            size: A4 landscape !important;
            margin: 8mm 10mm 8mm 10mm !important;
          }
        }
      `}</style>

      {/* A4 PRINTABLE DOCUMENT CONTAINER (Exclusively Landscape) */}
      <div className="rounded-2xl sm:rounded-3xl border border-slate-200 bg-white p-3.5 sm:p-8 shadow-md print:border-0 print:p-0 print:shadow-none text-slate-900 mx-auto w-full max-w-6xl min-h-[680px]">
        {/* Official Header */}
        <div className="border-b-2 border-slate-900 pb-4 mb-6">
          <div className="flex justify-between items-start text-xs font-semibold uppercase tracking-wider text-slate-600 gap-2">
            <div>
              <p className="font-bold text-slate-900 text-sm">{data.settings.schoolName}</p>
              <p>Enseignant : {data.settings.teacherName}</p>
              <p>Matière : {data.settings.mainSubject}</p>
            </div>
            <div className="text-right">
              <p>Année Scolaire : {data.settings.academicYear}</p>
              <p>Date : {new Date().toLocaleDateString('fr-FR')}</p>
            </div>
          </div>

          <div className="mt-4 text-center">
            <h1 className="text-base sm:text-xl font-black tracking-tight text-slate-900 uppercase">
              {selectedReport === 'notes_sheet' && 'Feuille Officielle des Notes'}
              {selectedReport === 'students_list' && 'Liste Officielle des Élèves'}
              {selectedReport === 'attendance_sheet' && "Feuille d'Émargement et Présence"}
              {selectedReport === 'absence_summary' && 'Bilan Récapitulatif des Absences'}
              {selectedReport === 'discipline_sheet' && 'Registre du Suivi Disciplinaire'}
              {selectedReport === 'timetable_sheet' && "Emploi du Temps Pédagogique de l'Enseignant"}
            </h1>
            <p className="text-xs font-bold text-slate-700 mt-1">
              Classe : {activeClass?.name} ({activeClass?.academicLevel}) •{' '}
              {selectedGroup === 'all' ? 'Classe entière' : `Groupe ${selectedGroup}`}
              {selectedReport === 'attendance_sheet' && activeAttendanceRecord && (
                <span className="ms-2 text-blue-700">
                  • Séance du {activeAttendanceRecord.date} ({activeAttendanceRecord.startTime} - {activeAttendanceRecord.endTime}) {activeAttendanceRecord.room && `[Salle ${activeAttendanceRecord.room}]`}
                </span>
              )}
            </p>
          </div>
        </div>

        {/* 1. NOTES SHEET */}
        {selectedReport === 'notes_sheet' && (
          <div className="w-full overflow-x-auto touch-pan-x">
            <table className="w-full text-left text-xs border-collapse border border-slate-900 min-w-[650px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold uppercase text-[11px]">
                <th className="border border-slate-900 p-2 text-center w-10">N°</th>
                <th className="border border-slate-900 p-2">Nom & Prénom</th>
                <th className="border border-slate-900 p-2 text-center w-16">Gr.</th>
                <th className="border border-slate-900 p-2 text-center w-20">Contrôle</th>
                <th className="border border-slate-900 p-2 text-center w-20">Activités</th>
                <th className="border border-slate-900 p-2 text-center w-20">Synthèse</th>
                <th className="border border-slate-900 p-2 text-center w-24">Moyenne</th>
                <th className="border border-slate-900 p-2 text-center w-14">Rang</th>
                <th className="border border-slate-900 p-2">Remarques</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s) => {
                const rec = data.grades.find((g) => g.studentId === s.id && g.term === 1);
                const calc = ranksMap.get(s.id);
                return (
                  <tr key={s.id} className="border-b border-slate-300">
                    <td className="border border-slate-900 p-2 text-center font-bold">
                      {s.orderNumber}
                    </td>
                    <td className="border border-slate-900 p-2 font-bold">
                      {s.lastName} {s.firstName}
                    </td>
                    <td className="border border-slate-900 p-2 text-center">Gr. {s.group}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold">
                      {rec?.controlGrade !== null && rec?.controlGrade !== undefined
                        ? rec.controlGrade
                        : '—'}
                    </td>
                    <td className="border border-slate-900 p-2 text-center font-bold">
                      {calc?.activitiesAvg !== null && calc?.activitiesAvg !== undefined
                        ? calc.activitiesAvg
                        : '—'}
                    </td>
                    <td className="border border-slate-900 p-2 text-center font-bold">
                      {rec?.synthesisGrade !== null && rec?.synthesisGrade !== undefined
                        ? rec.synthesisGrade
                        : '—'}
                    </td>
                    <td className="border border-slate-900 p-2 text-center font-black">
                      {calc?.generalAverage !== null && calc?.generalAverage !== undefined
                        ? calc.generalAverage.toFixed(data.settings.gradeDisplayPrecision || 2)
                        : 'Incomplète'}
                    </td>
                    <td className="border border-slate-900 p-2 text-center font-bold">
                      {calc?.rank || '—'}
                    </td>
                    <td className="border border-slate-900 p-2 italic text-[11px]">
                      {rec?.teacherRemarks || ''}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}

        {/* 2. STUDENTS LIST */}
        {selectedReport === 'students_list' && (
          <div className="w-full overflow-x-auto touch-pan-x">
            <table className="w-full text-left text-xs border-collapse border border-slate-900 min-w-[650px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold uppercase text-[11px]">
                <th className="border border-slate-900 p-2 text-center w-10">N°</th>
                <th className="border border-slate-900 p-2">Nom & Prénom</th>
                <th className="border border-slate-900 p-2 text-center w-16">Groupe</th>
                <th className="border border-slate-900 p-2 w-28">Date Naiss.</th>
                <th className="border border-slate-900 p-2">Parent & Contact</th>
                <th className="border border-slate-900 p-2 text-center w-28">Date Inscription</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s) => (
                <tr key={s.id} className="border-b border-slate-300">
                  <td className="border border-slate-900 p-2 text-center font-bold">
                    {s.orderNumber}
                  </td>
                  <td className="border border-slate-900 p-2 font-bold">
                    {s.lastName} {s.firstName}
                  </td>
                  <td className="border border-slate-900 p-2 text-center">Groupe {s.group}</td>
                  <td className="border border-slate-900 p-2">{s.birthDate || '—'}</td>
                  <td className="border border-slate-900 p-2">
                    {s.fatherPhone || s.motherPhone || '—'}
                  </td>
                  <td className="border border-slate-900 p-2 text-center">
                    {s.registrationDate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        {/* 3. ATTENDANCE SIGNATURE SHEET */}
        {selectedReport === 'attendance_sheet' && (
          <div className="w-full overflow-x-auto touch-pan-x">
            <table className="w-full text-left text-xs border-collapse border border-slate-900 min-w-[650px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold uppercase text-[11px]">
                <th className="border border-slate-900 p-2 text-center w-10">N°</th>
                <th className="border border-slate-900 p-2">Nom & Prénom</th>
                <th className="border border-slate-900 p-2 text-center w-16">Groupe</th>
                <th className="border border-slate-900 p-2 text-center w-28">Présence</th>
                <th className="border border-slate-900 p-2">Émargement / Observation</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s) => {
                const studentAttItem = activeAttendanceRecord?.records?.find(
                  (r) => r.studentId === s.id
                );

                const status = studentAttItem?.status;
                const observation = studentAttItem?.observation;

                return (
                  <tr key={s.id} className="border-b border-slate-300 h-10">
                    <td className="border border-slate-900 p-2 text-center font-bold">
                      {s.orderNumber}
                    </td>
                    <td className="border border-slate-900 p-2 font-bold">
                      {s.lastName} {s.firstName}
                    </td>
                    <td className="border border-slate-900 p-2 text-center">Gr. {s.group}</td>
                    <td className="border border-slate-900 p-2 text-center">
                      {status ? (
                        status === 'present' ? (
                          <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-300">
                            Présent (P)
                          </span>
                        ) : status === 'absent' ? (
                          <span className="font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-300">
                            Absent (A)
                          </span>
                        ) : status === 'late' ? (
                          <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-300">
                            Retard (R)
                          </span>
                        ) : (
                          <span className="font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-300">
                            Justifié (J)
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400 font-medium">[ ] P &nbsp; [ ] A</span>
                      )}
                    </td>
                    <td className="border border-slate-900 p-2 text-slate-800">
                      {observation ? (
                        <span className="font-medium">{observation}</span>
                      ) : status === 'present' ? (
                        <span className="text-slate-400 italic text-[11px]">Émargé / Présent</span>
                      ) : status === 'absent' ? (
                        <span className="text-rose-600 font-semibold text-[11px]">Absence non justifiée</span>
                      ) : (
                        ''
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}

        {/* 4. ABSENCE SUMMARY */}
        {selectedReport === 'absence_summary' && (
          <div className="w-full overflow-x-auto touch-pan-x">
            <table className="w-full text-left text-xs border-collapse border border-slate-900 min-w-[650px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold uppercase text-[11px]">
                <th className="border border-slate-900 p-2 text-center w-10">N°</th>
                <th className="border border-slate-900 p-2">Nom & Prénom</th>
                <th className="border border-slate-900 p-2 text-center w-16">Groupe</th>
                <th className="border border-slate-900 p-2 text-center w-24">Présences</th>
                <th className="border border-slate-900 p-2 text-center w-24">Retards</th>
                <th className="border border-slate-900 p-2 text-center w-24">Absences</th>
                <th className="border border-slate-900 p-2 text-center w-28">Taux Assiduité</th>
              </tr>
            </thead>
            <tbody>
              {classStudents.map((s) => {
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
                  <tr key={s.id} className="border-b border-slate-300">
                    <td className="border border-slate-900 p-2 text-center font-bold">
                      {s.orderNumber}
                    </td>
                    <td className="border border-slate-900 p-2 font-bold">
                      {s.lastName} {s.firstName}
                    </td>
                    <td className="border border-slate-900 p-2 text-center">Gr. {s.group}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold">{p}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold">{l}</td>
                    <td className="border border-slate-900 p-2 text-center font-bold text-rose-600">
                      {a}
                    </td>
                    <td className="border border-slate-900 p-2 text-center font-black">
                      {rate}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        )}

        {/* 5. DISCIPLINE SHEET */}
        {selectedReport === 'discipline_sheet' && (
          <div className="w-full overflow-x-auto touch-pan-x">
            <table className="w-full text-left text-xs border-collapse border border-slate-900 min-w-[650px]">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-900 text-slate-900 font-bold uppercase text-[11px]">
                <th className="border border-slate-900 p-2 text-center w-10">N°</th>
                <th className="border border-slate-900 p-2">Élève</th>
                <th className="border border-slate-900 p-2 w-24">Date</th>
                <th className="border border-slate-900 p-2">Nature de l'observation</th>
                <th className="border border-slate-900 p-2">Description</th>
                <th className="border border-slate-900 p-2">Commentaire Enseignant</th>
              </tr>
            </thead>
            <tbody>
              {data.disciplines
                .filter((d) => d.classId === activeClass?.id)
                .map((d, i) => {
                  const s = data.students.find((st) => st.id === d.studentId);
                  return (
                    <tr key={d.id} className="border-b border-slate-300">
                      <td className="border border-slate-900 p-2 text-center font-bold">
                        {i + 1}
                      </td>
                      <td className="border border-slate-900 p-2 font-bold">
                        {s ? `${s.lastName} ${s.firstName}` : 'Élève'}
                      </td>
                      <td className="border border-slate-900 p-2">{d.date}</td>
                      <td className="border border-slate-900 p-2 font-bold">{d.category}</td>
                      <td className="border border-slate-900 p-2">{d.description}</td>
                      <td className="border border-slate-900 p-2 italic">
                        {d.teacherComment || '—'}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          </div>
        )}

        {/* 6. TIMETABLE SHEET */}
        {selectedReport === 'timetable_sheet' && (
          <div className="space-y-4 overflow-x-auto touch-pan-x">
            <div className="grid grid-cols-6 gap-2 border border-slate-900 p-2 min-w-[650px]">
              {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'].map((day, idx) => {
                const sessions = data.timetable
                  .filter((s) => s.dayOfWeek === idx + 1)
                  .sort((a, b) => a.startTime.localeCompare(b.startTime));
                return (
                  <div key={day} className="border border-slate-300 p-2">
                    <h4 className="font-bold border-b pb-1 text-center text-xs">{day}</h4>
                    <div className="mt-2 space-y-2">
                      {sessions.map((sess) => {
                        const cl = data.classes.find((c) => c.id === sess.classId);
                        return (
                          <div
                            key={sess.id}
                            className="p-1.5 bg-slate-50 border rounded text-[10px]"
                          >
                            <span className="font-bold block">
                              {sess.startTime} - {sess.endTime}
                            </span>
                            <span>{cl?.name}</span>
                            <span className="block font-semibold text-blue-800">
                              {sess.subject}
                            </span>
                            {sess.room && <span className="text-slate-500">{sess.room}</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Official Signature Footer */}
        <div className="mt-12 flex justify-between items-center text-xs pt-4 border-t border-slate-300">
          <div>
            <p>Signature de l'Enseignant :</p>
            <p className="mt-10 font-bold">{data.settings.teacherName}</p>
          </div>
          <div className="text-right">
            <p>Cachet et Visa de l'Établissement :</p>
            <div className="h-12 w-32 mt-2 border border-dashed border-slate-300 inline-block"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
