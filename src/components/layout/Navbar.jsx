import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="nav-brand">
                {/* Clicking the logo routes them to the correct dashboard */}
                <Link 
                    to={user ? (user.role === 'TEACHER' ? '/teacher/dashboard' : '/student/dashboard') : '/login'} 
                    style={{ textDecoration: 'none', color: 'inherit' }}
                >
                    Focus Platform
                </Link>
            </div>
            
            {user && (
                <div className="nav-links">
                    <span style={{ fontWeight: '500' }}>
                        Welcome, {user.name} 
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '5px' }}>
                            ({user.role})
                        </span>
                    </span>
                    <button className="btn btn-danger" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            )}
        </nav>
    );
}