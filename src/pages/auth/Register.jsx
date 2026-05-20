import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('STUDENT'); // Default to student
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);
        
        try {
            await authApi.register(name, email, password, role);
            // On successful registration, send them to the login page
            navigate('/login', { state: { message: 'Registration successful! Please log in.' } });
        } catch (err) {
            const msg = err.response?.data?.error || err.response?.data?.message;
            setError(msg || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container flex min-h-[70vh] items-center justify-center">
            <div className="card w-full max-w-md animate-fade-in">
                <h2 className="mb-6 text-2xl font-bold text-[var(--text)]">Create an Account</h2>

                {error && <div className="alert alert-error mb-4">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            className="input-field"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required 
                        />
                    </div>

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
                            minLength="6"
                        />
                    </div>

                    <div className="form-group">
                        <label>I am a...</label>
                        <select 
                            className="input-field"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="TEACHER">Teacher</option>
                        </select>
                    </div>
                    
                    <button type="submit" className="btn mt-4 w-full" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-[var(--primary)]">Log In</Link>
                </p>
            </div>
        </div>
    );
}