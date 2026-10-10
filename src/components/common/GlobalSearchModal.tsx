import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Search, X, GraduationCap, Users2, Calendar, ShieldAlert } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const { data, openStudentProfile, setSelectedClassId, setActiveTab, t } = useApp();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const q = query.trim().toLowerCase();

  const matchingStudents = q
    ? data.students.filter(
        (s) =>
          s.lastName.toLowerCase().includes(q) ||
          s.firstName.toLowerCase().includes(q) ||
          `${s.lastName} ${s.firstName}`.toLowerCase().includes(q)
      )
    : [];

  const matchingClasses = q
    ? data.classes.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.academicLevel.toLowerCase().includes(q)
      )
    : [];

  const matchingSessions = q
    ? data.timetable.filter(
        (s) =>
          s.subject.toLowerCase().includes(q) ||
          (s.room && s.room.toLowerCase().includes(q))
      )
    : [];

  const matchingDiscipline = q
    ? data.disciplines.filter(
        (d) =>
          d.category.toLowerCase().includes(q) ||
          d.description.toLowerCase().includes(q)
      )
    : [];

  const totalResults =
    matchingStudents.length +
    matchingClasses.length +
    matchingSessions.length +
    matchingDiscipline.length;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/50 p-3 pt-6 backdrop-blur-xs sm:p-6 sm:pt-24 no-print">
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="flex items-center border-b border-slate-200 px-3 py-2.5 sm:px-4 sm:py-3">
          <Search className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 ms-1 me-2 sm:me-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`${t.common.search}...`}
            className="flex-1 bg-transparent text-sm sm:text-base text-slate-800 placeholder-slate-400 outline-none min-w-0"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ms-1.5 sm:ms-2 rounded-lg bg-slate-100 p-1.5 sm:px-2 sm:py-1 text-xs font-semibold text-slate-500 hover:bg-slate-200"
          >
            <span className="hidden sm:inline">Esc</span>
            <X className="h-4 w-4 sm:hidden" />
          </button>
        </div>

        {/* Results Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {!q ? (
            <div className="py-12 text-center text-sm text-slate-400">
              Tapez le nom d'un élève, une classe ou un mot-clé pour lancer la recherche instantanée.
            </div>
          ) : totalResults === 0 ? (
            <div className="py-12 text-center text-sm text-slate-500">
              Aucun résultat trouvé pour « {query} ».
            </div>
          ) : (
            <>
              {/* Students */}
              {matchingStudents.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-blue-500" />
                    Élèves ({matchingStudents.length})
                  </h3>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
                    {matchingStudents.map((s) => {
                      const cl = data.classes.find((c) => c.id === s.classId);
                      return (
                        <div
                          key={s.id}
                          onClick={() => {
                            openStudentProfile(s.id);
                            onClose();
                          }}
                          className="flex items-center justify-between p-3 hover:bg-blue-50/80 cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">
                              {s.lastName} {s.firstName}
                            </span>
                            <span className="ms-2 text-xs text-slate-500">
                              ({cl?.name || 'Classe inconnue'} • Groupe {s.group})
                            </span>
                          </div>
                          <span className="text-xs font-medium text-blue-600">
                            Voir fiche &rarr;
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Classes */}
              {matchingClasses.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Users2 className="h-4 w-4 text-emerald-500" />
                    Classes ({matchingClasses.length})
                  </h3>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
                    {matchingClasses.map((c) => (
                      <div
                        key={c.id}
                        onClick={() => {
                          setSelectedClassId(c.id);
                          setActiveTab('classes');
                          onClose();
                        }}
                        className="flex items-center justify-between p-3 hover:bg-emerald-50/80 cursor-pointer transition-colors"
                      >
                        <div>
                          <span className="font-semibold text-slate-800">{c.name}</span>
                          <span className="ms-2 text-xs text-slate-500">
                            {c.academicLevel}
                          </span>
                        </div>
                        <span className="text-xs font-medium text-emerald-600">
                          Ouvrir la classe &rarr;
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Timetable Sessions */}
              {matchingSessions.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-500" />
                    Séances d'emploi du temps ({matchingSessions.length})
                  </h3>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
                    {matchingSessions.map((sess) => {
                      const cl = data.classes.find((c) => c.id === sess.classId);
                      return (
                        <div
                          key={sess.id}
                          onClick={() => {
                            setActiveTab('timetable');
                            onClose();
                          }}
                          className="flex items-center justify-between p-3 hover:bg-indigo-50/80 cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">
                              {sess.subject}
                            </span>
                            <span className="ms-2 text-xs text-slate-500">
                              {cl?.name} • {sess.startTime} - {sess.endTime} {sess.room && `• ${sess.room}`}
                            </span>
                          </div>
                          <span className="text-xs font-medium text-indigo-600">
                            Voir emploi du temps &rarr;
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Discipline */}
              {matchingDiscipline.length > 0 && (
                <div>
                  <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                    <ShieldAlert className="h-4 w-4 text-rose-500" />
                    Observations disciplinaires ({matchingDiscipline.length})
                  </h3>
                  <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-slate-50/50">
                    {matchingDiscipline.map((d) => {
                      const st = data.students.find((s) => s.id === d.studentId);
                      return (
                        <div
                          key={d.id}
                          onClick={() => {
                            setActiveTab('discipline');
                            onClose();
                          }}
                          className="flex items-center justify-between p-3 hover:bg-rose-50/80 cursor-pointer transition-colors"
                        >
                          <div>
                            <span className="font-semibold text-slate-800">
                              {d.category}
                            </span>
                            <span className="ms-2 text-xs text-slate-500">
                              ({st ? `${st.lastName} ${st.firstName}` : 'Élève'} • {d.date})
                            </span>
                            <p className="text-xs text-slate-600 line-clamp-1 mt-0.5">
                              {d.description}
                            </p>
                          </div>
                          <span className="text-xs font-medium text-rose-600">
                            Voir détails &rarr;
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
