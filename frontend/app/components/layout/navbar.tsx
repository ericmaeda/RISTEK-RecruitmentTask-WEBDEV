import { Link, useLocation, useNavigate } from "react-router";
import { Button } from "~/components/ui/button";
import { FileText, Home, LogIn, LogOut, UserPlus } from "lucide-react";
import { useAuth } from "~/lib/auth-context";

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">FormBuilder</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/">
              <Button
                variant={isActive("/") ? "secondary" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            {isAuthenticated && (
              <Link to="/forms">
                <Button
                  variant={isActive("/forms") ? "secondary" : "ghost"}
                  size="sm"
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  My Forms
                </Button>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {isAuthenticated ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Welcome, {user?.username || user?.email}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gap-2">
                  <UserPlus className="h-4 w-4" />
                  Register
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
