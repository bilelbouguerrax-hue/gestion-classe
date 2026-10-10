import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  FolderArchive,
  Calendar,
  Lock,
  ArrowRight,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export const ArchivesView: React.FC = () => {
  const {
    data,
    archiveCurrentAcademicYear,
    restoreArchive,
    t,
  } = useApp();

  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [newYearName, setNewYearName] = useState('2026 - 2027');
  const [consultingArchiveId, setConsultingArchiveId] = useState<string | null>(null);

  const handleConfirmArchive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYearName.trim()) return;
    archiveCurrentAcademicYear(newYearName.trim());
    setIsArchiveModalOpen(false);
  };

  const consultingArchive = data.archives?.find((a) => a.id === consultingArchiveId);

  return (
    <div className="space-y-6">
      {/* Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            {t.archives.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.archives.subtitle}</p>
        </div>

        <button
          onClick={() => setIsArchiveModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700 shadow-md shadow-indigo-500/20 active:scale-95 transition-all"
        >
          <FolderArchive className="h-4 w-4" />
          <span>{t.archives.archiveCurrentYear}</span>
        </button>
      </div>

      {/* Current Academic Year Status Card */}
      <div className="rounded-3xl border border-blue-100 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 p-6 shadow-xs flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-bold text-white shadow-2xs">
            Année Active en cours
          </span>
          <h3 className="mt-2 text-2xl font-black text-slate-900">
            {data.settings.academicYear}
          </h3>
          <p className="mt-1 text-xs text-slate-600">
            {data.classes.length} classes actives • {data.students.length} élèves inscrits •{' '}
            {data.attendances.length} séances d'appel • {data.grades.length} dossiers de notes
          </p>
        </div>

        <div className="text-xs text-slate-500 max-w-sm">
          À la clôture de l'année scolaire, toutes vos données (classes, présences, notes et
          discipline) sont scellées dans les archives historiques consultables à tout moment.
        </div>
      </div>

      {/* Archives List */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FolderArchive className="h-5 w-5 text-indigo-600" />
          {t.archives.archivedYears} ({data.archives?.length || 0})
        </h3>

        {!data.archives || data.archives.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            Aucune année scolaire archivée pour l'instant. Votre année courante (
            {data.settings.academicYear}) est votre première année active.
          </div>
        ) : (
          <div className="space-y-3">
            {data.archives.map((arch) => (
              <div
                key={arch.id}
                className="rounded-2xl border border-slate-200 p-4 hover:border-indigo-300 transition-all shadow-2xs flex flex-col md:flex-row md:items-center md:justify-between gap-3"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-black text-slate-900">{arch.year}</span>
                    <span className="flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                      <Lock className="h-3 w-3" />
                      Protégé en lecture seule
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Archivée le {new Date(arch.archivedAt).toLocaleDateString('fr-FR')} •{' '}
                    {arch.classesCount} classes • {arch.studentsCount} élèves
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setConsultingArchiveId(arch.id)}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>Consulter les données</span>
                  </button>

                  <button
                    onClick={() => {
                      if (
                        confirm(
                          `Attention : Voulez-vous restaurer l'année ${arch.year} comme année courante active ?`
                        )
                      ) {
                        restoreArchive(arch.id);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Restaurer en actif</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Archive Modal */}
      {isArchiveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <FolderArchive className="h-5 w-5 text-indigo-600" />
              {t.archives.archiveCurrentYear}
            </h3>
            <p className="mt-2 text-xs text-slate-600">
              L'année <span className="font-bold">{data.settings.academicYear}</span> sera scellée
              dans les archives avec toutes ses notes, présences et élèves. Une nouvelle année
              scolaire vierge sera initialisée.
            </p>

            <form onSubmit={handleConfirmArchive} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nom de la nouvelle année scolaire à ouvrir *
                </label>
                <input
                  type="text"
                  required
                  value={newYearName}
                  onChange={(e) => setNewYearName(e.target.value)}
                  placeholder="Ex: 2026 - 2027"
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-bold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsArchiveModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
                >
                  {t.common.cancel}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-4 py-2 font-bold text-white hover:bg-indigo-700"
                >
                  Confirmer l'archivage et commencer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive Consultation Modal */}
      {consultingArchive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-2xl rounded-3xl bg-white p-6 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Archive : {consultingArchive.year}
                </h3>
                <p className="text-xs text-slate-500">
                  Archivée le {new Date(consultingArchive.archivedAt).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <button
                onClick={() => setConsultingArchiveId(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
              >
                &times;
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-4 text-xs">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <h4 className="font-bold text-slate-700 mb-2">Classes archivées :</h4>
                <div className="grid grid-cols-2 gap-2">
                  {consultingArchive.snapshotData.classes.map((c) => {
                    const stCount = consultingArchive.snapshotData.students.filter(
                      (s) => s.classId === c.id
                    ).length;
                    return (
                      <div key={c.id} className="p-2.5 bg-white rounded-lg border">
                        <span className="font-bold text-slate-900 block">{c.name}</span>
                        <span className="text-slate-500 text-[11px]">{stCount} élèves</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <h4 className="font-bold text-slate-700 mb-2">Statistiques de l'année :</h4>
                <p>Élèves totaux : {consultingArchive.snapshotData.students.length}</p>
                <p>Séances d'appel : {consultingArchive.snapshotData.attendances.length}</p>
                <p>Notes enregistrées : {consultingArchive.snapshotData.grades.length}</p>
              </div>
            </div>

            <div className="pt-3 border-t flex justify-end">
              <button
                onClick={() => setConsultingArchiveId(null)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
