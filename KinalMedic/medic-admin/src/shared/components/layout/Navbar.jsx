import { Link } from 'react-router-dom';
import imgLogo from '../../../assets/img/Logo_Enfermería_Kinal.png';
import { AvatarUser } from '../ui/AvatarUser.jsx';

export const Navbar = () => {
  return (
    <nav className='bg-white/90 backdrop-blur-md shadow-md sticky top-0 z-50 border-b border-white/60'>
      <div className='max-w-7xl mx-auto px-6 h-16 flex items-center justify-between'>
        <Link to='/dashboard' className='flex items-center gap-2.5 group'>
          <img
            src={imgLogo}
            alt='Kinal Medic'
            className='h-8 md:h-10 w-auto object-contain'
          />
          <div className='leading-tight'>
            <h5 className='text-xl font-black text-[#08316D] group-hover:text-[#06234f] transition-colors'>
              Kinal Medic
            </h5>
            <p className='text-[10px] font-semibold uppercase tracking-wider text-slate-400 hidden sm:block'>
              Enfermería institucional
            </p>
          </div>
        </Link>
        <AvatarUser />
      </div>
    </nav>
  );
};
