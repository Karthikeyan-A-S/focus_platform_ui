import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

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
                <Link to={homePath}>Focus Platform</Link>
            </div>

            {user && (
                <div className="nav-links">
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

                    <span className="hidden text-sm font-medium text-[var(--text-muted)] sm:inline">
                        {user.name}
                        <span className="ml-1 text-xs opacity-70">({user.role})</span>
                    </span>

                    <button
                        type="button"
                        className="theme-toggle"
                        onClick={toggleTheme}
                        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>

                    <button type="button" className="btn btn-danger btn-sm" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}
