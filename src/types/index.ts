export type ActiveTab =
  | 'dashboard'
  | 'classes'
  | 'students'
  | 'timetable'
  | 'attendance'
  | 'grades'
  | 'discipline'
  | 'reports'
  | 'archives'
  | 'settings';

export type Language = 'fr' | 'ar';

export interface AppSettings {
  teacherName: string;
  schoolName: string;
  academicYear: string;
  mainSubject: string;
  maxStudentsPerGroup: number; // default: 20
  numGroupsPerClass: number; // default: 2
  evalCoefficients: {
    control: number; // default: 1
    activities: number; // default: 1
    synthesis: number; // default: 2
  };
  gradeDisplayPrecision: number; // 1 or 2 decimals
  allowPartialAverage: boolean; // if false, "Incomplète" when mandatory notes missing
  activityCategories: string[];
  disciplineCategories: string[];
  pinCode: string;
  isPinEnabled: boolean;
  language: Language;
}

export interface ClassItem {
  id: string;
  name: string;
  academicLevel: string;
  academicYear: string;
  isArchived?: boolean;
  createdAt: string;
}

export interface Student {
  id: string;
  orderNumber: number;
  classId: string;
  group: 1 | 2;
  lastName: string;
  firstName: string;
  gender?: 'M' | 'F';
  birthDate?: string;
  fatherName?: string;
  motherName?: string;
  fatherPhone?: string;
  motherPhone?: string;
  address?: string;
  registrationDate: string;
  teacherNotes?: string;
  isArchived?: boolean;
}

export interface SessionSchedule {
  id: string;
  dayOfWeek: number; // 1 = Monday to 6 = Saturday (or 7 = Sunday)
  startTime: string; // e.g. "08:00"
  endTime: string;   // e.g. "09:00"
  classId: string;
  targetGroup: 'all' | 1 | 2;
  subject: string;
  room?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface StudentAttendanceItem {
  studentId: string;
  status: AttendanceStatus;
  observation?: string;
}

export interface AttendanceRecord {
  id: string;
  sessionId?: string;
  classId: string;
  group: 1 | 2 | 'all';
  date: string; // YYYY-MM-DD
  startTime: string;
  endTime: string;
  subject: string;
  room?: string;
  isExceptional?: boolean;
  records: StudentAttendanceItem[];
  recordedAt: string;
}

export interface ActivityGrade {
  id: string;
  title: string;
  category: string;
  date: string;
  grade: number; // Note sur 20
  observation?: string;
}

export interface GradeRecord {
  studentId: string;
  classId: string;
  term: number; // 1, 2, 3
  controlGrade?: number | null; // Note sur 20
  synthesisGrade?: number | null; // Note sur 20
  activities: ActivityGrade[];
  teacherRemarks?: string;
}

export interface DisciplineRecord {
  id: string;
  studentId: string;
  classId: string;
  date: string;
  category: string;
  description: string;
  teacherComment?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  entityType: string;
  details: string;
}

export interface AcademicYearArchive {
  id: string;
  year: string;
  archivedAt: string;
  classesCount: number;
  studentsCount: number;
  snapshotData: AppData;
}

export interface AppData {
  settings: AppSettings;
  classes: ClassItem[];
  students: Student[];
  timetable: SessionSchedule[];
  attendances: AttendanceRecord[];
  grades: GradeRecord[];
  disciplines: DisciplineRecord[];
  auditLogs: AuditLog[];
  archives: AcademicYearArchive[];
}

export interface TeacherAccount {
  id: string;
  name: string;
  email?: string;
  schoolName: string;
  mainSubject: string;
  academicYear: string;
  pinCode: string;
  isPinEnabled: boolean;
  avatarColor?: string;
  createdAt: string;
}

export interface MultiTeacherStore {
  teachers: TeacherAccount[];
  activeTeacherId: string | null;
  teacherData: Record<string, AppData>;
}


