import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { TeacherAccount } from '../../types';
import {
  School,
  Lock,
  UserCheck,
  UserPlus,
  ArrowRight,
  Languages,
  Sparkles,
  KeyRound,
  Calendar,
  Users,
  Layers,
  Award,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export const WelcomeAuthScreen: React.FC = () => {
  const {
    allTeachers,
    loginTeacher,
    createTeacher,
    deleteTeacher,
    data,
    lang,
    setLanguage,
  } = useApp();

  const [teacherToDelete, setTeacherToDelete] = useState<TeacherAccount | null>(null);

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(
    allTeachers.length > 0 ? 'login' : 'register'
  );

  useEffect(() => {
    if (allTeachers.length === 0) {
      setActiveTab('register');
    }
  }, [allTeachers.length]);

  // Login states
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(
    allTeachers[0]?.id || ''
  );

  useEffect(() => {
    if (allTeachers.length > 0 && !allTeachers.some((t) => t.id === selectedTeacherId)) {
      setSelectedTeacherId(allTeachers[0].id);
    }
  }, [allTeachers, selectedTeacherId]);

  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  // Register form states
  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
  const [school, setSchool] = useState(
    data.settings.schoolName || 'Lycée Kalaat El Andalous'
  );
  const [academicYear, setAcademicYear] = useState(
    data.settings.academicYear || '2025 - 2026'
  );
  const [newPin, setNewPin] = useState('1234');
  const [enablePin, setEnablePin] = useState(false);

  const selectedTeacher = allTeachers.find((t) => t.id === selectedTeacherId);

  const handleSelectTeacher = (teacher: TeacherAccount) => {
    setSelectedTeacherId(teacher.id);
    setPinInput('');
    setPinError(false);

    // If teacher doesn't require PIN, login directly!
    if (!teacher.isPinEnabled) {
      loginTeacher(teacher.id);
    }
  };

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    const ok = loginTeacher(selectedTeacher.id, pinInput);
    if (!ok) {
      setPinError(true);
      setPinInput('');
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !subject.trim()) return;

    createTeacher({
      name: name.trim(),
      schoolName: school.trim(),
      mainSubject: subject.trim(),
      academicYear: academicYear.trim(),
      pinCode: newPin.trim() || '1234',
      isPinEnabled: enablePin,
      avatarColor: 'from-blue-600 to-indigo-600',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between antialiased selection:bg-blue-600 selection:text-white" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Top Navigation Bar */}
      <header className="w-full bg-white border-b border-slate-200/80 shadow-xs sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between">
          {/* Institution details */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md shadow-blue-500/20">
              <School className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-blue-600 block truncate">
                {lang === 'ar' ? 'المؤسسة التربوية' : 'Établissement Scolaire'}
              </span>
              <h2 className="text-sm sm:text-lg font-black tracking-tight text-slate-900 truncate">
                Lycée Kalaat El Andalous
              </h2>
            </div>
          </div>

          {/* Actions: Language switch */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setLanguage(lang === 'fr' ? 'ar' : 'fr')}
              className="flex items-center gap-1.5 sm:gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-slate-800 transition-all shadow-2xs cursor-pointer"
            >
              <Languages className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
              <span>{lang === 'fr' ? 'العربية' : 'Français'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Two-Column Layout: Left = Image, Right = Authentication Form */}
      <main className="max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-12 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-center">
          
          {/* LEFT SIDE (in LTR): Realistic Photo & Feature Highlights */}
          <div className="lg:col-span-7 flex flex-col items-center order-2 lg:order-1">
            <div className="w-full relative rounded-2xl sm:rounded-3xl overflow-hidden border border-slate-200/90 shadow-xl sm:shadow-2xl bg-white group">
              {/* Realistic educational photograph */}
              <div className="relative aspect-4/3 w-full overflow-hidden bg-slate-100">
                <img
                  src="/images/portal_banner.jpg"
                  alt="Lycée Kalaat El Andalous - Gestion Classe"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-102"
                />
                {/* Subtle gradient overlay at bottom for readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/25 to-transparent pointer-events-none" />
                
                {/* Banner Caption */}
                <div className="absolute bottom-2.5 left-2.5 right-2.5 sm:bottom-4 sm:left-4 sm:right-4 text-white p-3 sm:p-5 rounded-xl sm:rounded-2xl bg-black/55 backdrop-blur-md border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-blue-600 text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wide">
                      {lang === 'ar' ? 'فضاء الأستاذ المباشر' : 'Espace Enseignant'}
                    </span>
                    <span className="text-[11px] sm:text-xs text-slate-200 font-semibold truncate">
                      Lycée Kalaat El Andalous
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-base md:text-lg font-bold text-white leading-snug">
                    {lang === 'ar'
                      ? 'متابعة بيداغوجية حية للدفاتر والأعداد، الغيابات، وحساب المعدلات وفق المعاملات الرسمية'
                      : 'Suivi pédagogique complet : gestion de classe, absences, notes et discipline'}
                  </h3>
                </div>
              </div>

              {/* Quick Feature Badges below the image */}
              <div className="grid grid-cols-3 divide-x divide-slate-100 bg-white p-2.5 sm:p-4 text-center">
                <div className="p-1 sm:p-2">
                  <div className="flex justify-center mb-1 text-blue-600">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                    {lang === 'ar' ? 'فوجان متوازنان' : '2 Groupes'}
                  </div>
                  <div className="text-[9px] sm:text-[11px] text-slate-500 truncate">
                    {lang === 'ar' ? 'فرز آلي' : 'Tri alphabétique'}
                  </div>
                </div>

                <div className="p-1 sm:p-2">
                  <div className="flex justify-center mb-1 text-indigo-600">
                    <Layers className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                    {lang === 'ar' ? 'مراقبة ومعدلات' : 'Moyennes'}
                  </div>
                  <div className="text-[9px] sm:text-[11px] text-slate-500 truncate">
                    {lang === 'ar' ? 'معامل 1، 1 و2' : 'Coeff 1, 1 & 2'}
                  </div>
                </div>

                <div className="p-1 sm:p-2">
                  <div className="flex justify-center mb-1 text-emerald-600">
                    <Award className="h-4 w-4 sm:h-5 sm:w-5" />
                  </div>
                  <div className="text-[11px] sm:text-xs font-bold text-slate-900 truncate">
                    {lang === 'ar' ? 'طباعة A4' : 'Fiches A4'}
                  </div>
                  <div className="text-[9px] sm:text-[11px] text-slate-500 truncate">
                    {lang === 'ar' ? 'أرشيف وتصدير' : 'Excel & Archives'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE (in LTR): Authentication Form (Login & Register) */}
          <div className="lg:col-span-5 flex flex-col justify-center order-1 lg:order-2">
            {/* Project Title and Intro */}
            <div className="mb-6 space-y-2">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-bold text-blue-700">
                <Sparkles className="h-3.5 w-3.5 text-blue-600" />
                <span>
                  {lang === 'ar' ? 'فضاء الأساتذة الرقمي' : 'Portail des Enseignants'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">
                Gestion Classe
              </h1>
              <p className="text-sm sm:text-base font-medium text-slate-600">
                {lang === 'ar'
                  ? 'المساعد البيداغوجي الشخصي ومتابعة التقييم والغياب'
                  : 'Assistant pédagogique personnel et suivi intégral des élèves'}
              </p>
            </div>

            {/* Form Card */}
            <div className="rounded-3xl bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 p-6 sm:p-7">
              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100/90 p-1.5 rounded-2xl mb-6 border border-slate-200/60">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'login'
                      ? 'bg-white text-blue-700 shadow-md shadow-slate-200 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserCheck className="h-4 w-4" />
                  <span>{lang === 'ar' ? 'تسجيل الدخول' : 'Se connecter'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                    activeTab === 'register'
                      ? 'bg-white text-blue-700 shadow-md shadow-slate-200 font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="h-4 w-4" />
                  <span>{lang === 'ar' ? 'حساب جديد' : 'Nouveau compte'}</span>
                </button>
              </div>

              {/* TAB 1: LOGIN (Se connecter) */}
              {activeTab === 'login' && (
                <div className="space-y-5">
                  {allTeachers.length === 0 ? (
                    <div className="text-center py-8 px-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 mb-3">
                        <UserPlus className="h-6 w-6" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800 mb-1">
                        {lang === 'ar' ? 'لا يوجد حساب أستاذ مسجل حالياً' : 'Aucun compte enseignant enregistré'}
                      </h4>
                      <p className="text-xs text-slate-500 mb-4 max-w-xs mx-auto">
                        {lang === 'ar'
                          ? 'ابدأ بإنشاء حسابك الشخصي لمتابعة الأقسام والغيابات وإسناد الأعداد.'
                          : 'Commencez par créer votre compte pour gérer vos classes, absences et notes.'}
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveTab('register')}
                        className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-all cursor-pointer"
                      >
                        <UserPlus className="h-4 w-4" />
                        <span>{lang === 'ar' ? 'إنشاء حساب جديد الآن' : 'Créer un compte maintenant'}</span>
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                          {lang === 'ar'
                            ? 'اختر حساب الأستاذ للمتابعة :'
                            : 'Sélectionnez votre compte enseignant :'}
                        </label>

                        <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                          {allTeachers.map((tch) => {
                            const isSelected = tch.id === selectedTeacherId;
                            return (
                              <div
                                key={tch.id}
                                onClick={() => handleSelectTeacher(tch)}
                                className={`flex items-center justify-between p-2.5 sm:p-3.5 rounded-2xl border cursor-pointer transition-all gap-2 ${
                                  isSelected
                                    ? 'border-blue-600 bg-blue-50/70 shadow-sm ring-1 ring-blue-600'
                                    : 'border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                                  <div
                                    className={`flex h-9 w-9 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base text-white shadow-sm bg-gradient-to-tr ${
                                      tch.avatarColor || 'from-blue-600 to-indigo-600'
                                    }`}
                                  >
                                    {tch.name.charAt(0)}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate">{tch.name}</h4>
                                    <p className="text-[11px] sm:text-xs font-semibold text-blue-700 truncate">
                                      {tch.mainSubject}
                                    </p>
                                    <p className="text-[10px] sm:text-[11px] font-medium text-slate-500 truncate">
                                      {tch.schoolName || 'Lycée Kalaat El Andalous'}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                                  {tch.isPinEnabled ? (
                                    <span className="flex items-center gap-1 rounded-full bg-amber-100 border border-amber-300 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-amber-800">
                                      <Lock className="h-3 w-3 text-amber-700" />
                                      PIN
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-1 rounded-full bg-emerald-100 border border-emerald-300 px-2 py-0.5 sm:px-2.5 sm:py-1 text-[10px] sm:text-[11px] font-bold text-emerald-800">
                                      {lang === 'ar' ? 'دخول' : 'Accès'} &rarr;
                                    </span>
                                  )}

                                  {/* Delete Teacher Account Button */}
                                  <button
                                    type="button"
                                    title={lang === 'ar' ? 'حذف هذا الحساب' : 'Supprimer ce compte'}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setTeacherToDelete(tch);
                                    }}
                                    className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg sm:rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* PIN Code Verification if selected teacher has PIN enabled */}
                      {selectedTeacher?.isPinEnabled && (
                        <form onSubmit={handlePinSubmit} className="pt-4 border-t border-slate-200 space-y-3">
                          <div className="text-center">
                            <label className="block text-xs font-bold text-slate-700 mb-1.5">
                              {lang === 'ar'
                                ? `أدخل رمز PIN الخاص بالأستاذ ${selectedTeacher.name} :`
                                : `Entrez le code PIN personnel de ${selectedTeacher.name} :`}
                            </label>
                            <input
                              type="password"
                              maxLength={4}
                              required
                              autoFocus
                              value={pinInput}
                              onChange={(e) => {
                                setPinInput(e.target.value);
                                setPinError(false);
                              }}
                              placeholder="••••"
                              className="w-36 mx-auto rounded-2xl border border-slate-300 bg-white p-2.5 text-center font-mono text-xl tracking-widest text-slate-900 shadow-inner focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                            />
                            {pinError && (
                              <p className="mt-1.5 text-xs font-bold text-rose-600">
                                {lang === 'ar'
                                  ? 'رمز PIN غير صحيح. يرجى إعادة المحاولة.'
                                  : 'Code PIN incorrect. Veuillez réessayer.'}
                              </p>
                            )}
                          </div>

                          <button
                            type="submit"
                            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-98"
                          >
                            <KeyRound className="h-4 w-4" />
                            <span>{lang === 'ar' ? 'تأكيد ودخول' : 'Valider et continuer'}</span>
                          </button>
                        </form>
                      )}

                      {!selectedTeacher?.isPinEnabled && selectedTeacher && (
                        <button
                          type="button"
                          onClick={() => handleSelectTeacher(selectedTeacher)}
                          className="w-full flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-98"
                        >
                          <span>
                            {lang === 'ar'
                              ? `الدخول باسم ${selectedTeacher.name}`
                              : `Ouvrir l'espace de ${selectedTeacher.name}`}
                          </span>
                          <ArrowRight className="h-4 w-4" />
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* TAB 2: REGISTER (Nouveau compte) */}
              {activeTab === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {lang === 'ar' ? 'الاسم واللقب' : 'Nom & Prénom de l’enseignant'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={lang === 'ar' ? 'مثال: أ. محمد بن سالم' : 'Ex: M. Mohamed Ben Salem'}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'المادة المدرسّة' : 'Matière enseignée'}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={lang === 'ar' ? 'رياضيات، فيزياء...' : 'Mathématiques, Français...'}
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'السنة الدراسية' : 'Année scolaire'}
                      </label>
                      <input
                        type="text"
                        required
                        value={academicYear}
                        onChange={(e) => setAcademicYear(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      {lang === 'ar' ? 'المؤسسة التربوية' : 'Établissement scolaire'}
                    </label>
                    <input
                      type="text"
                      required
                      value={school}
                      onChange={(e) => setSchool(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white p-2.5 text-sm font-medium text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        {lang === 'ar' ? 'رمز PIN (4 أرقام)' : 'Code PIN (4 chiffres)'}
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value)}
                        className="w-full rounded-xl border border-slate-300 bg-white p-2 text-center font-mono text-base tracking-widest text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>

                    <div className="flex items-center gap-2 pt-2 sm:pt-6">
                      <input
                        type="checkbox"
                        id="enablePinWelcomeLight"
                        checked={enablePin}
                        onChange={(e) => setEnablePin(e.target.checked)}
                        className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="enablePinWelcomeLight" className="text-slate-700 font-bold cursor-pointer">
                        {lang === 'ar' ? 'تفعيل حماية الـ PIN' : 'Activer la protection PIN'}
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full mt-4 flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 py-3 text-sm font-bold text-white shadow-md shadow-blue-500/25 transition-all cursor-pointer active:scale-98"
                  >
                    <span>{lang === 'ar' ? 'إنشاء الحساب وبدء العمل' : 'Créer mon espace et commencer'}</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </form>
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Modern Light Mode Footer */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-4 text-center text-xs text-slate-500 font-medium">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            {lang === 'ar'
              ? 'تطبيق إدارة الأقسام — المساعد البيداغوجي الشخصي للأستاذ'
              : 'Gestion Classe — Assistant Pédagogique Personnel • Lycée Kalaat El Andalous'}
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>{academicYear}</span>
            <span>•</span>
            <span>Compatible PC, Tablette & Mobile</span>
          </div>
        </div>
      </footer>

      {/* Confirmation Modal: Delete Teacher Account */}
      {teacherToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {lang === 'ar' ? 'تأكيد حذف حساب الأستاذ' : 'Confirmer la suppression du compte'}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'ar' ? 'هذا الإجراء نهائي ولا يمكن التراجع عنه' : 'Cette action est irréversible'}
                </p>
              </div>
            </div>

            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-3.5">
              <p className="text-sm font-bold text-slate-800">
                {teacherToDelete.name}
              </p>
              <p className="text-xs text-blue-600 font-medium">
                {teacherToDelete.mainSubject} • {teacherToDelete.schoolName}
              </p>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {lang === 'ar'
                ? `هل أنت متأكد من رغبتك في حذف حساب ${teacherToDelete.name} وجميع أقسامه وتلاميذه والتقييمات المسجلة به نهائياً من المعهد؟`
                : `Êtes-vous sûr de vouloir supprimer définitivement le compte de ${teacherToDelete.name} ainsi que toutes ses classes, élèves et notes associées ?`}
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setTeacherToDelete(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                {lang === 'ar' ? 'إلغاء' : 'Annuler'}
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteTeacher(teacherToDelete.id);
                  setTeacherToDelete(null);
                }}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-sm transition-all cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>{lang === 'ar' ? 'تأكيد الحذف' : 'Supprimer définitivement'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
