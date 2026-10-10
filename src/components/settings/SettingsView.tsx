import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  User,
  School,
  Lock,
  Download,
  Upload,
  RotateCcw,
  Plus,
  Trash2,
  CheckCircle2,
  Save,
  Languages,
  ShieldCheck,
} from 'lucide-react';
import { downloadBackupJson } from '../../services/api';

export const SettingsView: React.FC = () => {
  const { data, multiStore, updateSettings, resetToDemoData, restoreFromData, t } = useApp();

  const [teacherName, setTeacherName] = useState(data.settings.teacherName);
  const [schoolName, setSchoolName] = useState(data.settings.schoolName);
  const [academicYear, setAcademicYear] = useState(data.settings.academicYear);
  const [mainSubject, setMainSubject] = useState(data.settings.mainSubject);

  const [coeffControl, setCoeffControl] = useState(data.settings.evalCoefficients.control);
  const [coeffActivities, setCoeffActivities] = useState(data.settings.evalCoefficients.activities);
  const [coeffSynthesis, setCoeffSynthesis] = useState(data.settings.evalCoefficients.synthesis);

  const [precision, setPrecision] = useState(data.settings.gradeDisplayPrecision || 2);
  const [allowPartial, setAllowPartial] = useState(data.settings.allowPartialAverage || false);

  const [isPinEnabled, setIsPinEnabled] = useState(data.settings.isPinEnabled || false);
  const [pinCode, setPinCode] = useState(data.settings.pinCode || '1234');

  const [newActivityCat, setNewActivityCat] = useState('');
  const [newDisciplineCat, setNewDisciplineCat] = useState('');

  const [saveBanner, setSaveBanner] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      teacherName: teacherName.trim(),
      schoolName: schoolName.trim(),
      academicYear: academicYear.trim(),
      mainSubject: mainSubject.trim(),
      evalCoefficients: {
        control: Number(coeffControl),
        activities: Number(coeffActivities),
        synthesis: Number(coeffSynthesis),
      },
      gradeDisplayPrecision: Number(precision),
      allowPartialAverage: allowPartial,
      isPinEnabled,
      pinCode: pinCode.trim(),
    });

    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2500);
  };

  const handleAddActivityCategory = () => {
    if (!newActivityCat.trim()) return;
    if (!data.settings.activityCategories.includes(newActivityCat.trim())) {
      updateSettings({
        activityCategories: [...data.settings.activityCategories, newActivityCat.trim()],
      });
      setNewActivityCat('');
    }
  };

  const handleDeleteActivityCategory = (cat: string) => {
    updateSettings({
      activityCategories: data.settings.activityCategories.filter((c) => c !== cat),
    });
  };

  const handleAddDisciplineCategory = () => {
    if (!newDisciplineCat.trim()) return;
    if (!data.settings.disciplineCategories.includes(newDisciplineCat.trim())) {
      updateSettings({
        disciplineCategories: [...data.settings.disciplineCategories, newDisciplineCat.trim()],
      });
      setNewDisciplineCat('');
    }
  };

  const handleDeleteDisciplineCategory = (cat: string) => {
    updateSettings({
      disciplineCategories: data.settings.disciplineCategories.filter((c) => c !== cat),
    });
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.classes && parsed.students) {
          restoreFromData(parsed);
          alert('Sauvegarde restaurée avec succès !');
        } else {
          alert('Fichier de sauvegarde invalide.');
        }
      } catch (err: any) {
        alert(`Erreur de lecture : ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
            {t.settings.title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">{t.settings.subtitle}</p>
        </div>

        {saveBanner && (
          <span className="flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
            <CheckCircle2 className="h-4 w-4" />
            Paramètres enregistrés !
          </span>
        )}
      </div>

      <form onSubmit={handleSaveGeneral} className="space-y-6">
        {/* Section 1: Profil de l'enseignant et Établissement */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Profil Enseignant & Établissement
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.settings.teacherName} *
              </label>
              <input
                type="text"
                required
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.settings.schoolName} *
              </label>
              <input
                type="text"
                required
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.settings.academicYear} *
              </label>
              <input
                type="text"
                required
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.settings.mainSubject} *
              </label>
              <input
                type="text"
                required
                value={mainSubject}
                onChange={(e) => setMainSubject(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-bold text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Coefficients et Règles de calcul des moyennes (Section 6.2 & 14) */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Settings className="h-5 w-5 text-indigo-600" />
            Modalités d'Évaluation & Coefficients
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs mb-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.settings.coeffControl}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={coeffControl}
                onChange={(e) => setCoeffControl(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-black text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.settings.coeffActivities}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={coeffActivities}
                onChange={(e) => setCoeffActivities(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-black text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.settings.coeffSynthesis}
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={coeffSynthesis}
                onChange={(e) => setCoeffSynthesis(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5 font-black text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-4 border-t">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {t.settings.precision}
              </label>
              <select
                value={precision}
                onChange={(e) => setPrecision(Number(e.target.value))}
                className="w-full rounded-xl border border-slate-200 p-2.5"
              >
                <option value={1}>{t.settings.precision1}</option>
                <option value={2}>{t.settings.precision2}</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="partialAvg"
                checked={allowPartial}
                onChange={(e) => setAllowPartial(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600"
              />
              <label htmlFor="partialAvg" className="text-slate-700 font-medium">
                Calculer une moyenne provisoire même si des évaluations manquent (sinon affiche "Incomplète")
              </label>
            </div>
          </div>
        </div>

        {/* Section 3: Sécurité et Code PIN */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" />
            Sécurité d'Accès & Code PIN Personnel
          </h3>

          <div className="space-y-4 text-xs">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="pinToggle"
                checked={isPinEnabled}
                onChange={(e) => setIsPinEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-blue-600"
              />
              <label htmlFor="pinToggle" className="text-slate-800 font-bold">
                {t.settings.pinEnable}
              </label>
            </div>

            {isPinEnabled && (
              <div className="max-w-xs">
                <label className="block font-bold text-slate-700 mb-1">
                  {t.settings.pinCode}
                </label>
                <input
                  type="password"
                  maxLength={4}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 font-mono text-base tracking-widest text-center"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save General Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 text-sm font-bold text-white hover:bg-blue-700 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Save className="h-4 w-4" />
            <span>Enregistrer toutes les modifications</span>
          </button>
        </div>
      </form>

      {/* Section 4: Catégories Personnalisées */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Catégories d'activités diverses */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Catégories d'Activités Diverses
          </h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newActivityCat}
              onChange={(e) => setNewActivityCat(e.target.value)}
              placeholder="Nouvelle catégorie..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={handleAddActivityCategory}
              className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
            >
              Ajouter
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {data.settings.activityCategories.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
              >
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteActivityCategory(c)}
                  className="text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Catégories disciplinaires */}
        <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-3">
            Catégories d'Observations Disciplinaires
          </h3>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newDisciplineCat}
              onChange={(e) => setNewDisciplineCat(e.target.value)}
              placeholder="Nouvelle catégorie..."
              className="flex-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs"
            />
            <button
              type="button"
              onClick={handleAddDisciplineCategory}
              className="rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
            >
              Ajouter
            </button>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {data.settings.disciplineCategories.map((c, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs"
              >
                <span>{c}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteDisciplineCategory(c)}
                  className="text-rose-500 hover:text-rose-700"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Section 5: Sauvegardes & Restauration (Section 12.4) */}
      <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Download className="h-5 w-5 text-emerald-600" />
          Sauvegarde & Restauration des Données
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => downloadBackupJson(multiStore)}
            className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-bold text-emerald-800 hover:bg-emerald-100 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{t.settings.manualBackup}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-xs font-bold text-blue-800 hover:bg-blue-100 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>{t.settings.restoreFile}</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleRestoreFile}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Voulez-vous réinitialiser toutes les données avec le jeu de test démonstration complet ?'
                )
              ) {
                resetToDemoData();
              }
            }}
            className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>{t.settings.resetToDemo}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
