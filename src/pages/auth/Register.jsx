import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authApi } from '../../api/authApi';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(''); 
    const [role, setRole] = useState('STUDENT');
    
    // NEW: Toggles for both password fields
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    const isValidEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // NEW: Username validation (3-30 chars, letters, numbers, spaces, or underscores)
    const isValidUsername = (username) => {
        const usernameRegex = /^[a-zA-Z0-9_ ]{3,30}$/;
        return usernameRegex.test(username);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        
        if (!isValidUsername(name.trim())) {
            setError('Name must be 3-30 characters long and contain only letters, numbers, or spaces.');
            return;
        }

        if (!isValidEmail(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        
        try {
            await authApi.register(name.trim(), email, password, role);
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
                        <label>Full Name / Username</label>
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
                        <div className="relative">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                className="input-field w-full pr-16"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                                minLength="6"
                            />
                            <button 
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--primary)]"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <div className="relative">
                            <input 
                                type={showConfirmPassword ? "text" : "password"} 
                                className="input-field w-full pr-16"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required 
                                minLength="6"
                            />
                            <button 
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-[var(--text-muted)] hover:text-[var(--primary)]"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                                {showConfirmPassword ? 'Hide' : 'Show'}
                            </button>
                        </div>
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