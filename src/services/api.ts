import { AppData, MultiTeacherStore, TeacherAccount } from '../types';
import { initialMultiTeacherStore, sampleInitialData } from '../data/mockData';

const API_BASE = '/api';
const LOCAL_STORAGE_KEY = 'gestion_classe_multi_teachers_v1';

export type SyncState = 'online' | 'saving' | 'offline';

export async function checkServerStatus(): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE}/status`, { signal: AbortSignal.timeout(2000) });
    return res.ok;
  } catch {
    return false;
  }
}

export async function loadMultiTeacherStore(): Promise<{
  store: MultiTeacherStore;
  isRemote: boolean;
}> {
  // First attempt from remote API
  try {
    const res = await fetch(`${API_BASE}/data`, { signal: AbortSignal.timeout(3000) });
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        const parsed = normalizeToMultiTeacherStore(json.data);
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
        return { store: parsed, isRemote: true };
      }
    }
  } catch (err) {
    console.warn('Backend server unreachable, falling back to local storage', err);
  }

  // Fallback to localStorage
  try {
    const local = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (local) {
      const parsed = normalizeToMultiTeacherStore(JSON.parse(local));
      return { store: parsed, isRemote: false };
    }
  } catch (err) {
    console.error('Failed to parse local storage data', err);
  }

  return { store: initialMultiTeacherStore, isRemote: false };
}

export async function saveMultiTeacherStore(
  store: MultiTeacherStore
): Promise<{ success: boolean; isRemote: boolean }> {
  // Always update local cache immediately
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(store));
  } catch (err) {
    console.error('Local storage save failed', err);
  }

  // Attempt remote save to server
  try {
    const res = await fetch(`${API_BASE}/data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(store),
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      return { success: true, isRemote: true };
    }
  } catch (err) {
    console.warn('Backend server unreachable for save, stored locally only', err);
  }

  return { success: true, isRemote: false };
}

function sanitizeSchoolName(name?: string): string {
  if (!name) return 'Lycée Kalaat El Andalous';
  if (/olivier/i.test(name) || /coll[eèé]ge pilote/i.test(name)) {
    return 'Lycée Kalaat El Andalous';
  }
  return name;
}

function normalizeToMultiTeacherStore(raw: any): MultiTeacherStore {
  if (raw && Array.isArray(raw.teachers) && raw.teacherData) {
    const store = raw as MultiTeacherStore;
    // Sanitize any cached school names from previous sessions
    store.teachers = store.teachers.map((t) => ({
      ...t,
      schoolName: sanitizeSchoolName(t.schoolName),
    }));
    Object.keys(store.teacherData).forEach((key) => {
      if (store.teacherData[key]?.settings?.schoolName) {
        store.teacherData[key].settings.schoolName = sanitizeSchoolName(
          store.teacherData[key].settings.schoolName
        );
      }
    });
    return store;
  }
  // Wrap single AppData
  if (raw && raw.settings && raw.classes) {
    const singleTeacher: TeacherAccount = {
      id: 'teacher-1',
      name: raw.settings.teacherName || 'M. Mohamed Ben Salem',
      schoolName: sanitizeSchoolName(raw.settings.schoolName),
      mainSubject: raw.settings.mainSubject || 'Mathématiques',
      academicYear: raw.settings.academicYear || '2025 - 2026',
      pinCode: raw.settings.pinCode || '1234',
      isPinEnabled: raw.settings.isPinEnabled || false,
      avatarColor: 'from-blue-600 to-indigo-600',
      createdAt: new Date().toISOString(),
    };
    if (raw.settings.schoolName) {
      raw.settings.schoolName = sanitizeSchoolName(raw.settings.schoolName);
    }
    return {
      teachers: [singleTeacher],
      activeTeacherId: 'teacher-1',
      teacherData: {
        'teacher-1': raw as AppData,
      },
    };
  }
  return initialMultiTeacherStore;
}

export function downloadBackupJson(store: MultiTeacherStore) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const blob = new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Sauvegarde_Multi_Enseignants_${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
