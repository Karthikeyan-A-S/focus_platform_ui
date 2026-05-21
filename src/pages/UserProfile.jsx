import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';

export default function UserProfile() {
    const { id } = useParams(); // Grabs the ID from the URL
    const navigate = useNavigate();
    
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await api.get(`/users/${id}`);
                setProfile(response.data);
            } catch (err) {
                setError("User not found or you don't have permission to view this profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [id]);

    if (loading) return <div className="page-container mt-10 text-center">Loading profile...</div>;
    
    if (error) return (
        <div className="page-container">
            <div className="alert alert-error">{error}</div>
            <button className="btn btn-secondary mt-4" onClick={() => navigate(-1)}>← Go Back</button>
        </div>
    );

    const initial = profile.name ? profile.name.charAt(0).toUpperCase() : '?';

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
                <div className="mb-8 flex items-center gap-6 border-b border-[var(--border)] pb-8">
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[var(--primary)] text-4xl font-bold text-white shadow-md">
                        {initial}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text)]">{profile.name}</h1>
                        <p className="mt-1 text-lg capitalize text-[var(--text-muted)]">
                            {profile.role.toLowerCase()} Account
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                    <div>
                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Account ID</label>
                        <p className="mt-1 text-lg font-semibold text-[var(--text)]">#{profile.id}</p>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Email Address</label>
                        <p className="mt-1 text-lg font-semibold text-[var(--text)]">{profile.email}</p>
                    </div>
                    <div>
                        <label className="text-xs uppercase tracking-wider text-[var(--text-muted)]">Platform Role</label>
                        <p className="mt-1 text-lg font-semibold capitalize text-[var(--text)]">{profile.role.toLowerCase()}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}