import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { FaRegLightbulb, FaUserCircle } from "react-icons/fa"; // Added FaUserCircle

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
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
        <nav className="navbar">
            <div className="nav-brand">
                <Link to={homePath} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src="/icon.png" alt="Focus Platform" style={{ height: '28px', width: '28px', objectFit: 'contain' }} />
                     FocusIQ
                </Link>
            </div>

            {user && (
                <div className="nav-links flex items-center gap-4">
                    {user.role === 'STUDENT' && (
                        <>
                            <Link
                                to="/student/dashboard"
                                className={`nav-link ${isActive('/student/dashboard') ? 'active' : ''}`}
                            >
                                Dashboard
                            </Link>
                            <Link
                                to="/student/analytics"
                                className={`nav-link ${isActive('/student/analytics') ? 'active' : ''}`}
                            >
                                Analytics
                            </Link>
                        </>
                    )}
                    {user.role === 'TEACHER' && (
                        <Link
                            to="/teacher/dashboard"
                            className={`nav-link ${isActive('/teacher/dashboard') ? 'active' : ''}`}
                        >
                            Classrooms
                        </Link>
                    )}

                    {/* NEW: Clickable Profile Link */}
                    <Link
                        to="/profile"
                        className={`nav-link flex items-center gap-2 ${isActive('/profile') ? 'active' : ''}`}
                        title="View Profile"
                    >
                        <FaUserCircle className="text-lg" />
                        <span className="hidden text-sm font-medium sm:inline">
                            {user.name}
                            <span className="ml-1 text-xs opacity-70">({user.role})</span>
                        </span>
                    </Link>

                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        style={{
                            boxShadow: theme === 'dark' ? '0px 0px 10px 4px rgba(255, 255, 255, 0.75)' : 'none',
                            transition: 'box-shadow 0.3s ease'
                        }}
                    >
                        <FaRegLightbulb />
                    </button>

                    <button type="button" className="btn btn-danger btn-sm" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}