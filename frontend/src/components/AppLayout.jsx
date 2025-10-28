import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const LOGO_URL = "https://customer-assets.emergentagent.com/job_safe-eats-ai/artifacts/ld5nhj99_ChatGPT%20Image%20Oct%2012%2C%202025%2C%2011_29_54%20AM.png";

export default function AppLayout({ user, setUser, children }) {
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
      setUser(null);
      window.location.href = "/";
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', flexWrap: 'wrap' }}>
          <div className="logo">
            <img src={LOGO_URL} alt="ClarifyAI Logo" className="logo-image" />
            ClarifyAI
          </div>
          <nav className="nav-links">
            <Link 
              to="/dashboard" 
              className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
              data-testid="nav-dashboard"
            >
              Dashboard
            </Link>
            <Link 
              to="/product-scanner" 
              className={`nav-link ${location.pathname === '/product-scanner' ? 'active' : ''}`}
              data-testid="nav-product-scanner"
            >
              Product Scanner
            </Link>
            <Link 
              to="/recipe-finder" 
              className={`nav-link ${location.pathname === '/recipe-finder' ? 'active' : ''}`}
              data-testid="nav-recipe-finder"
            >
              Recipe Finder
            </Link>
            <Link 
              to="/menu-analyzer" 
              className={`nav-link ${location.pathname === '/menu-analyzer' ? 'active' : ''}`}
              data-testid="nav-menu-analyzer"
            >
              Menu Analyzer
            </Link>
          </nav>
        </div>
        <div className="user-info">
          {user.picture && (
            <img src={user.picture} alt={user.name} className="user-avatar" />
          )}
          <span className="user-name">{user.name}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            data-testid="logout-button"
            className="rounded-lg border-purple-500 text-purple-300 hover:border-purple-400 hover:text-purple-200 hover:bg-purple-500/10"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {children}
    </div>
  );
}
