import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { DisciplineRecord } from '../../types';
import {
  ShieldAlert,
  Plus,
  Trash2,
  Filter,
  Calendar,
  User,
  MessageSquare,
  Award,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export const DisciplineView: React.FC = () => {
  const {
    data,
    addDisciplineRecord,
    deleteDisciplineRecord,
    openStudentProfile,
    updateSettings,
    t,
  } = useApp();

  const [selectedClassId, setSelectedClassId] = useState<string>(
    data.classes[0]?.id || ''
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [studentId, setStudentId] = useState('');
  const [category, setCategory] = useState(data.settings.disciplineCategories[0] || 'Travail non fait');
  const [customCategory, setCustomCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [teacherComment, setTeacherComment] = useState('');

  const activeClass = data.classes.find((c) => c.id === selectedClassId) || data.classes[0];

  const classStudents = activeClass
    ? data.students.filter((s) => s.classId === activeClass.id)
    : [];

  // Filtered observations
  const filteredDiscipline = data.disciplines
    .filter((d) => d.classId === (activeClass?.id || ''))
    .filter((d) => (selectedCategory === 'all' ? true : d.category === selectedCategory));

  const handleOpenAdd = () => {
    setStudentId(classStudents[0]?.id || '');
    setCategory(data.settings.disciplineCategories[0] || 'Travail non fait');
    setCustomCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setTeacherComment('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || !description.trim() || !activeClass) return;

    let finalCategory = category;
    if (category === 'Autre observation' && customCategory.trim()) {
      finalCategory = customCategory.trim();
      // Optionally add to saved categories if not present
      if (!data.settings.disciplineCategories.includes(finalCategory)) {
        updateSettings({
          disciplineCategories: [...data.settings.disciplineCategories, finalCategory],
        });
      }
    }

    addDisciplineRecord({
      studentId,
      classId: activeClass.id,
      date,
      category: finalCategory,
      description: description.trim(),
      teacherComment: teacherComment.trim(),
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Add Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            {t.discipline.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.discipline.subtitle}</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span>{t.discipline.addObservation}</span>
        </button>
      </div>

      {/* Class and Category Filters */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
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
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="all">Toutes les observations ({filteredDiscipline.length})</option>
            {data.settings.disciplineCategories.map((cat, i) => (
              <option key={i} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Disciplinary Table (Section 7.1) */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50/75 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3.5 w-12 text-center">N°</th>
                <th className="px-4 py-3.5 min-w-[160px]">Nom et Prénom</th>
                <th className="px-4 py-3.5 w-28">Date</th>
                <th className="px-4 py-3.5 min-w-[180px]">Nature de l'observation</th>
                <th className="px-4 py-3.5 min-w-[220px]">Description</th>
                <th className="px-4 py-3.5 min-w-[200px]">Commentaire Enseignant</th>
                <th className="px-4 py-3.5 w-16 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredDiscipline.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Aucune observation enregistrée dans cette sélection
                  </td>
                </tr>
              ) : (
                filteredDiscipline.map((item, idx) => {
                  const student = data.students.find((s) => s.id === item.studentId);
                  const isPositive =
                    item.category === 'Comportement positif' ||
                    item.category === 'Félicitations';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          onClick={() => student && openStudentProfile(student.id)}
                          className="font-bold text-slate-900 hover:text-blue-600 text-start"
                        >
                          {student ? `${student.lastName} ${student.firstName}` : 'Élève inconnu'}
                        </button>
                        <span className="block text-[10px] text-slate-400">
                          {student ? `Gr. ${student.group}` : ''}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-500 font-mono text-[11px]">
                        {item.date}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                            isPositive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.category}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-slate-800">
                        {item.description}
                      </td>

                      <td className="px-4 py-3 text-slate-500 italic">
                        {item.teacherComment || '—'}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => deleteDisciplineRecord(item.id)}
                          className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-50"
                          title="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Observation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-rose-600" />
              {t.discipline.addObservation}
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Classe : <span className="font-bold">{activeClass?.name}</span>
            </p>

            <form onSubmit={handleSave} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Élève concerné *
                </label>
                <select
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-800"
                >
                  {classStudents.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.lastName} {s.firstName} (Gr. {s.group})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Nature / Catégorie *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 p-2"
                  >
                    {data.settings.disciplineCategories.map((c, i) => (
                      <option key={i} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {category === 'Autre observation' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Précisez la catégorie personnalisée :
                  </label>
                  <input
                    type="text"
                    required
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    placeholder="Ex: Encouragements projet..."
                    className="w-full rounded-xl border border-slate-200 p-2"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description de l'incident / fait *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explication des faits constatés..."
                  className="w-full rounded-xl border border-slate-200 p-2.5"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Commentaire personnel de l'enseignant (facultatif)
                </label>
                <input
                  type="text"
                  value={teacherComment}
                  onChange={(e) => setTeacherComment(e.target.value)}
                  placeholder="Mesures prises, remarques..."
                  className="w-full rounded-xl border border-slate-200 p-2"
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
