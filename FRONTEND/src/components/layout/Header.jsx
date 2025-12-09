import { Bell, Search, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getRole, getUserId } from "../../services/authService";
import { formatRole } from "../../utils/formatters";

export default function Header() {
  const navigate = useNavigate();
  const role = getRole();
  const userId = getUserId();

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
        </div>

        {/* Right Side - Notifications & Profile */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button
            onClick={() => navigate("/notifications")}
            className="relative p-2 text-gray-600 hover:text-primary hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell size={22} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Profile */}
          <button
            onClick={() => navigate("/settings")}
            className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">
                User #{userId}
              </p>
              <p className="text-xs text-gray-500">{formatRole(role)}</p>
            </div>
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white">
              <User size={20} />
            </div>
          </button>
        </div>
      </div>
    </header>
  );
}
