import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Plus,
  Check,
  Trash2,
  Lock,
  GraduationCap,
  X,
  School,
  BookOpen,
  ArrowRight,
  UserCheck,
} from 'lucide-react';

export const TeacherSwitchModal: React.FC = () => {
  const {
    isTeacherSelectorOpen,
    closeTeacherSelector,
    allTeachers,
    activeTeacher,
    switchTeacher,
    createTeacher,
    deleteTeacher,
    t,
  } = useApp();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [school, setSchool] = useState(activeTeacher?.schoolName || 'Lycée Kalaat El Andalous');
  const [academicYear, setAcademicYear] = useState('2025 - 2026');
  const [pinCode, setPinCode] = useState('1234');
  const [isPinEnabled, setIsPinEnabled] = useState(false);

  if (!isTeacherSelectorOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;

    createTeacher({
      name: name.trim(),
      schoolName: school.trim(),
      mainSubject: subject.trim(),
      academicYear: academicYear.trim(),
      pinCode: pinCode.trim() || '1234',
      isPinEnabled,
      avatarColor: 'from-emerald-600 to-teal-600',
    });

    setIsCreatingNew(false);
    setName('');
    setSubject('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs no-print">
      <div className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl ring-1 ring-slate-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-md shadow-blue-500/20">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                Espace Multi-Enseignants / حسابات الأساتذة
              </h3>
              <p className="text-xs text-slate-500">
                Chaque enseignant dispose d'un espace de travail complet, étanche et indépendant.
              </p>
            </div>
          </div>

          <button
            onClick={closeTeacherSelector}
            className="rounded-xl p-2 text-slate-400 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {!isCreatingNew ? (
            <>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Enseignants enregistrés ({allTeachers.length})
                </span>
                <button
                  onClick={() => setIsCreatingNew(true)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-2xs transition-all active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Ajouter un enseignant</span>
                </button>
              </div>

              <div className="space-y-2.5">
                {allTeachers.map((tch) => {
                  const isActive = activeTeacher?.id === tch.id;
                  return (
                    <div
                      key={tch.id}
                      className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50/60 shadow-xs ring-2 ring-blue-500/10'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div
                          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-white font-bold text-base shadow-xs bg-gradient-to-tr ${
                            tch.avatarColor || 'from-blue-600 to-indigo-600'
                          }`}
                        >
                          {tch.name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-slate-900">{tch.name}</h4>
                            {isActive && (
                              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white">
                                Actif
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-semibold text-blue-600 mt-0.5">
                            {tch.mainSubject}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            {tch.schoolName} • {tch.academicYear}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {!isActive ? (
                          <button
                            onClick={() => switchTeacher(tch.id)}
                            className="flex items-center gap-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-600 transition-colors shadow-2xs"
                          >
                            <span>Ouvrir l'espace</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        ) : (
                          <span className="flex items-center gap-1 text-xs font-bold text-blue-700 bg-blue-100/70 px-3 py-1.5 rounded-xl">
                            <Check className="h-4 w-4" />
                            Session en cours
                          </span>
                        )}

                        {allTeachers.length > 1 && !isActive && (
                          <button
                            onClick={() => {
                              if (confirm(`Supprimer le compte de ${tch.name} et toutes ses données ?`)) {
                                deleteTeacher(tch.id);
                              }
                            }}
                            className="rounded-lg p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600"
                            title="Supprimer ce compte"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* Create new teacher form */
            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="flex items-center justify-between border-b pb-2 mb-3">
                <h4 className="font-bold text-slate-900 text-sm">
                  Création d'un nouveau compte enseignant
                </h4>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  &larr; Retour à la liste
                </button>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nom et prénom de l'enseignant *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: M. Ahmed Ben Ali, Mme. Sonia Mansour..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Matière enseignée *
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ex: Sciences Physiques, Histoire..."
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Année scolaire
                  </label>
                  <input
                    type="text"
                    required
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Établissement scolaire
                </label>
                <input
                  type="text"
                  required
                  value={school}
                  onChange={(e) => setSchool(e.target.value)}
                  placeholder="Ex: Collège Pilote, Lycée..."
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Code PIN de sécurité (4 chiffres)
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2 font-mono text-center tracking-widest"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="newTchPinToggle"
                    checked={isPinEnabled}
                    onChange={(e) => setIsPinEnabled(e.target.checked)}
                    className="h-4 w-4 rounded text-blue-600"
                  />
                  <label htmlFor="newTchPinToggle" className="text-slate-700 font-bold">
                    Activer la protection par PIN
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  Créer et Ouvrir l'espace
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
