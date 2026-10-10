import { Student, GradeRecord, AppSettings, AttendanceRecord, DisciplineRecord } from '../types';

/**
 * Compare two students alphabetically by Last Name then First Name
 */
export function compareStudentsAlphabetical(a: Student, b: Student): number {
  const lastCompare = (a.lastName || '').trim().localeCompare((b.lastName || '').trim(), 'fr', {
    sensitivity: 'base',
  });
  if (lastCompare !== 0) return lastCompare;
  return (a.firstName || '').trim().localeCompare((b.firstName || '').trim(), 'fr', {
    sensitivity: 'base',
  });
}

/**
 * Automatically rebalance class students into Group 1 and Group 2 alphabetically
 * Respects maximum 20 students per group, max 40 per class.
 * Example: 36 students -> 18 and 18; 27 students -> 14 and 13.
 */
export function autoBalanceGroups(students: Student[]): Student[] {
  // Sort all students alphabetically
  const sorted = [...students].sort(compareStudentsAlphabetical);
  const total = sorted.length;
  const half = Math.ceil(total / 2);

  return sorted.map((student, index) => ({
    ...student,
    orderNumber: index + 1,
    group: index < half ? 1 : 2,
  }));
}

/**
 * Suggest optimal group for a newly added student
 */
export function suggestGroupForNewStudent(
  existingStudentsInClass: Student[],
  newLastName: string,
  newFirstName: string
): 1 | 2 {
  const dummyStudent: Student = {
    id: 'temp',
    orderNumber: 0,
    classId: '',
    group: 1,
    lastName: newLastName,
    firstName: newFirstName,
    registrationDate: new Date().toISOString(),
  };

  const simulated = [...existingStudentsInClass, dummyStudent].sort(compareStudentsAlphabetical);
  const total = simulated.length;
  const half = Math.ceil(total / 2);
  const index = simulated.findIndex((s) => s.id === 'temp');

  return index < half ? 1 : 2;
}

/**
 * Calculate the average of Diverse Activities
 * Returns null if no activities are recorded (does not consider it as zero).
 */
export function calculateActivitiesAverage(gradeRecord?: GradeRecord): number | null {
  if (!gradeRecord || !gradeRecord.activities || gradeRecord.activities.length === 0) {
    return null;
  }
  const validGrades = gradeRecord.activities
    .map((a) => a.grade)
    .filter((g) => typeof g === 'number' && !isNaN(g) && g >= 0 && g <= 20);

  if (validGrades.length === 0) return null;

  const sum = validGrades.reduce((acc, curr) => acc + curr, 0);
  return sum / validGrades.length;
}

export interface StudentCalculationResult {
  studentId: string;
  activitiesAvg: number | null;
  generalAverage: number | null;
  isIncomplete: boolean;
  rank: number | null;
}

/**
 * Calculate general average for a student given grades and coefficients
 * Formula: Moyenne = (Contrôle * coeffC + Activités * coeffA + (Synthèse * coeffS)) / (coeffC + coeffA + coeffS)
 */
export function calculateStudentGrade(
  gradeRecord: GradeRecord | undefined,
  settings: AppSettings
): {
  activitiesAvg: number | null;
  generalAverage: number | null;
  isIncomplete: boolean;
} {
  const { evalCoefficients, allowPartialAverage } = settings;
  const activitiesAvg = calculateActivitiesAverage(gradeRecord);

  const control = gradeRecord?.controlGrade ?? null;
  const synthesis = gradeRecord?.synthesisGrade ?? null;

  const hasControl = control !== null && typeof control === 'number' && !isNaN(control);
  const hasActivities = activitiesAvg !== null;
  const hasSynthesis = synthesis !== null && typeof synthesis === 'number' && !isNaN(synthesis);

  const allComplete = hasControl && hasActivities && hasSynthesis;

  if (!allComplete && !allowPartialAverage) {
    return {
      activitiesAvg,
      generalAverage: null,
      isIncomplete: true,
    };
  }

  // Calculate weighted average
  let totalScore = 0;
  let totalWeight = 0;

  if (hasControl) {
    totalScore += (control as number) * evalCoefficients.control;
    totalWeight += evalCoefficients.control;
  }
  if (hasActivities) {
    totalScore += (activitiesAvg as number) * evalCoefficients.activities;
    totalWeight += evalCoefficients.activities;
  }
  if (hasSynthesis) {
    totalScore += (synthesis as number) * evalCoefficients.synthesis;
    totalWeight += evalCoefficients.synthesis;
  }

  if (totalWeight === 0) {
    return { activitiesAvg, generalAverage: null, isIncomplete: true };
  }

  const rawAvg = totalScore / totalWeight;
  const factor = Math.pow(10, settings.gradeDisplayPrecision || 2);
  const rounded = Math.round(rawAvg * factor) / factor;

  return {
    activitiesAvg: activitiesAvg !== null ? Math.round(activitiesAvg * factor) / factor : null,
    generalAverage: rounded,
    isIncomplete: !allComplete,
  };
}

