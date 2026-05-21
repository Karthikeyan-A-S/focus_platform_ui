import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function Profile() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    if (!user) return null;

    // Get the first letter of the user's name for the avatar
    const initial = user.name ? user.name.charAt(0).toUpperCase() : '?';

    return (
        <div className="page-container animate-fade-in">
            <button
                type="button"
                className="mb-4 text-sm font-medium text-[var(--primary)] hover:underline"
                onClick={() => navigate(-1)}
            >
                ← Go Back
            </button>

            <div className="card mx-auto mt-4 max-w-2xl p-8">
                {/* Profile Header */}
                <div className="mb-8 flex items-center gap-6 border-b border-[var(--border)] pb-8">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--primary)] text-4xl font-bold text-white shadow-md">
                        {initial}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text)]">{user.name}</h1>
                        <p className="mt-1 text-lg capitalize text-[var(--text-muted)]">
                            {user.role.toLowerCase()} Account
                        </p>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div>
                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                            Account ID
                        </label>
                        <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                            {user.id ? `#${user.id}` : 'Pending...'}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                            Email Address
                        </label>
                        <p className="mt-1 text-lg font-semibold text-[var(--text)]">
                            {user.email}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                            Platform Role
                        </label>
                        <p className="mt-1 text-lg font-semibold capitalize text-[var(--text)]">
                            {user.role.toLowerCase()}
                        </p>
                    </div>

                    <div>
                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">
                            Account Status
                        </label>
                        <p className="mt-1 text-lg font-semibold text-[var(--success)]">
                            Active
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}