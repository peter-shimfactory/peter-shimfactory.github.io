import { Outlet, NavLink } from "react-router";
import { Home, BarChart2, Settings, ShoppingBag, LayoutGrid } from "lucide-react";
import { cn } from "../../utils/cn";

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 flex justify-center">
      <div className="w-full max-w-md bg-white min-h-screen shadow-2xl relative flex flex-col">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto pb-16">
          <Outlet />
        </main>

        {/* Bottom Navigation */}
        <nav className="absolute bottom-0 w-full bg-white border-t border-gray-200 flex items-center justify-around h-16 px-2">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors",
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )
            }
            end
          >
            <Home className="w-6 h-6 mb-1" />
            <span>홈</span>
          </NavLink>
          
          <NavLink
            to="/board"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors",
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            <LayoutGrid className="w-6 h-6 mb-1" />
            <span>보드</span>
          </NavLink>

          <NavLink
            to="/orders"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors",
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            <ShoppingBag className="w-6 h-6 mb-1" />
            <span>주문</span>
          </NavLink>

          <NavLink
            to="/reports"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors",
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            <BarChart2 className="w-6 h-6 mb-1" />
            <span>리포트</span>
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors",
                isActive ? "text-blue-600" : "text-gray-400 hover:text-gray-600"
              )
            }
          >
            <Settings className="w-6 h-6 mb-1" />
            <span>설정</span>
          </NavLink>
        </nav>
      </div>
    </div>
  );
}
