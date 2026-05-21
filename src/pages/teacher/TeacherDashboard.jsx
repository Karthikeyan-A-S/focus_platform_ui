import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function TeacherDashboard() {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClassroomName, setNewClassroomName] = useState('');
    const [editingClassroom, setEditingClassroom] = useState(null);
    const [editClassroomName, setEditClassroomName] = useState('');
    const [copiedId, setCopiedId] = useState(null); // tracks which classroom was just copied

    const navigate = useNavigate();

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const response = await api.get('/teacher/classrooms');
            setClassrooms(response.data);
        } catch (error) {
            console.error('Failed to load classrooms', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCopyInviteCode = (classroom) => {
        navigator.clipboard.writeText(classroom.inviteCode).then(() => {
            setCopiedId(classroom.id);
            setTimeout(() => setCopiedId(null), 2000); // reset after 2s
        });
    };

    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teacher/classrooms', { name: newClassroomName });
            setShowCreateModal(false);
            setNewClassroomName('');
            fetchClassrooms();
        } catch (error) {
            console.error('Error creating classroom', error);
        }
    };

    const handleUpdateClassroom = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/teacher/classrooms/${editingClassroom.id}`, { name: editClassroomName });
            setEditingClassroom(null);
            fetchClassrooms();
        } catch (error) {
            console.error('Error updating classroom', error);
        }
    };

    const handleDeleteClassroom = async (id) => {
        if (window.confirm('Are you sure you want to delete this entire classroom? This cannot be undone.')) {
            try {
                await api.delete(`/teacher/classrooms/${id}`);
                fetchClassrooms();
            } catch (error) {
                console.error('Error deleting classroom', error);
            }
        }
    };

    if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Teacher Dashboard</h1>
                    <p className="page-subtitle">Manage classrooms, courses, students, and analytics</p>
                </div>
                <button type="button" className="btn" onClick={() => setShowCreateModal(true)}>
                    + Create Classroom
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {classrooms.map((classroom) => (
                    <div key={classroom.id} className="card">
                        <h2 className="mb-2 text-xl font-bold">{classroom.name}</h2>
                        <p className="mb-4 text-[var(--text-muted)]">
                            Invite:{' '}
                            <span
                                className="cursor-pointer font-mono font-bold text-[var(--primary)] hover:underline"
                                title="Click to copy"
                                onClick={() => handleCopyInviteCode(classroom)}
                            >
                                {classroom.inviteCode}
                            </span>
                            {copiedId === classroom.id && (
                                <span className="ml-2 text-xs font-semibold text-[var(--success)]">
                                    Copied!
                                </span>
                            )}
                        </p>

                        <div className="flex flex-col gap-2">
                            <button
                                type="button"
                                className="btn w-full"
                                onClick={() => navigate(`/teacher/classroom/${classroom.id}`)}
                            >
                                Manage Courses & Students
                            </button>
                        </div>

                        <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-3">
                            <button
                                type="button"
                                className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--primary)]"
                                onClick={() => {
                                    setEditingClassroom(classroom);
                                    setEditClassroomName(classroom.name);
                                }}
                            >
                                Edit Name
                            </button>
                            <button
                                type="button"
                                className="text-sm font-bold text-[var(--danger)]"
                                onClick={() => handleDeleteClassroom(classroom.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="mb-4 text-xl font-bold">Create New Classroom</h2>
                        <form onSubmit={handleCreateClassroom}>
                            <input
                                className="input-field mb-4"
                                placeholder="Classroom Name"
                                value={newClassroomName}
                                onChange={(e) => setNewClassroomName(e.target.value)}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowCreateModal(false)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn" style={{ background: 'var(--success)' }}>
                                    Create
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingClassroom && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2 className="mb-4 text-xl font-bold">Edit Classroom</h2>
                        <form onSubmit={handleUpdateClassroom}>
                            <input
                                className="input-field mb-4"
                                placeholder="Classroom Name"
                                value={editClassroomName}
                                onChange={(e) => setEditClassroomName(e.target.value)}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setEditingClassroom(null)}
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="btn">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}