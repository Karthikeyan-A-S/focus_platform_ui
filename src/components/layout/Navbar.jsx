import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SearchContext } from '../../context/SearchContext'; // NEW: Imported SearchContext
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaRegLightbulb, FaUserCircle, FaSearch } from "react-icons/fa"; // NEW: Added FaSearch

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const { searchQuery, setSearchQuery } = useContext(SearchContext); // NEW: Consuming SearchContext
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const homePath = user
        ? user.role === 'TEACHER'
            ? '/teacher/dashboard'
            : '/student/dashboard'
        : '/login';

    const isActive = (path) =>
        location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <nav className="navbar flex items-center justify-between p-4 bg-[var(--surface)] border-b border-[var(--border)]">
            
            {/* BRAND */}
            <div className="nav-brand flex-shrink-0">
                <Link to={homePath} style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="font-bold text-xl text-[var(--primary)]">
                    <img src="/icon.png" alt="Focus Platform" style={{ height: '28px', width: '28px', objectFit: 'contain' }} />
                     FocusIQ
                </Link>
            </div>

            {user && (
                <>
                    {/* NEW: DYNAMIC SEARCH BAR */}
                    <div className="flex-1 max-w-md mx-4 sm:mx-8 relative hidden sm:block">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <FaSearch className="h-4 w-4 text-[var(--text-muted)]" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-[var(--border)] rounded-md leading-5 bg-[var(--background)] text-[var(--text)] placeholder-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] focus:border-[var(--primary)] sm:text-sm transition-all"
                            placeholder="Search classrooms or courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* NAV LINKS & ACTIONS */}
                    <div className="nav-links flex items-center gap-4">
                        {user.role === 'STUDENT' && (
                            <>
                                <Link
                                    to="/student/dashboard"
                                    className={`nav-link ${isActive('/student/dashboard') ? 'active font-bold text-[var(--primary)]' : 'text-[var(--text)] hover:text-[var(--primary)]'}`}
                                >
                                    Dashboard
                                </Link>
                                <Link
                                    to="/student/analytics"
                                    className={`nav-link ${isActive('/student/analytics') ? 'active font-bold text-[var(--primary)]' : 'text-[var(--text)] hover:text-[var(--primary)]'}`}
                                >
                                    Analytics
                                </Link>
                            </>
                        )}
                        {user.role === 'TEACHER' && (
                            <Link
                                to="/teacher/dashboard"
                                className={`nav-link ${isActive('/teacher/dashboard') ? 'active font-bold text-[var(--primary)]' : 'text-[var(--text)] hover:text-[var(--primary)]'}`}
                            >
                                Classrooms
                            </Link>
                        )}

                        {/* UPDATED: Profile Link (Role Tag Removed) */}
                        <Link
                            to="/profile"
                            className={`nav-link flex items-center gap-2 ${isActive('/profile') ? 'active text-[var(--primary)]' : 'text-[var(--text)] hover:text-[var(--primary)]'}`}
                            title="View Profile"
                        >
                            <FaUserCircle className="text-xl" />
                            <span className="hidden text-sm font-medium sm:inline">
                                {user.name}
                            </span>
                        </Link>

                        <button
                            type="button"
                            className="theme-toggle flex items-center justify-center p-2 rounded-full text-[var(--text)] hover:bg-[var(--border)] transition-colors"
                            onClick={toggleTheme}
                            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                            style={{
                                boxShadow: theme === 'dark' ? '0px 0px 10px 4px rgba(255, 255, 255, 0.15)' : 'none',
                                transition: 'box-shadow 0.3s ease'
                            }}
                        >
                            <FaRegLightbulb className="text-lg" />
                        </button>

                        <button 
                            type="button" 
                            className="btn btn-sm bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-md transition-colors font-medium border-none" 
                            onClick={handleLogout}
                        >
                            Logout
                        </button>
                    </div>
                </>
            )}
        </nav>
    );
}