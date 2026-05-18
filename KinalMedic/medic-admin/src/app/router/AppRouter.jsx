import { Routes, Route } from 'react-router-dom';
import { AuthPage } from '../../features/auth/pages/AuthPage.jsx';
import { ProtecterRoute } from './ProtecterRoute.jsx';
import { DashboardPage } from '../layouts/DashboardPage.jsx';
import { RoleGuard } from './RoleGuard.jsx';
import { Medical } from '../../features/medical/components/register.medic.jsx';
import { Inventory } from '../../features/inventory/components/inventory.medical.jsx';
import { Notification } from '../../features/notification/components/notification.medical.jsx';
import { Availability } from '../../features/availability/components/state.medical.jsx';
import { Users } from '../../features/users/components/Users.jsx';
import { VerifyEmailPage } from '../../features/auth/pages/VerifyEmailPage.jsx';
export const AppRouter = () => {
  return (
    <Routes>
      <Route path='/' element={<AuthPage />} />
      <Route path='/verify-email' element={<VerifyEmailPage />} />
      <Route
        path='/dashboard/*'
        element={
          <ProtecterRoute>
            <RoleGuard allowedRoles={['ADMIN_ROLE']}>
              <DashboardPage />
            </RoleGuard>
          </ProtecterRoute>
        }
      >
        <Route path='medical' element={<Medical />}/>
        <Route path='inventory' element={<Inventory />} />
        <Route path='notification' element={<Notification />} />
        <Route path='availability' element={<Availability />} />
        <Route path='users' element={<Users />} />
      </Route>
    </Routes>
  );
};
