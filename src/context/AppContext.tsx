import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  ActiveTab,
  AppData,
  AppSettings,
  ClassItem,
  Student,
  SessionSchedule,
  AttendanceRecord,
  GradeRecord,
  DisciplineRecord,
  Language,
  ActivityGrade,
  TeacherAccount,
  MultiTeacherStore,
} from '../types';
import { initialMultiTeacherStore, sampleInitialData, initialSettings } from '../data/mockData';
import { loadMultiTeacherStore, saveMultiTeacherStore, SyncState, checkServerStatus } from '../services/api';
import { autoBalanceGroups, suggestGroupForNewStudent } from '../services/calculations';
import { translations } from '../i18n/translations';

interface AppContextType {
  multiStore: MultiTeacherStore;
  activeTeacher: TeacherAccount | null;
  allTeachers: TeacherAccount[];
  data: AppData;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedClassId: string;
  setSelectedClassId: (id: string) => void;
  selectedGroupId: 1 | 2 | 'all';
  setSelectedGroupId: (group: 1 | 2 | 'all') => void;
  syncState: SyncState;
  isLocked: boolean;
  unlockApp: (pin: string) => boolean;
  lockApp: () => void;
  globalSearchQuery: string;
  setGlobalSearchQuery: (q: string) => void;
  viewingStudentId: string | null;
  openStudentProfile: (studentId: string) => void;
  closeStudentProfile: () => void;
  activeAttendanceSessionId: string | null;
  startAttendanceForSession: (sessionId: string) => void;
  clearActiveAttendanceSession: () => void;
  readAlertIds: string[];
  markAllAlertsAsRead: (alertIds: string[]) => void;
  restoreAllAlerts: () => void;
  lang: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations.fr;

  // Authentication & Multi-Teacher Actions
  isAuthenticated: boolean;
  loginTeacher: (teacherId: string, pin?: string) => boolean;
  logout: () => void;
  isTeacherSelectorOpen: boolean;
  openTeacherSelector: () => void;
  closeTeacherSelector: () => void;
  switchTeacher: (teacherId: string) => void;
  createTeacher: (teacher: Omit<TeacherAccount, 'id' | 'createdAt'>) => void;
  deleteTeacher: (teacherId: string) => void;

