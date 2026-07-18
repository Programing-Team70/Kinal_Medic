import { Navbar } from './Navbar.jsx';
import { Sidebar } from './Sidebar.jsx';
import { MedicalBackground } from './MedicalBackground.jsx';

export const DashboardContainer = ({ user, onLogout, children }) => {
  return (
    <div className='kinal-app-shell min-h-screen flex flex-col'>
      <MedicalBackground />
      <div className='relative z-[1] flex flex-col min-h-screen'>
        <Navbar user={user} onLogout={onLogout} />
        <div className='flex flex-1'>
          <div className='bg-white/85 backdrop-blur-md border-r border-white/60 shadow-sm'>
            <Sidebar />
          </div>
          <main className='flex-1 p-6 relative z-[1]'>{children}</main>
        </div>
      </div>
    </div>
  );
};
