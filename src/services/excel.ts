import * as XLSX from 'xlsx';
import { Student, GradeRecord, AppSettings, AttendanceRecord, ClassItem } from '../types';
import { calculateRanks } from './calculations';

/**
 * Smart detection and import of students from an Excel / CSV file
 */
export async function parseStudentsExcel(
  file: File,
  targetClassId: string,
  existingStudents: Student[]
): Promise<{
  students: Array<Omit<Student, 'id' | 'orderNumber'>>;
  duplicates: number;
}> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!rows || rows.length === 0) {
          return resolve({ students: [], duplicates: 0 });
        }

        const newStudents: Array<Omit<Student, 'id' | 'orderNumber'>> = [];
        let duplicates = 0;

        rows.forEach((row) => {
          let lastName = '';
          let firstName = '';
          let birthDate = '';
          let gender: 'M' | 'F' | undefined = undefined;
          let fatherPhone = '';
          let fatherName = '';

          // Normalize keys
          Object.keys(row).forEach((key) => {
            const k = key.trim().toLowerCase();
            const val = String(row[key]).trim();

            if (k === 'nom' || k === 'nom de famille' || k === 'اللقب') {
              lastName = val;
            } else if (k === 'prénom' || k === 'prenom' || k === 'الاسم') {
              firstName = val;
            } else if (k === 'nom et prénom' || k === 'nom prénom' || k === 'الاسم واللقب' || k === 'الاسم الكامل') {
              const parts = val.split(' ');
              if (parts.length > 1) {
                lastName = parts[0];
                firstName = parts.slice(1).join(' ');
              } else {
                lastName = val;
              }
            } else if (k.includes('naissance') || k.includes('تاريخ الولادة') || k.includes('birth')) {
              birthDate = val;
            } else if (k === 'genre' || k === 'sexe' || k === 'الجنس') {
              const g = val.toUpperCase();
              if (g.startsWith('F') || g.includes('أنثى')) gender = 'F';
              else gender = 'M';
            } else if (k.includes('tél') || k.includes('tel') || k.includes('phone') || k.includes('هاتف')) {
              fatherPhone = val;
            } else if (k.includes('père') || k.includes('pere') || k.includes('الأب')) {
              fatherName = val;
            }
          });

          if (lastName || firstName) {
            // Check for duplicate in target class
            const isDuplicate = existingStudents.some(
              (s) =>
                s.classId === targetClassId &&
                s.lastName.trim().toLowerCase() === lastName.toLowerCase() &&
                s.firstName.trim().toLowerCase() === firstName.toLowerCase()
            );

            if (isDuplicate) {
              duplicates++;
            } else {
              newStudents.push({
                classId: targetClassId,
                group: 1, // Will be rebalanced
                lastName: lastName || 'Élève',
                firstName: firstName || '',
                gender,
                birthDate,
                fatherName,
                fatherPhone,
                registrationDate: new Date().toISOString().split('T')[0],
              });
            }
          }
        });

        resolve({ students: newStudents, duplicates });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = (err) => reject(err);
    reader.readAsBinaryString(file);
  });
}

/**
 * Export Students List to Excel
 */
export function exportStudentsToExcel(students: Student[], className: string) {
  const data = students.map((s) => ({
    'N° Ordre': s.orderNumber,
    'Nom': s.lastName,
    'Prénom': s.firstName,
    'Groupe': `Groupe ${s.group}`,
    'Genre': s.gender || '',
    'Date de Naissance': s.birthDate || '',
    'Téléphone Parent': s.fatherPhone || s.motherPhone || '',
    'Date d\'inscription': s.registrationDate || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Élèves');
  XLSX.writeFile(workbook, `Liste_Eleves_${className.replace(/\s+/g, '_')}.xlsx`);
}

/**
 * Export Grades and General Summary to Excel
 */
export function exportGradesToExcel(
  students: Student[],
  grades: GradeRecord[],
  settings: AppSettings,
  className: string,
  groupLabel: string
) {
  const ranksMap = calculateRanks(students, grades, settings);

  const data = students.map((s) => {
    const record = grades.find((g) => g.studentId === s.id);
    const calc = ranksMap.get(s.id);

    return {
      'N°': s.orderNumber,
      'Nom & Prénom': `${s.lastName} ${s.firstName}`,
      'Groupe': `Groupe ${s.group}`,
      'Contrôle (/20)': record?.controlGrade !== null && record?.controlGrade !== undefined ? record.controlGrade : '',
      'Activités (/20)': calc?.activitiesAvg !== null && calc?.activitiesAvg !== undefined ? calc.activitiesAvg : '',
      'Synthèse (/20)': record?.synthesisGrade !== null && record?.synthesisGrade !== undefined ? record.synthesisGrade : '',
      'Moyenne Générale': calc?.generalAverage !== null && calc?.generalAverage !== undefined ? calc.generalAverage : 'Incomplète',
      'Rang': calc?.rank !== null && calc?.rank !== undefined ? calc.rank : '-',
      'Remarques': record?.teacherRemarks || '',
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Feuille_Notes');
  XLSX.writeFile(workbook, `Feuille_Notes_${className.replace(/\s+/g, '_')}_${groupLabel}.xlsx`);
}

/**
 * Export Attendance Summary to Excel
 */
export function exportAttendanceToExcel(
  students: Student[],
  attendances: AttendanceRecord[],
  className: string
) {
  const data = students.map((s) => {
    let presentCount = 0;
    let absentCount = 0;
    let lateCount = 0;
    let excusedCount = 0;

    attendances.forEach((att) => {
      const rec = att.records.find((r) => r.studentId === s.id);
      if (rec) {
        if (rec.status === 'present') presentCount++;
        else if (rec.status === 'absent') absentCount++;
        else if (rec.status === 'late') lateCount++;
        else if (rec.status === 'excused') excusedCount++;
      }
    });

    const totalSessions = presentCount + absentCount + lateCount + excusedCount;
    const rate = totalSessions > 0 ? Math.round(((presentCount + lateCount) / totalSessions) * 100) : 100;

    return {
      'N°': s.orderNumber,
      'Nom & Prénom': `${s.lastName} ${s.firstName}`,
      'Groupe': `Groupe ${s.group}`,
      'Présents': presentCount,
      'Retards': lateCount,
      'Absences': absentCount,
      'Absences Justifiées': excusedCount,
      'Taux Présence': `${rate}%`,
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Présences');
  XLSX.writeFile(workbook, `Bilan_Presences_${className.replace(/\s+/g, '_')}.xlsx`);
}
