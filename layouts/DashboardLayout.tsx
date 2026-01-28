
import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, LogOut, Menu, X, User, Users, Layers, ChevronRight, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  // If user somehow gets here without auth (should be caught by protected route, but safety first)
  if (!user) return null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAdmin = user.role === 'ADMIN';

  const navItems = isAdmin 
    ? [
        { name: 'Overview', path: '/dashboard', icon: LayoutDashboard, exact: true },
        // { name: 'All Users', path: '/dashboard/users', icon: Users, exact: true }, 
      ]
    : [
        { name: 'My Batches', path: '/dashboard', icon: Layers, exact: true },
        { name: 'Resources', path: '/dashboard/resources', icon: Sparkles, exact: true },
      ];

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:sticky top-0 left-0 h-screen w-72 bg-slate-900 text-white z-50 transform transition-transform duration-300 ease-in-out shadow-2xl ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        
        {/* Brand */}
        <div className="p-6 flex items-center border-b border-slate-800 h-24">
           <div className="relative group cursor-pointer" onClick={() => navigate('/')}>
             <div className="absolute inset-0 bg-ocean-500 rounded-xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
             <div className="relative w-12 h-12 bg-gradient-to-br from-ocean-400 to-ocean-600 rounded-xl flex items-center justify-center text-white font-black text-xl shadow-inner border border-white/10">
               DC
             </div>
           </div>
           <div className="ml-4">
             <h1 className="font-extrabold text-lg leading-none tracking-tight">Dhriti<br/><span className="text-ocean-400">Classes</span></h1>
           </div>
           <button onClick={() => setIsSidebarOpen(false)} className="ml-auto lg:hidden text-slate-400 hover:text-white">
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 mt-4">
          <div className="px-4 py-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">Main Menu</div>
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onClick={() => setIsSidebarOpen(false)}
              className={({ isActive }) => `flex items-center px-4 py-3.5 rounded-xl font-bold text-sm transition-all duration-200 group relative overflow-hidden ${
                isActive 
                  ? 'bg-ocean-600 text-white shadow-lg shadow-ocean-900/20' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className={`w-5 h-5 mr-3 transition-transform group-hover:scale-110 ${
                 location.pathname === item.path ? 'text-white' : 'text-slate-500 group-hover:text-ocean-300'
              }`} />
              <span className="relative z-10">{item.name}</span>
              {location.pathname === item.path && (
                  <ChevronRight className="w-4 h-4 ml-auto text-ocean-300" />
              )}
            </NavLink>
          ))}
          
          <div className="mt-8 px-4 py-2 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">System</div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3.5 rounded-xl font-bold text-sm text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all text-left group"
          >
            <LogOut className="w-5 h-5 mr-3 group-hover:text-red-400 transition-colors" />
            Logout
          </button>
        </nav>

        {/* User Profile */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-800 bg-slate-900">
          <div className="flex items-center bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
            <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 overflow-hidden shadow-sm shrink-0">
               {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover"/> : <User className="w-5 h-5" />}
            </div>
            <div className="ml-3 min-w-0">
              <p className="text-sm font-bold text-white line-clamp-1">{user.firstName} {user.lastName}</p>
              <p className="text-[10px] text-ocean-400 font-bold uppercase tracking-wide">{user.role}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 transition-all">
        
        {/* Mobile Header */}
        <header className="lg:hidden bg-white border-b border-gray-200 h-16 flex items-center px-4 justify-between sticky top-0 z-30 shadow-sm">
           <div className="flex items-center gap-3">
             <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
               <Menu className="w-6 h-6" />
             </button>
             <span className="font-bold text-slate-900 text-lg">Dashboard</span>
           </div>
           <div className="w-8 h-8 bg-ocean-100 text-ocean-700 rounded-full flex items-center justify-center font-bold text-xs">
              {user.firstName.charAt(0)}
           </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto custom-scrollbar bg-slate-50">
           <Outlet />
        </main>
      </div>

    </div>
  );
};

export default DashboardLayout;
