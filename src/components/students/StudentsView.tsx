import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Student } from '../../types';
import {
  GraduationCap,
  Plus,
  Search,
  Upload,
  Download,
  Filter,
  ArrowUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowRightLeft,
  FileSpreadsheet,
  Zap,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { parseStudentsExcel, exportStudentsToExcel } from '../../services/excel';
import { compareStudentsAlphabetical, suggestGroupForNewStudent } from '../../services/calculations';

export const StudentsView: React.FC = () => {
  const {
    data,
    addStudent,
    updateStudent,
    deleteStudent,
    moveStudentClass,
    importStudents,
    openStudentProfile,
    t,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(
    data.classes[0]?.id || ''
  );
  const [selectedGroup, setSelectedGroup] = useState<1 | 2 | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [movingStudent, setMovingStudent] = useState<Student | null>(null);
  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<Student | null>(null);

  // Form states
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [group, setGroup] = useState<1 | 2>(1);
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [birthDate, setBirthDate] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [motherName, setMotherName] = useState('');
  const [fatherPhone, setFatherPhone] = useState('');
  const [motherPhone, setMotherPhone] = useState('');
  const [address, setAddress] = useState('');
  const [targetNewClassId, setTargetNewClassId] = useState('');

  // Excel import states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importPreview, setImportPreview] = useState<{
    students: Array<Omit<Student, 'id' | 'orderNumber'>>;
    duplicates: number;
  } | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Quick entry mode (Section 16.4)
  const [isQuickEntryOpen, setIsQuickEntryOpen] = useState(false);
  const [quickIndex, setQuickIndex] = useState(0);

  const activeClass = data.classes.find((c) => c.id === selectedClassId) || data.classes[0];

  const classStudents = activeClass
    ? data.students.filter((s) => s.classId === activeClass.id)
    : [];

  // Filtered by group and search
  const filteredStudents = classStudents.filter((s) => {
    if (selectedGroup !== 'all' && s.group !== selectedGroup) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        s.lastName.toLowerCase().includes(q) ||
        s.firstName.toLowerCase().includes(q) ||
        `${s.lastName} ${s.firstName}`.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingStudent(null);
    setLastName('');
    setFirstName('');
    setGender('M');
    setBirthDate('');
    setFatherName('');
    setMotherName('');
    setFatherPhone('');
    setMotherPhone('');
    setAddress('');

    // Suggest group based on current class students
    const suggested = suggestGroupForNewStudent(classStudents, '', '');
    setGroup(suggested);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (s: Student) => {
    setEditingStudent(s);
    setLastName(s.lastName);
    setFirstName(s.firstName);
    setGroup(s.group);
    setGender(s.gender || 'M');
    setBirthDate(s.birthDate || '');
    setFatherName(s.fatherName || '');
    setMotherName(s.motherName || '');
    setFatherPhone(s.fatherPhone || '');
    setMotherPhone(s.motherPhone || '');
    setAddress(s.address || '');
    setIsAddModalOpen(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lastName.trim() || !firstName.trim() || !activeClass) return;

    if (editingStudent) {
      updateStudent(editingStudent.id, {
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        group,
        gender,
        birthDate,
        fatherName,
        motherName,
        fatherPhone,
        motherPhone,
        address,
      });
    } else {
      addStudent({
        classId: activeClass.id,
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        group,
        gender,
        birthDate,
        fatherName,
        motherName,
        fatherPhone,
        motherPhone,
        address,
        registrationDate: new Date().toISOString().split('T')[0],
      });
    }
    setIsAddModalOpen(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeClass) return;

    try {
      setImportStatus('Analyse du fichier...');
      const result = await parseStudentsExcel(file, activeClass.id, data.students);
      setImportPreview(result);
      setIsImportModalOpen(true);
      setImportStatus(null);
    } catch (err: any) {
      alert(`Erreur d'importation: ${err.message}`);
      setImportStatus(null);
    }
  };

  const handleConfirmImport = () => {
    if (!importPreview || !activeClass) return;
    importStudents(importPreview.students, activeClass.id);
    setIsImportModalOpen(false);
    setImportPreview(null);
  };

  const handleExportExcel = () => {
    if (!activeClass) return;
    exportStudentsToExcel(filteredStudents, activeClass.name);
  };

  return (
    <div className="space-y-6">
      {/* Title & Top Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            {t.students.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.students.subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Entry Mode button */}
          <button
            onClick={() => {
              setQuickIndex(0);
              setIsQuickEntryOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs font-bold text-amber-800 hover:bg-amber-100 transition-colors shadow-2xs"
            title="Mode saisie rapide séquentielle pour défiler d'élève en élève"
          >
            <Zap className="h-4 w-4 text-amber-600" />
            <span>{t.students.quickEntryMode}</span>
          </button>

          {/* Import Excel */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            <span>{t.common.importExcel}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Export Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>{t.common.exportExcel}</span>
          </button>

          {/* Add Student */}
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Plus className="h-4 w-4" />
            <span>{t.students.addStudent}</span>
          </button>
        </div>
      </div>

      {/* Class & Group Filter Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Class Selection */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Classe :
          </span>
          {data.classes.map((cls) => (
            <button
              key={cls.id}
              onClick={() => setSelectedClassId(cls.id)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-bold transition-all ${
                (activeClass?.id || '') === cls.id
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cls.name}
            </button>
          ))}
        </div>

        {/* Group Filter & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`rounded-lg px-3 py-1 text-xs font-bold ${
                selectedGroup === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Tous ({classStudents.length})
            </button>
            <button
              onClick={() => setSelectedGroup(1)}
              className={`rounded-lg px-3 py-1 text-xs font-bold ${
                selectedGroup === 1
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Groupe 1 ({classStudents.filter((s) => s.group === 1).length})
            </button>
            <button
              onClick={() => setSelectedGroup(2)}
              className={`rounded-lg px-3 py-1 text-xs font-bold ${
                selectedGroup === 2
                  ? 'bg-white text-indigo-600 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Groupe 2 ({classStudents.filter((s) => s.group === 2).length})
            </button>
          </div>

          <div className="relative min-w-[200px]">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher par nom..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/60 pl-9 pr-3.5 py-1.5 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100"
            />
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 text-center w-12">{t.students.orderNumber}</th>
                <th className="px-4 py-3.5">{t.students.fullName}</th>
                <th className="px-4 py-3.5 text-center">Groupe</th>
                <th className="px-4 py-3.5 hidden md:table-cell">Contact Parent</th>
                <th className="px-4 py-3.5 hidden lg:table-cell">{t.students.birthDate}</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Aucun élève trouvé dans cette sélection
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-blue-50/40 transition-colors group"
                  >
                    <td className="px-4 py-3 text-center font-bold text-slate-400">
                      {student.orderNumber}
                    </td>

                    <td className="px-4 py-3">
                      <button
                        onClick={() => openStudentProfile(student.id)}
                        className="text-start font-bold text-slate-900 hover:text-blue-600 transition-colors flex items-center gap-2"
                        title="Cliquer pour ouvrir la fiche individuelle"
                      >
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-700 text-xs font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          {student.lastName.charAt(0)}
                        </span>
                        <span>
                          {student.lastName} {student.firstName}
                        </span>
                      </button>
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                          student.group === 1
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-indigo-100 text-indigo-800'
                        }`}
                      >
                        Groupe {student.group}
                      </span>
                    </td>

                    <td className="px-4 py-3 hidden md:table-cell text-slate-500">
                      {student.fatherPhone || student.motherPhone ? (
                        <span>{student.fatherPhone || student.motherPhone}</span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="px-4 py-3 hidden lg:table-cell text-slate-500">
                      {student.birthDate || '—'}
                    </td>

                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openStudentProfile(student.id)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-blue-50 hover:text-blue-600"
                          title="Fiche individuelle"
                        >
                          <GraduationCap className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setMovingStudent(student);
                            setTargetNewClassId(
                              data.classes.find((c) => c.id !== student.classId)?.id || ''
                            );
                          }}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          title="Déplacer vers une autre classe"
                        >
                          <ArrowRightLeft className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(student)}
                          className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                          title="Modifier"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmStudent(student)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <h3 className="text-lg font-bold text-slate-900">
              {editingStudent ? t.students.editStudent : t.students.addStudent}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Classe : <span className="font-bold text-slate-800">{activeClass?.name}</span>
            </p>

            <form onSubmit={handleSaveStudent} className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.students.lastName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ex: Ben Salem"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.students.firstName} *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ex: Youssef"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Group selection with auto recommendation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Affectation au groupe
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <label
                    className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                      group === 1
                        ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="group"
                        checked={group === 1}
                        onChange={() => setGroup(1)}
                        className="text-blue-600"
                      />
                      <span>Groupe 1</span>
                    </div>
                  </label>
                  <label
                    className={`flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                      group === 2
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-bold'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs">
                      <input
                        type="radio"
                        name="group"
                        checked={group === 2}
                        onChange={() => setGroup(2)}
                        className="text-indigo-600"
                      />
                      <span>Groupe 2</span>
                    </div>
                  </label>
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Le classement alphabétique rééquilibre automatiquement les groupes à l'enregistrement.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.students.gender}
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'M' | 'F')}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  >
                    <option value="M">Masculin</option>
                    <option value="F">Féminin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t.students.birthDate}
                  </label>
                  <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom du père
                  </label>
                  <input
                    type="text"
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="Nom complet du père"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Téléphone du père
                  </label>
                  <input
                    type="tel"
                    value={fatherPhone}
                    onChange={(e) => setFatherPhone(e.target.value)}
                    placeholder="Ex: 98 123 456"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nom de la mère
                  </label>
                  <input
                    type="text"
                    value={motherName}
                    onChange={(e) => setMotherName(e.target.value)}
                    placeholder="Nom complet de la mère"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Téléphone de la mère
                  </label>
                  <input
                    type="tel"
                    value={motherPhone}
                    onChange={(e) => setMotherPhone(e.target.value)}
                    placeholder="Ex: 22 123 456"
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t.students.address}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Adresse du domicile..."
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Move Student to another class Modal */}
      {movingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-blue-600" />
              {t.students.moveClass}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Déplacer l'élève{' '}
              <span className="font-bold text-slate-800">
                {movingStudent.lastName} {movingStudent.firstName}
              </span>{' '}
              vers une nouvelle classe :
            </p>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Sélectionnez la classe de destination
              </label>
              <select
                value={targetNewClassId}
                onChange={(e) => setTargetNewClassId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs focus:border-blue-500 focus:outline-none"
              >
                {data.classes
                  .filter((c) => c.id !== movingStudent.classId)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.academicLevel})
                    </option>
                  ))}
              </select>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setMovingStudent(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  if (targetNewClassId) {
                    moveStudentClass(movingStudent.id, targetNewClassId);
                    setMovingStudent(null);
                  }
                }}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                Confirmer le déplacement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              {t.students.deleteStudent}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Voulez-vous supprimer définitivement l'élève{' '}
              <span className="font-bold text-slate-900">
                {deleteConfirmStudent.lastName} {deleteConfirmStudent.firstName}
              </span>{' '}
              ? Les notes et historiques associés seront également effacés.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmStudent(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  deleteStudent(deleteConfirmStudent.id);
                  setDeleteConfirmStudent(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700"
              >
                {t.common.confirm} {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Preview Modal (Section 16.1) */}
      {isImportModalOpen && importPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              {t.students.importTitle}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Classe de destination : <span className="font-bold">{activeClass?.name}</span>
            </p>

            <div className="my-4 rounded-xl bg-slate-50 p-3 border border-slate-100 flex items-center justify-between text-xs">
              <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                <CheckCircle className="h-4 w-4" />
                {importPreview.students.length} nouveaux élèves prêts à être insérés
              </span>
              {importPreview.duplicates > 0 && (
                <span className="text-amber-700 font-medium">
                  {importPreview.duplicates} doublons ignorés
                </span>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 text-xs my-2 max-h-56">
              {importPreview.students.map((s, idx) => (
                <div key={idx} className="py-2 flex justify-between items-center">
                  <span className="font-bold text-slate-800">
                    {idx + 1}. {s.lastName} {s.firstName}
                  </span>
                  <span className="text-slate-400">{s.birthDate || 'Date non spécifiée'}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t flex justify-end gap-2">
              <button
                onClick={() => {
                  setIsImportModalOpen(false);
                  setImportPreview(null);
                }}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={handleConfirmImport}
                className="rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
              >
                Importer et Répartir Automatiquement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Entry Drawer / Modal (Section 16.4) */}
      {isQuickEntryOpen && filteredStudents.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Mode Saisie Rapide
                </span>
                <h3 className="text-lg font-black text-slate-900">
                  Élève {quickIndex + 1} / {filteredStudents.length}
                </h3>
              </div>
              <button
                onClick={() => setIsQuickEntryOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            {filteredStudents[quickIndex] && (
              <div className="my-4 space-y-3">
                <div className="rounded-xl bg-blue-50/60 p-4 border border-blue-100">
                  <h4 className="text-base font-black text-slate-900">
                    {filteredStudents[quickIndex].lastName}{' '}
                    {filteredStudents[quickIndex].firstName}
                  </h4>
                  <p className="text-xs text-blue-700 font-semibold mt-0.5">
                    Groupe {filteredStudents[quickIndex].group} • N°{' '}
                    {filteredStudents[quickIndex].orderNumber}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Appréciations / Remarques :
                  </label>
                  <textarea
                    rows={3}
                    value={filteredStudents[quickIndex].teacherNotes || ''}
                    onChange={(e) =>
                      updateStudent(filteredStudents[quickIndex].id, {
                        teacherNotes: e.target.value,
                      })
                    }
                    placeholder="Écrivez une appréciation..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 text-xs focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t">
              <button
                disabled={quickIndex === 0}
                onClick={() => setQuickIndex((prev) => Math.max(0, prev - 1))}
                className="rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 disabled:opacity-40"
              >
                &larr; Précédent
              </button>

              <button
                onClick={() => openStudentProfile(filteredStudents[quickIndex].id)}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Voir profil complet
              </button>

              <button
                disabled={quickIndex === filteredStudents.length - 1}
                onClick={() =>
                  setQuickIndex((prev) => Math.min(filteredStudents.length - 1, prev + 1))
                }
                className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 disabled:opacity-40"
              >
                Suivant &rarr;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
