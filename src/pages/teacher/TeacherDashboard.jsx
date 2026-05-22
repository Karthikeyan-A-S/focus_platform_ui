import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { SearchContext } from '../../context/SearchContext'; // NEW: Imported SearchContext

export default function TeacherDashboard() {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClassroomName, setNewClassroomName] = useState('');
    const [editingClassroom, setEditingClassroom] = useState(null);
    const [editClassroomName, setEditClassroomName] = useState('');
    const [copiedId, setCopiedId] = useState(null); 
    
    const [totalUnreadCounts, setTotalUnreadCounts] = useState({});

    const navigate = useNavigate();
    
    // NEW: Bring in the search query from Context
    const { searchQuery } = useContext(SearchContext);

    useEffect(() => {
        fetchClassrooms();
    }, []);

    // Polling mechanism to update badges live every 10 seconds
    useEffect(() => {
        if (classrooms.length === 0) return;

        const fetchAllUnreadCounts = async () => {
            const counts = {};
            for (const cls of classrooms) {
                try {
                    const res = await api.get(`/chat/unread-total?targetType=CLASSROOM&targetId=${cls.id}`);
                    counts[cls.id] = res.data;
                } catch (e) {
                    console.error("Failed to fetch unread count for", cls.id);
                }
            }
            setTotalUnreadCounts(counts);
        };

        fetchAllUnreadCounts();
        const intervalId = setInterval(fetchAllUnreadCounts, 10000);

        return () => clearInterval(intervalId);
    }, [classrooms]);

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
            setTimeout(() => setCopiedId(null), 2000); 
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

    // --- NEW: Filter Classrooms based on Search Query ---
    const filteredClassrooms = classrooms.filter(classroom => {
        const query = (searchQuery || "").toLowerCase().trim();
        if (!query) return true; // Show all if search is empty
        return classroom.name.toLowerCase().includes(query);
    });

    if (loading) return <LoadingSpinner message="Loading your dashboard..." />;

    return (
        <div className="page-container animate-fade-in">
            <div className="page-header flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Dashboard</h1>
                    <p className="page-subtitle">Manage classrooms, courses, students, and analytics</p>
                </div>
                <div className="flex gap-2">
                    <button type="button" className="btn" onClick={() => setShowCreateModal(true)}>
                        + Create Classroom
                    </button>
                </div>
            </div>

            {/* Check empty state, then check search state, then map results */}
            {classrooms.length === 0 ? (
                <div className="card text-center py-12 text-[var(--text-muted)] border border-[var(--border)] bg-[var(--surface)]">
                    You haven&apos;t created any classrooms yet. Click "+ Create Classroom" to start!
                </div>
            ) : filteredClassrooms.length === 0 ? (
                 <div className="card text-center py-12 text-[var(--text-muted)] border border-[var(--border)] bg-[var(--surface)]">
                    No classrooms match your search for "{searchQuery}".
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredClassrooms.map((classroom) => (
                        <div key={classroom.id} className="card bg-[var(--surface)] border border-[var(--border)] transition-all hover:shadow-md">
                            <h2 className="mb-2 text-xl font-bold text-[var(--text)]">{classroom.name}</h2>
                            <p className="mb-4 text-[var(--text-muted)]">
                                Invite:{' '}
                                <span
                                    className="cursor-pointer font-mono font-bold text-[var(--primary)] hover:underline bg-[var(--background)] px-2 py-1 rounded"
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
                                    className="btn w-full bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90"
                                    onClick={() => navigate(`/teacher/classroom/${classroom.id}`)}
                                >
                                    Manage Courses & Students
                                </button>
                                
                                <button
                                    type="button"
                                    className="btn w-full relative bg-[var(--background)] text-[var(--text)] hover:bg-[var(--border)] border border-[var(--border)]"
                                    onClick={() => navigate(`/chat/CLASSROOM/${classroom.id}`)}
                                >
                                    💬 Open Class Chat
                                    {totalUnreadCounts[classroom.id] > 0 && (
                                        <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                                            {totalUnreadCounts[classroom.id] > 99 ? '99+' : totalUnreadCounts[classroom.id]}
                                        </span>
                                    )}
                                </button>
                            </div>

                            <div className="mt-4 flex justify-between border-t border-[var(--border)] pt-3">
                                <button
                                    type="button"
                                    className="text-sm font-bold text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors"
                                    onClick={() => {
                                        setEditingClassroom(classroom);
                                        setEditClassroomName(classroom.name);
                                    }}
                                >
                                    Edit Name
                                </button>
                                <button
                                    type="button"
                                    className="text-sm font-bold text-red-500 hover:text-red-600 transition-colors"
                                    onClick={() => handleDeleteClassroom(classroom.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">
                        <h2 className="mb-4 text-xl font-bold">Create New Classroom</h2>
                        <form onSubmit={handleCreateClassroom}>
                            <input
                                className="input-field mb-4 bg-[var(--background)] text-[var(--text)] border-[var(--border)]"
                                placeholder="Classroom Name"
                                value={newClassroomName}
                                onChange={(e) => setNewClassroomName(e.target.value)}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" className="btn btn-secondary border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)] text-[var(--text)]" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn" style={{ background: 'var(--success)', color: '#fff' }}>Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {editingClassroom && (
                <div className="modal-overlay">
                    <div className="modal-content bg-[var(--surface)] text-[var(--text)] border border-[var(--border)]">
                        <h2 className="mb-4 text-xl font-bold">Edit Classroom</h2>
                        <form onSubmit={handleUpdateClassroom}>
                            <input
                                className="input-field mb-4 bg-[var(--background)] text-[var(--text)] border-[var(--border)]"
                                placeholder="Classroom Name"
                                value={editClassroomName}
                                onChange={(e) => setEditClassroomName(e.target.value)}
                                required
                            />
                            <div className="flex justify-end gap-2">
                                <button type="button" className="btn btn-secondary border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)] text-[var(--text)]" onClick={() => setEditingClassroom(null)}>Cancel</button>
                                <button type="submit" className="btn bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}