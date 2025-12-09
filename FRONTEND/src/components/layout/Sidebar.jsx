import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Package, FileText, Users, Warehouse, 
  BarChart3, Bell, Settings, LogOut, ShoppingCart, 
  ClipboardList, AlertCircle, TrendingUp, MapPin 
} from 'lucide-react';
import { logout, getRole } from '../../services/authService';
import { cn } from '../../utils/helpers';

const menuByRole = {
  ADMIN: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Products', icon: Package, path: '/products' },
    { name: 'SKUs', icon: FileText, path: '/skus' },
    { name: 'Shipments', icon: ShoppingCart, path: '/shipments' },
    { name: 'Users', icon: Users, path: '/users' },
    { name: 'Warehouse', icon: Warehouse, path: '/warehouse/zones' },
    { name: 'AI Verification', icon: AlertCircle, path: '/admin/verification-logs' },
    { name: 'Reports', icon: BarChart3, path: '/admin/reports' },
  ],
  SUPERVISOR: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/supervisor/dashboard' },
    { name: 'Approvals', icon: ClipboardList, path: '/supervisor/approvals' },
    { name: 'Shipments', icon: ShoppingCart, path: '/supervisor/shipments' },
    { name: 'Workers', icon: Users, path: '/supervisor/workers' },
    { name: 'Stock', icon: TrendingUp, path: '/supervisor/stock' },
    { name: 'Reports', icon: BarChart3, path: '/supervisor/reports' },
  ],
  WORKER: [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/worker/dashboard' },
    { name: 'Tasks', icon: ClipboardList, path: '/worker/tasks' },
    { name: 'Inbound', icon: ShoppingCart, path: '/worker/inbound' },
    { name: 'Putaway', icon: MapPin, path: '/worker/putaway' },
    { name: 'Picking', icon: Package, path: '/worker/picking' },
    { name: 'Report Issue', icon: AlertCircle, path: '/worker/issues' },
  ],
};

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = getRole();
  const menuItems = menuByRole[role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-primary to-blue-700 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">V</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">VISERA</h1>
            <p className="text-xs text-gray-500">{role}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 space-y-2">
        <Link
          to="/notifications"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Bell size={20} />
          <span className="font-medium">Notifications</span>
        </Link>
        <Link
          to="/settings"
          className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
        >
          <Settings size={20} />
          <span className="font-medium">Settings</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
