import { Routes, Route } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { ProtecterRoute } from './ProtecterRoute.jsx';
import { DashboardPage } from '../layouts/DashboardPage.jsx';
import { RoleGuard } from './RoleGuard.jsx';
import { HomeDashboard } from '../../features/home/pages/HomeDashboard.jsx';
import { MedicalRecordsPage } from '../../features/medical/pages/MedicalRecordsPage.jsx';
import { InventoryPage } from '../../features/inventory/pages/InventoryPage.jsx';
import { Notification } from '../../features/notification/components/notification.medical.jsx';
import { EmergencyPage } from '../../features/notification/pages/EmergencyPage.jsx';
import { AvailabilityPage } from '../../features/availability/pages/AvailabilityPage.jsx';
import { Users } from '../../features/users/components/Users.jsx';
import { UserProfilePage } from '../../features/users/components/UserProfilePage.jsx';
import { ROLES } from '../../shared/utils/roles.js';

const ALL_ROLES = [ROLES.PRINCIPAL, ROLES.MEDIC, ROLES.STUDENT];
const STAFF_ROLES = [ROLES.PRINCIPAL, ROLES.MEDIC];
const STUDENT_ONLY = [ROLES.STUDENT];

export const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<AuthPage />} />
      
      <Route
        path='/dashboard/*'
        element = {
          <ProtecterRoute>
            <RoleGuard allowedRoles={ALL_ROLES}>
              <DashboardPage />
            </RoleGuard>
          </ProtecterRoute>
        }
      >
        <Route index element={<HomeDashboard />} />

        {/* Operativo: Admin Principal + Médico */}
        <Route path='medical' element={
          <RoleGuard allowedRoles={STAFF_ROLES}>
            <MedicalRecordsPage />
          </RoleGuard>
        }/>
        <Route path='inventory' element={
          <RoleGuard allowedRoles={STAFF_ROLES}>
            <InventoryPage />
          </RoleGuard>
        } />
        <Route path='users' element={
          <RoleGuard allowedRoles={STAFF_ROLES}>
            <Users />
          </RoleGuard>
        } />

        {/* Todos los roles autenticados */}
        <Route path='notification' element={<Notification />} />
        <Route path='emergency' element={
          <RoleGuard allowedRoles={STUDENT_ONLY}>
            <EmergencyPage />
          </RoleGuard>
        } />
        <Route path='availability' element={<AvailabilityPage />} />
        <Route path='profile' element={<UserProfilePage />} /> 
      </Route>
    </Routes>
  );
};