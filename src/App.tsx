import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { PinLockScreen } from './components/common/PinLockScreen';
import { PedagogyAlertsModal } from './components/common/PedagogyAlertsModal';
import { StudentProfileModal } from './components/students/StudentProfileModal';

import { DashboardView } from './components/dashboard/DashboardView';
import { ClassesView } from './components/classes/ClassesView';
import { StudentsView } from './components/students/StudentsView';
import { TimetableView } from './components/timetable/TimetableView';
import { AttendanceView } from './components/attendance/AttendanceView';
import { GradesView } from './components/grades/GradesView';
import { DisciplineView } from './components/discipline/DisciplineView';
import { ReportsView } from './components/reports/ReportsView';
import { ArchivesView } from './components/archives/ArchivesView';
import { SettingsView } from './components/settings/SettingsView';
import { computePedagogicalAlerts } from './services/calculations';
import { WelcomeAuthScreen } from './components/common/WelcomeAuthScreen';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    isLocked,
    viewingStudentId,
    closeStudentProfile,
    data,
    isAuthenticated,
    readAlertIds,
  } = useApp();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);

  // If not authenticated, show initial Welcome / School Portal screen
  if (!isAuthenticated) {
    return <WelcomeAuthScreen />;
  }

  // Compute alert count for bell
  const alerts = computePedagogicalAlerts(
    data.students,
    data.attendances,
    data.grades,
    data.disciplines,
    data.settings
  );

  const allAlertItemIds = [
    ...alerts.absenceAlerts.map((a) => `absence-${a.student.id}`),
    ...alerts.lowGradeAlerts.map((a) => `grade-${a.student.id}`),
    ...alerts.disciplineAlerts.map((a) => `disc-${a.student.id}`),
    ...alerts.incompleteGradeAlerts.map((a) => `inc-${a.student.id}`),
  ];

  const unreadAlertCount = allAlertItemIds.filter(
    (id) => !readAlertIds.includes(id)
  ).length;

  if (isLocked) {
    return <PinLockScreen />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800 antialiased">
      {/* Sidebar navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        <Header
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenAlerts={() => setIsAlertsOpen(true)}
          alertCount={unreadAlertCount}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView onOpenAlerts={() => setIsAlertsOpen(true)} />
          )}
          {activeTab === 'classes' && <ClassesView />}
          {activeTab === 'students' && <StudentsView />}
          {activeTab === 'timetable' && <TimetableView />}
          {activeTab === 'attendance' && <AttendanceView />}
          {activeTab === 'grades' && <GradesView />}
          {activeTab === 'discipline' && <DisciplineView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'archives' && <ArchivesView />}
          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
      <PedagogyAlertsModal isOpen={isAlertsOpen} onClose={() => setIsAlertsOpen(false)} />

      {viewingStudentId && (
        <StudentProfileModal
          studentId={viewingStudentId}
          onClose={closeStudentProfile}
        />
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
