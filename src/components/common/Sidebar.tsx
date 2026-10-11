import React from 'react';
import { useApp } from '../../context/AppContext';
import { ActiveTab } from '../../types';
import {
  LayoutDashboard,
  Users2,
  GraduationCap,
  Calendar,
  CheckSquare,
  Award,
  ShieldAlert,
  Printer,
  FolderArchive,
  Settings,
  X,
  Users,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, t, data, openTeacherSelector, logout } = useApp();

  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ElementType }> = [
    { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
    { id: 'classes', label: t.nav.classes, icon: Users2 },
    { id: 'students', label: t.nav.students, icon: GraduationCap },
    { id: 'timetable', label: t.nav.timetable, icon: Calendar },
    { id: 'attendance', label: t.nav.attendance, icon: CheckSquare },
    { id: 'grades', label: t.nav.grades, icon: Award },
    { id: 'discipline', label: t.nav.discipline, icon: ShieldAlert },
    { id: 'reports', label: t.nav.reports, icon: Printer },
    { id: 'archives', label: t.nav.archives, icon: FolderArchive },
    { id: 'settings', label: t.nav.settings, icon: Settings },
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed inset-y-0 start-0 z-50 flex w-72 max-w-[85vw] flex-col border-e border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } no-print`}
      >
        {/* Mobile Header in sidebar */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-6 lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
              GC
            </div>
            <span className="font-bold text-slate-800">{t.appTitle}</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Teacher profile quick badge */}
        <div className="border-b border-slate-100 px-5 py-4">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/60 p-3.5 border border-blue-100/60">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white shadow-xs">
                {data.settings.teacherName ? data.settings.teacherName.charAt(0) : 'E'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-slate-900">
                  {data.settings.teacherName || 'Enseignant'}
                </p>
                <p className="truncate text-xs font-medium text-blue-600">
                  {data.settings.mainSubject || data.settings.schoolName || 'Lycée Kalaat El Andalous'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                className={`flex w-full items-center gap-3.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-5 w-5 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="border-t border-slate-100 p-4 space-y-2">
          <button
            onClick={() => {
              logout();
              onClose();
            }}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Déconnexion / تسجيل الخروج</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 pt-1">
            <span>v1.0.0 • Multi-Enseignants</span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      </aside>
    </>
  );
};
