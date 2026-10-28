import React from 'react';
import { useAuth } from '../hooks/useAuth.js';
import Badge from '../components/ui/Badge.jsx';
import Button from '../components/ui/Button.jsx';
import { Menu, LogOut, User as UserIcon } from 'lucide-react';

const Topbar = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-gray-200 px-4 flex items-center justify-between sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-1.5 text-gray-500 hover:text-gray-900 rounded"
          aria-label="Toggle Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <span className="text-xs text-gray-400 hidden sm:inline">Workspace / Sales Pipeline</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gray-100 border border-gray-300 rounded-full flex items-center justify-center text-gray-600">
            <UserIcon className="w-4 h-4" />
          </div>
          <div className="text-left hidden sm:block">
            <div className="text-xs font-semibold text-gray-900 leading-tight">{user?.name}</div>
            <div className="text-[11px] text-gray-500 leading-tight">{user?.email}</div>
          </div>
        </div>

        <Badge variant={user?.role === 'admin' ? 'info' : 'neutral'} className="uppercase font-mono text-[10px]">
          {user?.role}
        </Badge>

        <Button
          variant="outline"
          size="sm"
          onClick={logout}
          className="gap-1.5 text-gray-600 hover:text-red-600 hover:border-red-200"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </Button>
      </div>
    </header>
  );
};

export default Topbar;
