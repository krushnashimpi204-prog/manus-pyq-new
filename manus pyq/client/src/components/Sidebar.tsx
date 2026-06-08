import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  FileText,
  Bell,
  AlertCircle,
  MessageSquare,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  Upload,
  Users,
} from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  roles: string[];
}

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation();

  const menuItems: MenuItem[] = [
    // Student Menu Items
    {
      label: "Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/dashboard",
      roles: ["student", "admin", "super_admin"],
    },
    {
      label: "Search Papers",
      icon: <Search className="w-5 h-5" />,
      path: "/search",
      roles: ["student", "admin", "super_admin"],
    },

    // Admin Menu Items
    {
      label: "Upload Papers",
      icon: <Upload className="w-5 h-5" />,
      path: "/admin/papers",
      roles: ["admin", "super_admin"],
    },
    {
      label: "Announcements",
      icon: <Bell className="w-5 h-5" />,
      path: "/admin/announcements",
      roles: ["admin", "super_admin"],
    },
    {
      label: "Paper Reports",
      icon: <AlertCircle className="w-5 h-5" />,
      path: "/admin/reports",
      roles: ["admin", "super_admin"],
    },
    {
      label: "Admin Dashboard",
      icon: <LayoutDashboard className="w-5 h-5" />,
      path: "/admin",
      roles: ["admin", "super_admin"],
    },

    // Super Admin Only
    {
      label: "Manage Users",
      icon: <Users className="w-5 h-5" />,
      path: "/admin/users",
      roles: ["super_admin"],
    },
  ];

  const filteredMenuItems = menuItems.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      await logout();
      navigate("/");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="bg-white"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out z-40 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <span className="text-lg font-bold">PYQ Hub</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">College Question Papers</p>
        </div>

        {/* User Info */}
        {user && (
          <div className="p-4 border-b border-slate-800">
            <p className="text-sm font-medium truncate">{user.name || user.email}</p>
            <p className="text-xs text-slate-400 capitalize mt-1">
              {user.role === "super_admin" ? "Super Admin" : user.role}
            </p>
          </div>
        )}

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredMenuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleNavigate(item.path)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-800 transition-colors text-left text-sm font-medium"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-800">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full justify-start gap-2 bg-slate-800 hover:bg-slate-700 text-white border-slate-700"
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-5 h-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Main content margin adjustment */}
      <div className="hidden lg:block w-64" />
    </>
  );
}
