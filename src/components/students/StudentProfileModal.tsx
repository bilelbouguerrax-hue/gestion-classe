import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  User,
  Phone,
  Calendar,
  MapPin,
  Award,
  Clock,
  ShieldAlert,
  Printer,
  CheckCircle2,
  FileText,
  Save,
} from 'lucide-react';
import { calculateStudentGrade, calculateRanks } from '../../services/calculations';

interface StudentProfileModalProps {
  studentId: string;
  onClose: () => void;
}

export const StudentProfileModal: React.FC<StudentProfileModalProps> = ({
  studentId,
  onClose,
}) => {
  const { data, updateStudent, t } = useApp();

  const student = data.students.find((s) => s.id === studentId);
  const studentClass = student ? data.classes.find((c) => c.id === student.classId) : null;
  const gradeRecord = student ? data.grades.find((g) => g.studentId === student.id && g.term === 1) : undefined;

  // Grade calculation
  const classStudents = student ? data.students.filter((s) => s.classId === student.classId) : [];
  const ranksMap = student ? calculateRanks(classStudents, data.grades, data.settings) : new Map();
  const studentCalc = student ? ranksMap.get(student.id) : null;

  // Attendance stats for this student
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  const studentAttendanceHistory: Array<{
    date: string;
    subject: string;
    status: string;
    obs?: string;
  }> = [];

  data.attendances.forEach((att) => {
    const rec = att.records.find((r) => r.studentId === studentId);
    if (rec) {
      if (rec.status === 'present') presentCount++;
      else if (rec.status === 'absent') absentCount++;
      else if (rec.status === 'late') lateCount++;
      else if (rec.status === 'excused') excusedCount++;

      studentAttendanceHistory.push({
        date: att.date,
        subject: att.subject,
        status: rec.status,
        obs: rec.observation,
      });
    }
  });

  const totalSessions = presentCount + absentCount + lateCount + excusedCount;
  const attendanceRate = totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 100;

  // Discipline history
  const studentDiscipline = data.disciplines.filter((d) => d.studentId === studentId);

  // Teacher notes / Appréciations
  const [teacherNotes, setTeacherNotes] = useState(student?.teacherNotes || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const quickPhrases = [
    'Excellent niveau.',
    'Bon niveau.',
    'Niveau moyen.',
    'Niveau à consolider.',
    'Élève actif et volontaire.',
    'Participe régulièrement.',
    'Élève sérieux et appliqué.',
    'Doit fournir davantage d\'efforts.',
    'Élève en nette progression.',
  ];

  const handleAppendPhrase = (phrase: string) => {
    setTeacherNotes((prev) => (prev ? `${prev} ${phrase}` : phrase));
  };

  const handleSaveNotes = () => {
    if (student) {
      updateStudent(student.id, { teacherNotes });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!student) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl rounded-3xl bg-white shadow-2xl ring-1 ring-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4 no-print">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-lg shadow-md shadow-blue-500/20">
              {student.lastName.charAt(0)}
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {student.lastName} {student.firstName}
              </h3>
              <p className="text-xs text-slate-500">
                {studentClass?.name} • Groupe {student.group} • N° {student.orderNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              <span>Imprimer A4</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Printable Header only shown when printing */}
          <div className="print-only mb-6 border-b pb-4">
            <div className="flex justify-between items-center text-xs text-slate-500">
              <span>{data.settings.schoolName}</span>
              <span>Année : {data.settings.academicYear}</span>
            </div>
            <h1 className="text-xl font-bold text-center my-2">
              FICHE INDIVIDUELLE DE L'ÉLÈVE
            </h1>
            <p className="text-center text-sm font-semibold">
              {student.lastName} {student.firstName} — {studentClass?.name} (Groupe {student.group})
            </p>
          </div>

          {/* Section 1: Informations Personnelles (8.1) */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <User className="h-4 w-4 text-blue-500" />
              {t.students.personalInfo}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block">{t.students.birthDate}</span>
                <span className="font-bold text-slate-800">{student.birthDate || 'Non renseigné'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.students.gender}</span>
                <span className="font-bold text-slate-800">{student.gender === 'F' ? 'Féminin' : 'Masculin'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">{t.students.registrationDate}</span>
                <span className="font-bold text-slate-800">{student.registrationDate}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Nom du père</span>
                <span className="font-bold text-slate-800">{student.fatherName || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Tél. Père</span>
                <span className="font-bold text-slate-800">{student.fatherPhone || '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Nom de la mère</span>
                <span className="font-bold text-slate-800">{student.motherName || '—'}</span>
              </div>
              {student.address && (
                <div className="sm:col-span-3">
                  <span className="text-slate-400 block">{t.students.address}</span>
                  <span className="font-bold text-slate-800">{student.address}</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Bilan Pédagogique (8.2) */}
          <div className="rounded-2xl border border-blue-100 bg-blue-50/30 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4" />
              {t.students.pedagogicalSummary}
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="rounded-xl bg-white p-3 shadow-2xs border border-blue-100/50">
                <span className="text-[11px] text-slate-400 block">Contrôle (/20)</span>
                <span className="text-base font-black text-slate-800">
                  {gradeRecord?.controlGrade !== null && gradeRecord?.controlGrade !== undefined
                    ? gradeRecord.controlGrade
                    : '—'}
                </span>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-2xs border border-blue-100/50">
                <span className="text-[11px] text-slate-400 block">Activités (/20)</span>
                <span className="text-base font-black text-slate-800">
                  {studentCalc?.activitiesAvg !== null && studentCalc?.activitiesAvg !== undefined
                    ? studentCalc.activitiesAvg
                    : '—'}
                </span>
              </div>
              <div className="rounded-xl bg-white p-3 shadow-2xs border border-blue-100/50">
                <span className="text-[11px] text-slate-400 block">Synthèse (/20)</span>
                <span className="text-base font-black text-slate-800">
                  {gradeRecord?.synthesisGrade !== null && gradeRecord?.synthesisGrade !== undefined
                    ? gradeRecord.synthesisGrade
                    : '—'}
                </span>
              </div>
              <div className="rounded-xl bg-blue-600 p-3 shadow-sm text-white">
                <span className="text-[11px] text-blue-100 block">Moyenne & Rang</span>
                <span className="text-base font-black">
                  {studentCalc?.generalAverage !== null && studentCalc?.generalAverage !== undefined
                    ? `${studentCalc.generalAverage} / 20`
                    : 'Incomplète'}
                </span>
                {studentCalc?.rank && (
                  <span className="block text-[10px] text-blue-200">
                    Rang : {studentCalc.rank} / {classStudents.length}
                  </span>
                )}
              </div>
            </div>

            {/* Activities list */}
            {gradeRecord?.activities && gradeRecord.activities.length > 0 && (
              <div className="mt-4 pt-3 border-t border-blue-100/60">
                <span className="text-xs font-bold text-slate-700 block mb-2">
                  Détail des activités diverses :
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {gradeRecord.activities.map((act) => (
                    <div
                      key={act.id}
                      className="rounded-lg bg-white p-2 border border-slate-100 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold text-slate-800">{act.title}</span>
                        <span className="block text-[10px] text-slate-400">
                          {act.category} • {act.date}
                        </span>
                      </div>
                      <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                        {act.grade}/20
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Section 3: Présences & Assiduité */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-emerald-500" />
              Suivi des Présences et Assiduité
            </h4>
            <div className="grid grid-cols-4 gap-2 text-center mb-3">
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Présences</span>
                <span className="font-bold text-emerald-600 text-sm">{presentCount}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Retards</span>
                <span className="font-bold text-amber-600 text-sm">{lateCount}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Absences</span>
                <span className="font-bold text-rose-600 text-sm">{absentCount}</span>
              </div>
              <div className="bg-white p-2 rounded-lg border border-slate-100">
                <span className="text-[10px] text-slate-400 block">Taux</span>
                <span className="font-bold text-slate-800 text-sm">{attendanceRate}%</span>
              </div>
            </div>

            {studentAttendanceHistory.length > 0 && (
              <div className="max-h-28 overflow-y-auto divide-y divide-slate-100 text-xs">
                {studentAttendanceHistory.slice(0, 5).map((h, i) => (
                  <div key={i} className="py-1.5 flex justify-between items-center">
                    <span className="text-slate-600">
                      {h.date} — {h.subject}
                    </span>
                    <span
                      className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                        h.status === 'present'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.status === 'late'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {h.status === 'present'
                        ? 'Présent'
                        : h.status === 'late'
                        ? 'En retard'
                        : 'Absent'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 4: Discipline */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-purple-500" />
              Observations disciplinaires ({studentDiscipline.length})
            </h4>
            {studentDiscipline.length === 0 ? (
              <p className="text-xs text-slate-400">Aucun incident disciplinaire enregistré.</p>
            ) : (
              <div className="space-y-2 text-xs">
                {studentDiscipline.map((d) => (
                  <div
                    key={d.id}
                    className="p-2.5 rounded-lg bg-white border border-slate-100 flex flex-col gap-1"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-slate-800">{d.category}</span>
                      <span className="text-[10px] text-slate-400">{d.date}</span>
                    </div>
                    <p className="text-slate-600">{d.description}</p>
                    {d.teacherComment && (
                      <p className="text-blue-600 italic text-[11px]">
                        Conseil : {d.teacherComment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 5: Appréciations personnelles de l'enseignant (8.3) */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 no-print">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              {t.students.teacherObservations}
            </h4>

            {/* Quick Suggestions Chips */}
            <div className="mb-3">
              <span className="text-[11px] text-slate-400 block mb-1.5">
                {t.students.quickComments}
              </span>
              <div className="flex flex-wrap gap-1.5">
                {quickPhrases.map((phrase, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAppendPhrase(phrase)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-colors"
                  >
                    + {phrase}
                  </button>
                ))}
              </div>
            </div>

            <textarea
              rows={3}
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Saisissez vos appréciations pédagogiques pour cet élève..."
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-800 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
            />

            <div className="mt-2 flex items-center justify-between">
              {savedSuccess ? (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Appréciations enregistrées !
                </span>
              ) : (
                <span />
              )}
              <button
                onClick={handleSaveNotes}
                className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
              >
                <Save className="h-3.5 w-3.5" />
                <span>{t.common.save}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
