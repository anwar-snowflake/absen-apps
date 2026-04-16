import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileText, 
  Database, 
  LogOut, 
  Menu, 
  X,
  Bell,
  Search
} from 'lucide-react';
import { useState } from 'react';

export default function AppLayout() {
  const { currentUser, logout } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { path: '/app', icon: <LayoutDashboard size={20} />, label: 'Dashboard', roles: ['admin', 'guru'] },
    { path: '/app/absensi-guru', icon: <UserCheck size={20} />, label: 'Absensi Guru', roles: ['admin', 'guru'] },
    { path: '/app/absensi-siswa', icon: <Users size={20} />, label: 'Absensi Siswa', roles: ['admin', 'guru'] },
    { path: '/app/rekap', icon: <FileText size={20} />, label: 'Rekap Absensi', roles: ['admin', 'guru'] },
    { path: '/app/data-siswa', icon: <Database size={20} />, label: 'Data Siswa', roles: ['admin'] },
  ];

  const filteredMenu = menuItems.filter(item => item.roles.includes(currentUser?.role || ''));

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-blue-900 text-white transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-sky-400 rounded-lg flex items-center justify-center text-slate-900">
                <UserCheck size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight">Hadirin</span>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-1 px-4 space-y-1 mt-4">
            {filteredMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all group
                  ${location.pathname === item.path 
                    ? 'bg-sky-400 text-slate-900 font-bold shadow-lg shadow-sky-400/20' 
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'}
                `}
              >
                <span className={`${location.pathname === item.path ? 'text-slate-900' : 'text-sky-400 group-hover:text-sky-300'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="p-4 border-t border-white/10">
            <div className="bg-white/5 rounded-2xl p-4">
              <p className="text-xs text-slate-400 mb-1 uppercase tracking-wider font-semibold">Role Anda</p>
              <p className="text-sm font-bold text-sky-400 capitalize">{currentUser?.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg">
              <Menu size={24} />
            </button>
            <div className="hidden md:flex items-center gap-2 bg-slate-100 px-4 py-2 rounded-xl text-slate-500 w-64">
              <Search size={18} />
              <input type="text" placeholder="Cari data..." className="bg-transparent outline-none text-sm w-full" />
            </div>
          </div>

          <div className="flex items-center gap-3 lg:gap-6">
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all relative">
              <Bell size={22} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm font-bold text-slate-900">{currentUser?.name}</p>
                <p className="text-xs text-slate-500">{currentUser?.email}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-400 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-blue-200">
                {currentUser?.name?.charAt(0).toUpperCase()}
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Keluar"
              >
                <LogOut size={22} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
