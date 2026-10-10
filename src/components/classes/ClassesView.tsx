import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users2,
  Plus,
  Edit2,
  Trash2,
  ArrowRightLeft,
  GraduationCap,
  Sparkles,
  Layers,
  ChevronRight,
  UserCheck,
} from 'lucide-react';

export const ClassesView: React.FC = () => {
  const {
    data,
    addClass,
    updateClass,
    deleteClass,
    rebalanceClassGroups,
    setSelectedClassId,
    setActiveTab,
    openStudentProfile,
    updateStudent,
    t,
  } = useApp();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [activeTabClassId, setActiveTabClassId] = useState<string>(
    data.classes[0]?.id || ''
  );
  const [bannerNotice, setBannerNotice] = useState<string | null>(null);

  const currentClass = data.classes.find((c) => c.id === activeTabClassId) || data.classes[0];

  const handleOpenAdd = () => {
    setEditingClassId(null);
    setName('');
    setLevel('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (c: { id: string; name: string; academicLevel: string }) => {
    setEditingClassId(c.id);
    setName(c.name);
    setLevel(c.academicLevel);
    setIsModalOpen(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingClassId) {
      updateClass(editingClassId, name.trim(), level.trim());
    } else {
      addClass(name.trim(), level.trim());
    }
    setIsModalOpen(false);
  };

  const handleRebalance = (classId: string) => {
    rebalanceClassGroups(classId);
    setBannerNotice(t.classes.rebalanceSuccess);
    setTimeout(() => setBannerNotice(null), 4000);
  };

  const classStudents = currentClass
    ? data.students.filter((s) => s.classId === currentClass.id)
    : [];

  const group1Students = classStudents.filter((s) => s.group === 1);
  const group2Students = classStudents.filter((s) => s.group === 2);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            {t.classes.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.classes.subtitle}</p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>{t.classes.createClass}</span>
        </button>
      </div>

      {bannerNotice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-800 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{bannerNotice}</span>
          </div>
          <button
            onClick={() => setBannerNotice(null)}
            className="text-xs text-emerald-600 hover:text-emerald-900"
          >
            &times;
          </button>
        </div>
      )}

      {/* Class Switcher Tabs */}
      {data.classes.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
          {data.classes.map((cls) => {
            const count = data.students.filter((s) => s.classId === cls.id).length;
            const isSelected = cls.id === (currentClass?.id || '');
            return (
              <button
                key={cls.id}
                onClick={() => setActiveTabClassId(cls.id)}
                className={`flex shrink-0 items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-bold transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
                }`}
              >
                <span>{cls.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count} élèves
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Main Class Card & Group Separation */}
      {currentClass ? (
        <div className="space-y-6">
          {/* Class Details Bar */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900">{currentClass.name}</h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700">
                  {currentClass.academicLevel}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">
                {classStudents.length} élèves inscrits (Max autorisé : 40 élèves / 20 par groupe)
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleRebalance(currentClass.id)}
                className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors shadow-2xs"
                title="Trier par ordre alphabétique et répartir à égalité entre Groupe 1 et Groupe 2"
              >
                <ArrowRightLeft className="h-3.5 w-3.5 text-indigo-600" />
                <span>{t.classes.rebalanceGroups}</span>
              </button>

              <button
                onClick={() => handleOpenEdit(currentClass)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setDeleteConfirmId(currentClass.id)}
                className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* 2 Groups Grid: Groupe 1 and Groupe 2 */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Groupe 1 */}
            <div className="rounded-2xl border border-blue-200 bg-white shadow-xs overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-5 py-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  <h4 className="text-base font-bold">Groupe 1</h4>
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                  {group1Students.length} / 20 élèves
                </span>
              </div>

              <div className="p-4 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {group1Students.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">
                    Aucun élève dans le Groupe 1
                  </p>
                ) : (
                  group1Students.map((s) => (
                    <div
                      key={s.id}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors group"
                    >
                      <div
                        onClick={() => openStudentProfile(s.id)}
                        className="cursor-pointer flex items-center gap-2.5"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                          {s.orderNumber}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600">
                            {s.lastName} {s.firstName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Inscrit le {s.registrationDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateStudent(s.id, { group: 2 })}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                          title="Basculer vers le Groupe 2"
                        >
                          Passer Gr. 2 &rarr;
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Groupe 2 */}
            <div className="rounded-2xl border border-indigo-200 bg-white shadow-xs overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  <h4 className="text-base font-bold">Groupe 2</h4>
                </div>
                <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-xs font-bold">
                  {group2Students.length} / 20 élèves
                </span>
              </div>

              <div className="p-4 divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
                {group2Students.length === 0 ? (
                  <p className="py-8 text-center text-xs text-slate-400">
                    Aucun élève dans le Groupe 2
                  </p>
                ) : (
                  group2Students.map((s) => (
                    <div
                      key={s.id}
                      className="py-2.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors group"
                    >
                      <div
                        onClick={() => openStudentProfile(s.id)}
                        className="cursor-pointer flex items-center gap-2.5"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                          {s.orderNumber}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-800 group-hover:text-indigo-600">
                            {s.lastName} {s.firstName}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            Inscrit le {s.registrationDate}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateStudent(s.id, { group: 1 })}
                          className="rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                          title="Basculer vers le Groupe 1"
                        >
                          &larr; Passer Gr. 1
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 p-12 text-center">
          <p className="text-sm text-slate-500">{t.classes.noClasses}</p>
        </div>
      )}

      {/* Add / Edit Class Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900">
              {editingClassId ? t.classes.editClass : t.classes.createClass}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Une classe est automatiquement organisée en 2 groupes distincts de 20 élèves max chacun.
            </p>

            <form onSubmit={handleSaveClass} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom ou désignation de la classe *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t.classes.namePlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Niveau scolaire
                </label>
                <input
                  type="text"
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  placeholder={t.classes.levelPlaceholder}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                >
                  {t.common.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-600 flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              {t.classes.deleteClass}
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              {t.classes.deleteConfirmMsg}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                {t.common.cancel}
              </button>
              <button
                onClick={() => {
                  deleteClass(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white hover:bg-rose-700"
              >
                {t.common.confirm} {t.common.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
