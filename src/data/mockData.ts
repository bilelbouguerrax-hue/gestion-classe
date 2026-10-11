import { AppData, AppSettings } from '../types';

export const initialSettings: AppSettings = {
  teacherName: '',
  schoolName: 'Lycée Kalaat El Andalous',
  academicYear: '2025 - 2026',
  mainSubject: '',
  maxStudentsPerGroup: 20,
  numGroupsPerClass: 2,
  evalCoefficients: {
    control: 1,
    activities: 1,
    synthesis: 2,
  },
  gradeDisplayPrecision: 2,
  allowPartialAverage: false,
  activityCategories: [
    'Participation en classe',
    'Manuel d\'activités',
    'Réalisation d\'un projet',
    'Recherche documentaire',
    'Travail individuel',
    'Travail de groupe',
    'Présentation orale',
    'Autres activités pédagogiques',
  ],
  disciplineCategories: [
    'Travail non fait',
    'Matériel oublié',
    'Absence de participation',
    'Manque de concentration',
    'Perturbation de la séance',
    'Avertissement',
    'Exclusion de la séance',
    'Invitation des parents',
    'Comportement positif',
    'Félicitations',
    'Autre observation',
  ],
  pinCode: '1234',
  isPinEnabled: false,
  language: 'ar',
};

export const sampleInitialData: AppData = {
  settings: initialSettings,
  classes: [],
  students: [],
  timetable: [],
  attendances: [],
  grades: [],
  disciplines: [],
  auditLogs: [],
  archives: [],
};

export const sampleTeacher2Data: AppData = {
  settings: {
    ...initialSettings,
  },
  classes: [],
  students: [],
  timetable: [],
  attendances: [],
  grades: [],
  disciplines: [],
  auditLogs: [],
  archives: [],
};

export const initialMultiTeacherStore: {
  teachers: Array<{
    id: string;
    name: string;
    schoolName: string;
    mainSubject: string;
    academicYear: string;
    pinCode: string;
    isPinEnabled: boolean;
    avatarColor?: string;
    createdAt: string;
  }>;
  activeTeacherId: string;
  teacherData: Record<string, AppData>;
} = {
  teachers: [],
  activeTeacherId: '',
  teacherData: {},
};
