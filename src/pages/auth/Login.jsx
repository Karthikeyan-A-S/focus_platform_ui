import { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Check if we were redirected here from the Register page with a success message
    const successMessage = location.state?.message;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            const role = await login(email, password);
            // The AuthContext saves the token, we just need to route them to the right dashboard
            if (role === 'TEACHER') {
                navigate('/teacher/dashboard');
            } else {
                navigate('/student/dashboard');
            }
        } catch (err) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container flex min-h-[70vh] items-center justify-center">
            <div className="card w-full max-w-md animate-fade-in">
                <h2 className="mb-6 text-2xl font-bold text-[var(--text)]">Login to Focus</h2>

                {successMessage && <div className="alert mb-4" style={{ color: 'var(--success)', background: 'var(--primary-muted)' }}>{successMessage}</div>}
                {error && <div className="alert alert-error mb-4">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required 
                        />
                    </div>
                    
                    <button type="submit" className="btn mt-4 w-full" disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                    Don&apos;t have an account?{' '}
                    <Link to="/register" className="font-semibold text-[var(--primary)]">Sign Up</Link>
                </p>
            </div>
        </div>
    );
}