/**
 * Calculate ranks for a group or class of students with proper tie resolution
 * (Standard competition ranking: e.g. 1st, 2nd, 2nd, 4th)
 */
export function calculateRanks(
  students: Student[],
  grades: GradeRecord[],
  settings: AppSettings
): Map<string, StudentCalculationResult> {
  const results = new Map<string, StudentCalculationResult>();

  // Compute averages first
  const computedList = students.map((student) => {
    const record = grades.find((g) => g.studentId === student.id);
    const { activitiesAvg, generalAverage, isIncomplete } = calculateStudentGrade(record, settings);
    return {
      studentId: student.id,
      activitiesAvg,
      generalAverage,
      isIncomplete,
      rank: null as number | null,
    };
  });

  // Filter students who have a valid general average for ranking
  const rankedStudents = computedList
    .filter((c) => c.generalAverage !== null)
    .sort((a, b) => (b.generalAverage as number) - (a.generalAverage as number));

  // Assign ranks with ties
  let currentRank = 1;
  for (let i = 0; i < rankedStudents.length; i++) {
    if (i > 0 && rankedStudents[i].generalAverage === rankedStudents[i - 1].generalAverage) {
      rankedStudents[i].rank = rankedStudents[i - 1].rank;
    } else {
      rankedStudents[i].rank = currentRank;
    }
    currentRank++;
  }

  // Populate map
  computedList.forEach((item) => {
    const ranked = rankedStudents.find((r) => r.studentId === item.studentId);
    results.set(item.studentId, {
      ...item,
      rank: ranked ? ranked.rank : null,
    });
  });

  return results;
}

/**
 * Calculate pedagogical alerts
 */
export interface PedagogicalAlertSummary {
  absenceAlerts: Array<{ student: Student; count: number }>;
  lowGradeAlerts: Array<{ student: Student; average: number }>;
  disciplineAlerts: Array<{ student: Student; count: number }>;
  incompleteGradeAlerts: Array<{ student: Student }>;
}

export function computePedagogicalAlerts(
  students: Student[],
  attendances: AttendanceRecord[],
  grades: GradeRecord[],
  disciplines: DisciplineRecord[],
  settings: AppSettings
): PedagogicalAlertSummary {
  const absenceAlerts: Array<{ student: Student; count: number }> = [];
  const lowGradeAlerts: Array<{ student: Student; average: number }> = [];
  const disciplineAlerts: Array<{ student: Student; count: number }> = [];
  const incompleteGradeAlerts: Array<{ student: Student }> = [];

  const gradeCalculations = calculateRanks(students, grades, settings);

  students.forEach((student) => {
    // 1. Absences count
    let absenceCount = 0;
    attendances.forEach((att) => {
      const rec = att.records.find((r) => r.studentId === student.id);
      if (rec && (rec.status === 'absent' || rec.status === 'excused')) {
        absenceCount++;
      }
    });
    if (absenceCount >= 3) {
      absenceAlerts.push({ student, count: absenceCount });
    }

    // 2. Low grades / incomplete
    const calc = gradeCalculations.get(student.id);
    if (calc) {
      if (calc.generalAverage !== null && calc.generalAverage < 10) {
        lowGradeAlerts.push({ student, average: calc.generalAverage });
      }
      if (calc.isIncomplete) {
        incompleteGradeAlerts.push({ student });
      }
    } else {
      incompleteGradeAlerts.push({ student });
    }

    // 3. Discipline count
    const discCount = disciplines.filter((d) => d.studentId === student.id).length;
    if (discCount >= 2) {
      disciplineAlerts.push({ student, count: discCount });
    }
  });

  return {
    absenceAlerts,
    lowGradeAlerts,
    disciplineAlerts,
    incompleteGradeAlerts,
  };
}