  // Single Teacher Workspace Actions
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  addClass: (name: string, level: string) => void;
  updateClass: (id: string, name: string, level: string) => void;
  deleteClass: (id: string) => void;
  rebalanceClassGroups: (classId: string) => void;
  addStudent: (student: Omit<Student, 'id' | 'orderNumber'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  moveStudentClass: (studentId: string, newClassId: string) => void;
  importStudents: (students: Array<Omit<Student, 'id' | 'orderNumber'>>, targetClassId: string) => void;
  addTimetableSession: (session: Omit<SessionSchedule, 'id'>) => void;
  updateTimetableSession: (id: string, session: Partial<SessionSchedule>) => void;
  deleteTimetableSession: (id: string) => void;
  saveAttendanceSheet: (record: Omit<AttendanceRecord, 'id' | 'recordedAt'>) => void;
  updateGradeRecord: (record: GradeRecord) => void;
  addActivityToStudent: (studentId: string, activity: Omit<ActivityGrade, 'id'>) => void;
  deleteActivityFromStudent: (studentId: string, activityId: string) => void;
  addDisciplineRecord: (record: Omit<DisciplineRecord, 'id' | 'createdAt'>) => void;
  deleteDisciplineRecord: (id: string) => void;
  archiveCurrentAcademicYear: (newYearName: string) => void;
  restoreArchive: (archiveId: string) => void;
  resetToDemoData: () => void;
  restoreFromData: (importedData: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AUTH_TEACHER_KEY = 'gestion_classe_current_teacher_id';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [multiStore, setMultiStore] = useState<MultiTeacherStore>(initialMultiTeacherStore);
  
  // Restore persisted session from localStorage if present
  const initialSavedTeacherId = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TEACHER_KEY) : null;
  const [activeTeacherId, setActiveTeacherId] = useState<string>(initialSavedTeacherId || '');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(Boolean(initialSavedTeacherId));
  const [isTeacherSelectorOpen, setIsTeacherSelectorOpen] = useState(false);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedGroupId, setSelectedGroupId] = useState<1 | 2 | 'all'>('all');
  const [syncState, setSyncState] = useState<SyncState>('online');
  const [isLocked, setIsLocked] = useState<boolean>(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState<string>('');
  const [viewingStudentId, setViewingStudentId] = useState<string | null>(null);
  const [activeAttendanceSessionId, setActiveAttendanceSessionId] = useState<string | null>(null);
  const [readAlertIds, setReadAlertIds] = useState<string[]>([]);
  const [globalLang, setGlobalLang] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('gestion_classe_lang');
      if (saved === 'ar' || saved === 'fr') return saved;
    } catch {}
    return 'ar';
  });

  const markAllAlertsAsRead = useCallback((alertIds: string[]) => {
    setReadAlertIds((prev) => Array.from(new Set([...prev, ...alertIds])));
  }, []);

  const restoreAllAlerts = useCallback(() => {
    setReadAlertIds([]);
  }, []);

  // Load saved multi-teacher store from backend API / local storage
  useEffect(() => {
    let isMounted = true;
    const initData = async () => {
      setSyncState('saving');
      const loaded = await loadMultiTeacherStore();
      if (!isMounted) return;

      if (loaded.store && loaded.store.teachers.length > 0) {
        setMultiStore(loaded.store);
        
        // Check if there is an active logged-in teacher in localStorage
        const savedLoggedInTeacherId = localStorage.getItem(AUTH_TEACHER_KEY);
        const validLoggedInTeacher = savedLoggedInTeacherId && loaded.store.teachers.some((t) => t.id === savedLoggedInTeacherId);

        let tId: string;
        if (validLoggedInTeacher) {
          tId = savedLoggedInTeacherId!;
          setActiveTeacherId(tId);
          setIsAuthenticated(true);
        } else {
          tId = loaded.store.activeTeacherId || loaded.store.teachers[0].id;
          setActiveTeacherId(tId);
          setIsAuthenticated(false);
          localStorage.removeItem(AUTH_TEACHER_KEY);
        }

        const currentTeacherData = loaded.store.teacherData[tId];
        if (currentTeacherData?.classes?.length > 0) {
          setSelectedClassId(currentTeacherData.classes[0].id);
        }
      } else {
        setMultiStore(initialMultiTeacherStore);
        setActiveTeacherId('');
        setIsAuthenticated(false);
        try {
          localStorage.removeItem(AUTH_TEACHER_KEY);
        } catch {}
        await saveMultiTeacherStore(initialMultiTeacherStore);
      }

      const isServerUp = await checkServerStatus();
      setSyncState(isServerUp ? 'online' : 'offline');
    };

    initData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Periodic health check for server sync
  useEffect(() => {
    const interval = setInterval(async () => {
      const isUp = await checkServerStatus();
      setSyncState((prev) => (prev === 'saving' ? 'saving' : isUp ? 'online' : 'offline'));
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  // Active teacher and their isolated data
  const activeTeacher = useMemo(() => {
    if (!activeTeacherId) return null;
    return multiStore.teachers.find((t) => t.id === activeTeacherId) || null;
  }, [multiStore.teachers, activeTeacherId]);

  const activeTeacherData: AppData = useMemo(() => {
    if (activeTeacherId && multiStore.teacherData[activeTeacherId]) {
      return multiStore.teacherData[activeTeacherId];
    }
    return sampleInitialData;
  }, [multiStore.teacherData, activeTeacherId]);

  // Persist multi-teacher store
  const persistStore = useCallback(async (newStore: MultiTeacherStore) => {
    setMultiStore(newStore);
    setSyncState('saving');
    const res = await saveMultiTeacherStore(newStore);
    setSyncState(res.isRemote ? 'online' : 'offline');
  }, []);

  // Helper to persist only active teacher's updated workspace
  const persistTeacherData = useCallback(
    async (updatedData: AppData) => {
      if (!activeTeacherId) return;
      const newStore: MultiTeacherStore = {
        ...multiStore,
        activeTeacherId,
        teacherData: {
          ...multiStore.teacherData,
          [activeTeacherId]: updatedData,
        },
      };
      await persistStore(newStore);
    },
    [multiStore, activeTeacherId, persistStore]
  );

  // Switch teacher
  const switchTeacher = useCallback(
    (teacherId: string) => {
      const targetTeacher = multiStore.teachers.find((t) => t.id === teacherId);
      if (!targetTeacher) return;

      setActiveTeacherId(teacherId);
      const targetData = multiStore.teacherData[teacherId];
      if (targetData?.classes?.length > 0) {
        setSelectedClassId(targetData.classes[0].id);
      } else {
        setSelectedClassId('');
      }

      setIsAuthenticated(true);
      if (targetTeacher.isPinEnabled) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }

      setIsTeacherSelectorOpen(false);
      setActiveTab('dashboard');

      const updatedStore = {
        ...multiStore,
        activeTeacherId: teacherId,
      };
      persistStore(updatedStore);
    },
    [multiStore, persistStore]
  );

  const loginTeacher = useCallback(
    (teacherId: string, pin?: string): boolean => {
      const teacher = multiStore.teachers.find((t) => t.id === teacherId);
      if (!teacher) return false;
      if (teacher.isPinEnabled && pin !== undefined) {
        if (teacher.pinCode !== pin) return false;
      }
      setActiveTeacherId(teacherId);
      const tData = multiStore.teacherData[teacherId];
      if (tData?.classes?.length > 0) {
        setSelectedClassId(tData.classes[0].id);
      } else {
        setSelectedClassId('');
      }
      setIsAuthenticated(true);
      setIsLocked(false);
      setActiveTab('dashboard');
      try {
        localStorage.setItem(AUTH_TEACHER_KEY, teacherId);
      } catch (err) {
        console.warn('Failed to save auth state to localStorage', err);
      }
      return true;
    },
    [multiStore]
  );

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    try {
      localStorage.removeItem(AUTH_TEACHER_KEY);
    } catch (err) {
      console.warn('Failed to remove auth state from localStorage', err);
    }
  }, []);

  // Create new teacher
  const createTeacher = useCallback(
    (teacherData: Omit<TeacherAccount, 'id' | 'createdAt'>) => {
      const newId = `teacher-${Date.now()}`;
      const newTeacher: TeacherAccount = {
        ...teacherData,
        id: newId,
        createdAt: new Date().toISOString(),
      };

      const newWorkspaceData: AppData = {
        settings: {
          ...initialSettings,
          language: globalLang,
          teacherName: teacherData.name,
          schoolName: teacherData.schoolName,
          mainSubject: teacherData.mainSubject,
          academicYear: teacherData.academicYear,
          pinCode: teacherData.pinCode,
          isPinEnabled: teacherData.isPinEnabled,
        },
        classes: [],
        students: [],
        timetable: [],
        attendances: [],
        grades: [],
        disciplines: [],
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'Compte Enseignant Créé',
            entityType: 'Enseignant',
            details: `Compte pour ${teacherData.name} créé`,
          },
        ],
        archives: [],
      };

      const updatedStore: MultiTeacherStore = {
        teachers: [...multiStore.teachers, newTeacher],
        activeTeacherId: newId,
        teacherData: {
          ...multiStore.teacherData,
          [newId]: newWorkspaceData,
        },
      };

      setActiveTeacherId(newId);
      setIsAuthenticated(true);
      setSelectedClassId('');
      setIsTeacherSelectorOpen(false);
      setActiveTab('dashboard');
      try {
        localStorage.setItem(AUTH_TEACHER_KEY, newId);
      } catch (err) {
        console.warn('Failed to save auth state to localStorage', err);
      }
      persistStore(updatedStore);
    },
    [multiStore, persistStore]
  );

  // Delete teacher
  const deleteTeacher = useCallback(
    (teacherId: string) => {
      const remainingTeachers = multiStore.teachers.filter((t) => t.id !== teacherId);
      const remainingData = { ...multiStore.teacherData };
      delete remainingData[teacherId];

      const nextId = remainingTeachers.length > 0 ? remainingTeachers[0].id : '';
      const updatedStore: MultiTeacherStore = {
        teachers: remainingTeachers,
        activeTeacherId: nextId,
        teacherData: remainingData,
      };

      try {
        const savedLoggedInTeacherId = localStorage.getItem(AUTH_TEACHER_KEY);
        if (savedLoggedInTeacherId === teacherId || remainingTeachers.length === 0) {
          localStorage.removeItem(AUTH_TEACHER_KEY);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.warn('LocalStorage error on teacher deletion', err);
      }

      setActiveTeacherId(nextId);
      persistStore(updatedStore);
    },
    [multiStore, persistStore]
  );

  // Lock and PIN
  const unlockApp = useCallback(
    (pin: string): boolean => {
      const expectedPin = activeTeacher?.pinCode || activeTeacherData.settings.pinCode;
      if (pin === expectedPin) {
        setIsLocked(false);
        return true;
      }
      return false;
    },
    [activeTeacher, activeTeacherData.settings.pinCode]
  );

  const lockApp = useCallback(() => {
    setIsLocked(true);
  }, []);

  // Keep globalLang in sync if active logged-in teacher has a preferred language in settings
  useEffect(() => {
    if (activeTeacherId && multiStore.teacherData[activeTeacherId]?.settings?.language) {
      setGlobalLang(multiStore.teacherData[activeTeacherId].settings.language);
    }
  }, [activeTeacherId, multiStore.teacherData]);

  // Language
  const lang = globalLang;
  const t = useMemo(() => translations[lang] || translations.ar, [lang]);

  const setLanguage = useCallback(
    (newLang: Language) => {
      setGlobalLang(newLang);
      try {
        localStorage.setItem('gestion_classe_lang', newLang);
      } catch {}
      if (activeTeacherId && multiStore.teacherData[activeTeacherId]) {
        const updated = {
          ...multiStore.teacherData[activeTeacherId],
          settings: {
            ...multiStore.teacherData[activeTeacherId].settings,
            language: newLang,
          },
        };
        persistTeacherData(updated);
      }
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = newLang;
    },
    [activeTeacherId, multiStore.teacherData, persistTeacherData]
  );

  useEffect(() => {
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  // Log action
  const logAction = useCallback(
    (action: string, entityType: string, details: string, currentData: AppData): AppData => {
      const newLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action,
        entityType,
        details,
      };
      return {
        ...currentData,
        auditLogs: [newLog, ...(currentData.auditLogs || []).slice(0, 99)],
      };
    },
    []
  );

  // Settings update
  const updateSettings = useCallback(
    (newSettings: Partial<AppSettings>) => {
      const updated = {
        ...activeTeacherData,
        settings: {
          ...activeTeacherData.settings,
          ...newSettings,
        },
      };
      // Also update teacher profile in store
      const updatedTeachers = multiStore.teachers.map((t) =>
        t.id === activeTeacherId
          ? {
              ...t,
              name: newSettings.teacherName || t.name,
              schoolName: newSettings.schoolName || t.schoolName,
              mainSubject: newSettings.mainSubject || t.mainSubject,
              academicYear: newSettings.academicYear || t.academicYear,
              pinCode: newSettings.pinCode || t.pinCode,
              isPinEnabled: newSettings.isPinEnabled ?? t.isPinEnabled,
            }
          : t
      );

      const newStore = {
        teachers: updatedTeachers,
        activeTeacherId,
        teacherData: {
          ...multiStore.teacherData,
          [activeTeacherId]: updated,
        },
      };
      persistStore(newStore);
    },
    [activeTeacherData, multiStore, activeTeacherId, persistStore]
  );

  // Class Actions
  const addClass = useCallback(
    (name: string, level: string) => {
      const newClass: ClassItem = {
        id: `class-${Date.now()}`,
        name,
        academicLevel: level,
        academicYear: activeTeacherData.settings.academicYear,
        createdAt: new Date().toISOString().split('T')[0],
      };
      const updated = {
        ...activeTeacherData,
        classes: [...activeTeacherData.classes, newClass],
      };
      setSelectedClassId(newClass.id);
      const logged = logAction('Création classe', 'Classe', `Classe créée : ${name}`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  const updateClass = useCallback(
    (id: string, name: string, level: string) => {
      const updatedClasses = activeTeacherData.classes.map((c) =>
        c.id === id ? { ...c, name, academicLevel: level } : c
      );
      const updated = { ...activeTeacherData, classes: updatedClasses };
      const logged = logAction('Modification classe', 'Classe', `Classe renommée : ${name}`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  const deleteClass = useCallback(
    (id: string) => {
      const updated = {
        ...activeTeacherData,
        classes: activeTeacherData.classes.filter((c) => c.id !== id),
        students: activeTeacherData.students.filter((s) => s.classId !== id),
        timetable: activeTeacherData.timetable.filter((t) => t.classId !== id),
        attendances: activeTeacherData.attendances.filter((a) => a.classId !== id),
        grades: activeTeacherData.grades.filter((g) => g.classId !== id),
        disciplines: activeTeacherData.disciplines.filter((d) => d.classId !== id),
      };
      if (selectedClassId === id && updated.classes.length > 0) {
        setSelectedClassId(updated.classes[0].id);
      }
      const logged = logAction('Suppression classe', 'Classe', `Classe ID ${id} supprimée`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, selectedClassId, logAction, persistTeacherData]
  );

  const rebalanceClassGroups = useCallback(
    (classId: string) => {
      const classStudents = activeTeacherData.students.filter((s) => s.classId === classId);
      const rebalanced = autoBalanceGroups(classStudents);
      const otherStudents = activeTeacherData.students.filter((s) => s.classId !== classId);
      const updated = {
        ...activeTeacherData,
        students: [...otherStudents, ...rebalanced],
      };
      const logged = logAction(
        'Répartition automatique',
        'Groupes',
        `Répartition alphabétique automatique pour la classe ID ${classId}`,
        updated
      );
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  // Student Actions
  const addStudent = useCallback(
    (studentData: Omit<Student, 'id' | 'orderNumber'>) => {
      const classStudents = activeTeacherData.students.filter((s) => s.classId === studentData.classId);
      const suggestedGroup = suggestGroupForNewStudent(
        classStudents,
        studentData.lastName,
        studentData.firstName
      );

      const newStudent: Student = {
        ...studentData,
        id: `s-${Date.now()}`,
        orderNumber: classStudents.length + 1,
        group: studentData.group || suggestedGroup,
      };

      const allClassStudents = [...classStudents, newStudent];
      const rebalanced = autoBalanceGroups(allClassStudents);
      const otherStudents = activeTeacherData.students.filter((s) => s.classId !== studentData.classId);

      const updated = {
        ...activeTeacherData,
        students: [...otherStudents, ...rebalanced],
      };
      const logged = logAction(
        'Ajout élève',
        'Élève',
        `Nouvel élève inscrit : ${studentData.lastName} ${studentData.firstName}`,
        updated
      );
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  const updateStudent = useCallback(
    (id: string, updates: Partial<Student>) => {
      const updatedStudents = activeTeacherData.students.map((s) => (s.id === id ? { ...s, ...updates } : s));
      const targetStudent = activeTeacherData.students.find((s) => s.id === id);

      let finalStudents = updatedStudents;
      if (
        targetStudent &&
        ((updates.lastName && updates.lastName !== targetStudent.lastName) ||
          (updates.firstName && updates.firstName !== targetStudent.firstName))
      ) {
        const classId = targetStudent.classId;
        const classStudents = updatedStudents.filter((s) => s.classId === classId);
        const rebalanced = autoBalanceGroups(classStudents);
        const otherStudents = updatedStudents.filter((s) => s.classId !== classId);
        finalStudents = [...otherStudents, ...rebalanced];
      }

      const updated = { ...activeTeacherData, students: finalStudents };
      const logged = logAction('Modification élève', 'Élève', `Élève ID ${id} modifié`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  const deleteStudent = useCallback(
    (id: string) => {
      const targetStudent = activeTeacherData.students.find((s) => s.id === id);
      const classId = targetStudent?.classId;
      const remainingStudents = activeTeacherData.students.filter((s) => s.id !== id);

      let finalStudents = remainingStudents;
      if (classId) {
        const classStudents = remainingStudents.filter((s) => s.classId === classId);
        const rebalanced = autoBalanceGroups(classStudents);
        const otherStudents = remainingStudents.filter((s) => s.classId !== classId);
        finalStudents = [...otherStudents, ...rebalanced];
      }

      const updated = {
        ...activeTeacherData,
        students: finalStudents,
        grades: activeTeacherData.grades.filter((g) => g.studentId !== id),
        disciplines: activeTeacherData.disciplines.filter((d) => d.studentId !== id),
      };
      const logged = logAction('Suppression élève', 'Élève', `Élève ID ${id} supprimé`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  const moveStudentClass = useCallback(
    (studentId: string, newClassId: string) => {
      const student = activeTeacherData.students.find((s) => s.id === studentId);
      if (!student || student.classId === newClassId) return;

      const oldClassId = student.classId;
      const targetClassStudents = activeTeacherData.students.filter((s) => s.classId === newClassId);
      const suggestedGroup = suggestGroupForNewStudent(
        targetClassStudents,
        student.lastName,
        student.firstName
      );

      const updatedStudents = activeTeacherData.students.map((s) =>
        s.id === studentId ? { ...s, classId: newClassId, group: suggestedGroup } : s
      );

      const oldClassStudents = autoBalanceGroups(updatedStudents.filter((s) => s.classId === oldClassId));
      const newClassStudents = autoBalanceGroups(updatedStudents.filter((s) => s.classId === newClassId));
      const otherStudents = updatedStudents.filter((s) => s.classId !== oldClassId && s.classId !== newClassId);

      const updated = {
        ...activeTeacherData,
        students: [...otherStudents, ...oldClassStudents, ...newClassStudents],
      };
      const logged = logAction(
        'Changement de classe',
        'Élève',
        `Élève transféré vers classe ID ${newClassId}`,
        updated
      );
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  const importStudents = useCallback(
    (newStudentsData: Array<Omit<Student, 'id' | 'orderNumber'>>, targetClassId: string) => {
      const classStudents = activeTeacherData.students.filter((s) => s.classId === targetClassId);
      const otherStudents = activeTeacherData.students.filter((s) => s.classId !== targetClassId);

      const timestamp = Date.now();
      const mappedNew: Student[] = newStudentsData.map((s, idx) => ({
        ...s,
        id: `s-import-${timestamp}-${idx}`,
        orderNumber: classStudents.length + idx + 1,
        classId: targetClassId,
        group: 1,
      }));

      const combined = autoBalanceGroups([...classStudents, ...mappedNew]);
      const updated = {
        ...activeTeacherData,
        students: [...otherStudents, ...combined],
      };
      const logged = logAction(
        'Importation Excel',
        'Élève',
        `Importation de ${newStudentsData.length} élèves dans la classe ID ${targetClassId}`,
        updated
      );
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  // Timetable
  const addTimetableSession = useCallback(
    (session: Omit<SessionSchedule, 'id'>) => {
      const newSession: SessionSchedule = { ...session, id: `tt-${Date.now()}` };
      const updated = {
        ...activeTeacherData,
        timetable: [...activeTeacherData.timetable, newSession],
      };
      const logged = logAction('Ajout séance', 'Emploi du temps', `Séance ajoutée`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  const updateTimetableSession = useCallback(
    (id: string, sessionUpdates: Partial<SessionSchedule>) => {
      const updatedTimetable = activeTeacherData.timetable.map((t) => (t.id === id ? { ...t, ...sessionUpdates } : t));
      const updated = { ...activeTeacherData, timetable: updatedTimetable };
      const logged = logAction('Modification séance', 'Emploi du temps', `Séance modifiée`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  const deleteTimetableSession = useCallback(
    (id: string) => {
      const updated = {
        ...activeTeacherData,
        timetable: activeTeacherData.timetable.filter((t) => t.id !== id),
      };
      const logged = logAction('Suppression séance', 'Emploi du temps', `Séance ID ${id} supprimée`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  // Attendance
  const saveAttendanceSheet = useCallback(
    (record: Omit<AttendanceRecord, 'id' | 'recordedAt'>) => {
      const newAttendance: AttendanceRecord = {
        ...record,
        id: `att-${Date.now()}`,
        recordedAt: new Date().toISOString(),
      };
      const filtered = activeTeacherData.attendances.filter(
        (a) =>
          !(
            a.classId === record.classId &&
            a.date === record.date &&
            a.startTime === record.startTime &&
            a.group === record.group
          )
      );
      const updated = {
        ...activeTeacherData,
        attendances: [newAttendance, ...filtered],
      };
      const logged = logAction(
        'Enregistrement présence',
        'Présences',
        `Appel enregistré le ${record.date}`,
        updated
      );
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  // Grades
  const updateGradeRecord = useCallback(
    (record: GradeRecord) => {
      const existingIdx = activeTeacherData.grades.findIndex(
        (g) => g.studentId === record.studentId && g.term === record.term
      );
      let newGrades = [...activeTeacherData.grades];
      if (existingIdx >= 0) {
        newGrades[existingIdx] = record;
      } else {
        newGrades.push(record);
      }
      const updated = { ...activeTeacherData, grades: newGrades };
      const logged = logAction('Saisie note', 'Notes', `Note modifiée pour élève ID ${record.studentId}`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  const addActivityToStudent = useCallback(
    (studentId: string, activityData: Omit<ActivityGrade, 'id'>) => {
      const existingRecord = activeTeacherData.grades.find((g) => g.studentId === studentId && g.term === 1);
      const targetStudent = activeTeacherData.students.find((s) => s.id === studentId);
      const newActivity: ActivityGrade = { ...activityData, id: `act-${Date.now()}` };

      let newGrades = [...activeTeacherData.grades];
      if (existingRecord) {
        newGrades = newGrades.map((g) =>
          g.studentId === studentId && g.term === 1
            ? { ...g, activities: [...g.activities, newActivity] }
            : g
        );
      } else {
        newGrades.push({
          studentId,
          classId: targetStudent?.classId || '',
          term: 1,
          activities: [newActivity],
        });
      }

      const updated = { ...activeTeacherData, grades: newGrades };
      const logged = logAction('Ajout activité', 'Notes', `Activité ajoutée`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  const deleteActivityFromStudent = useCallback(
    (studentId: string, activityId: string) => {
      const newGrades = activeTeacherData.grades.map((g) => {
        if (g.studentId === studentId && g.term === 1) {
          return {
            ...g,
            activities: g.activities.filter((a) => a.id !== activityId),
          };
        }
        return g;
      });
      const updated = { ...activeTeacherData, grades: newGrades };
      const logged = logAction('Suppression activité', 'Notes', `Activité supprimée`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  // Discipline
  const addDisciplineRecord = useCallback(
    (record: Omit<DisciplineRecord, 'id' | 'createdAt'>) => {
      const newDiscipline: DisciplineRecord = {
        ...record,
        id: `disc-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const updated = {
        ...activeTeacherData,
        disciplines: [newDiscipline, ...activeTeacherData.disciplines],
      };
      const logged = logAction('Observation disciplinaire', 'Discipline', `Observation : ${record.category}`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  const deleteDisciplineRecord = useCallback(
    (id: string) => {
      const updated = {
        ...activeTeacherData,
        disciplines: activeTeacherData.disciplines.filter((d) => d.id !== id),
      };
      const logged = logAction('Suppression observation', 'Discipline', `Observation supprimée`, updated);
      persistTeacherData(logged);
    },
    [activeTeacherData, logAction, persistTeacherData]
  );

  // Archives
  const archiveCurrentAcademicYear = useCallback(
    (newYearName: string) => {
      const newArchive = {
        id: `arch-${Date.now()}`,
        year: activeTeacherData.settings.academicYear,
        archivedAt: new Date().toISOString(),
        classesCount: activeTeacherData.classes.length,
        studentsCount: activeTeacherData.students.length,
        snapshotData: JSON.parse(JSON.stringify(activeTeacherData)),
      };

      const updated: AppData = {
        settings: {
          ...activeTeacherData.settings,
          academicYear: newYearName,
        },
        classes: [],
        students: [],
        timetable: [],
        attendances: [],
        grades: [],
        disciplines: [],
        auditLogs: [
          {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString(),
            action: 'Archivage',
            entityType: 'Système',
            details: `Année ${activeTeacherData.settings.academicYear} archivée`,
          },
        ],
        archives: [newArchive, ...(activeTeacherData.archives || [])],
      };

      persistTeacherData(updated);
    },
    [activeTeacherData, persistTeacherData]
  );

  const restoreArchive = useCallback(
    (archiveId: string) => {
      const target = activeTeacherData.archives.find((a) => a.id === archiveId);
      if (target) {
        persistTeacherData(target.snapshotData);
      }
    },
    [activeTeacherData.archives, persistTeacherData]
  );

  const resetToDemoData = useCallback(() => {
    persistTeacherData(sampleInitialData);
  }, [persistTeacherData]);

  const restoreFromData = useCallback(
    (importedData: any) => {
      if (importedData && importedData.teachers && importedData.teacherData) {
        persistStore(importedData);
      } else if (importedData && importedData.settings && importedData.classes) {
        persistTeacherData(importedData);
      }
    },
    [persistStore, persistTeacherData]
  );

  const contextValue = useMemo(
    () => ({
      multiStore,
      activeTeacher,
      allTeachers: multiStore.teachers,
      data: activeTeacherData,
      activeTab,
      setActiveTab,
      selectedClassId,
      setSelectedClassId,
      selectedGroupId,
      setSelectedGroupId,
      syncState,
      isLocked,
      unlockApp,
      lockApp,
      globalSearchQuery,
      setGlobalSearchQuery,
      viewingStudentId,
      openStudentProfile: (id: string) => setViewingStudentId(id),
      closeStudentProfile: () => setViewingStudentId(null),
      activeAttendanceSessionId,
      startAttendanceForSession: (id: string) => {
        setActiveAttendanceSessionId(id);
        setActiveTab('attendance');
      },
      clearActiveAttendanceSession: () => setActiveAttendanceSessionId(null),
      readAlertIds,
      markAllAlertsAsRead,
      restoreAllAlerts,
      lang,
      setLanguage,
      t,
      isAuthenticated,
      loginTeacher,
      logout,
      isTeacherSelectorOpen,
      openTeacherSelector: () => setIsTeacherSelectorOpen(true),
      closeTeacherSelector: () => setIsTeacherSelectorOpen(false),
      switchTeacher,
      createTeacher,
      deleteTeacher,
      updateSettings,
      addClass,
      updateClass,
      deleteClass,
      rebalanceClassGroups,
      addStudent,
      updateStudent,
      deleteStudent,
      moveStudentClass,
      importStudents,
      addTimetableSession,
      updateTimetableSession,
      deleteTimetableSession,
      saveAttendanceSheet,
      updateGradeRecord,
      addActivityToStudent,
      deleteActivityFromStudent,
      addDisciplineRecord,
      deleteDisciplineRecord,
      archiveCurrentAcademicYear,
      restoreArchive,
      resetToDemoData,
      restoreFromData,
    }),
    [
      multiStore,
      activeTeacher,
      activeTeacherData,
      activeTab,
      selectedClassId,
      selectedGroupId,
      syncState,
      isLocked,
      unlockApp,
      lockApp,
      globalSearchQuery,
      viewingStudentId,
      activeAttendanceSessionId,
      readAlertIds,
      markAllAlertsAsRead,
      restoreAllAlerts,
      lang,
      setLanguage,
      t,
      isAuthenticated,
      loginTeacher,
      logout,
      isTeacherSelectorOpen,
      switchTeacher,
      createTeacher,
      deleteTeacher,
      updateSettings,
      addClass,
      updateClass,
      deleteClass,
      rebalanceClassGroups,
      addStudent,
      updateStudent,
      deleteStudent,
      moveStudentClass,
      importStudents,
      addTimetableSession,
      updateTimetableSession,
      deleteTimetableSession,
      saveAttendanceSheet,
      updateGradeRecord,
      addActivityToStudent,
      deleteActivityFromStudent,
      addDisciplineRecord,
      deleteDisciplineRecord,
      archiveCurrentAcademicYear,
      restoreArchive,
      resetToDemoData,
      restoreFromData,
    ]
  );

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
