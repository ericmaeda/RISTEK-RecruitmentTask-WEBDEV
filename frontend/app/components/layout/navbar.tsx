import { Link, useLocation } from "react-router";
import { Button } from "~/components/ui/button";
import { FileText, Home, LogIn, LogOut, UserPlus } from "lucide-react";

interface NavbarProps {
  isLoggedIn?: boolean;
  userName?: string;
  onLogout?: () => void;
}

export function Navbar({ isLoggedIn = false, userName, onLogout }: NavbarProps) {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

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
            {isLoggedIn && (
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
          {isLoggedIn ? (
            <>
              <span className="hidden sm:inline text-sm text-muted-foreground">
                Welcome, {userName}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={onLogout}
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
