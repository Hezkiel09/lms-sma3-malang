import { LogOut } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const actionVariants = {
  portal: 'bg-cyan-50/80 text-[#008994] hover:bg-cyan-100/80',
  subtle: 'bg-slate-100 text-slate-600 hover:bg-slate-200',
};

export default function SidebarFooter({
  actions = [],
  onClose,
  logoutLabel = 'Keluar',
  logoutClassName = 'bg-red-50/80 text-red-500 hover:bg-red-100/80',
}) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onClose?.();
    navigate('/login', { replace: true });
  };

  return (
    <footer className="space-y-2 border-t border-slate-100 p-4">
      {actions.map((action) => {
        const Icon = action.icon;
        const variantClass = actionVariants[action.variant] || actionVariants.portal;
        return (
          <NavLink
            key={action.to}
            to={action.to}
            onClick={() => onClose?.()}
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition-colors ${variantClass} ${action.className || ''}`}
          >
            {Icon && <Icon className="h-4 w-4" />}
            <span>{action.label}</span>
          </NavLink>
        );
      })}

      <button
        type="button"
        onClick={handleLogout}
        className={`flex w-full items-center justify-between rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors ${logoutClassName}`}
      >
        <span>{logoutLabel}</span>
        <LogOut className="h-4 w-4" />
      </button>
    </footer>
  );
}
