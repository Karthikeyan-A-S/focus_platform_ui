import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axiosConfig';

export default function TeacherDashboard() {
    const [classrooms, setClassrooms] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Create States
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClassroomName, setNewClassroomName] = useState('');

    // Edit States
    const [editingClassroom, setEditingClassroom] = useState(null);
    const [editClassroomName, setEditClassroomName] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        fetchClassrooms();
    }, []);

    const fetchClassrooms = async () => {
        try {
            const response = await api.get('/teacher/classrooms');
            setClassrooms(response.data);
        } catch (error) {
            console.error("Failed to load classrooms", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateClassroom = async (e) => {
        e.preventDefault();
        try {
            await api.post('/teacher/classrooms', { name: newClassroomName });
            setShowCreateModal(false);
            setNewClassroomName('');
            fetchClassrooms();
        } catch (error) {
            console.error("Error creating classroom", error);
        }
    };

    // --- NEW: Update Handler ---
    const handleUpdateClassroom = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/teacher/classrooms/${editingClassroom.id}`, { name: editClassroomName });
            setEditingClassroom(null);
            fetchClassrooms();
        } catch (error) {
            console.error("Error updating classroom", error);
        }
    };

    // --- NEW: Delete Handler ---
    const handleDeleteClassroom = async (id) => {
        if (window.confirm("Are you sure you want to delete this entire classroom? This cannot be undone.")) {
            try {
                await api.delete(`/teacher/classrooms/${id}`);
                fetchClassrooms();
            } catch (error) {
                console.error("Error deleting classroom", error);
            }
        }
    };

    if (loading) return <div className="p-6">Loading your dashboard...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
                <button className="btn" onClick={() => setShowCreateModal(true)}>+ Create Classroom</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {classrooms.map(classroom => (
                    <div key={classroom.id} className="card relative">
                        <h2 className="text-xl font-bold mb-2">{classroom.name}</h2>
                        <p className="text-gray-600 mb-4">Invite Code: <span className="font-mono font-bold text-blue-600">{classroom.inviteCode}</span></p>
                        
                        <div className="flex gap-2 mb-4">
                            <button 
                                className="btn flex-1 bg-blue-500" 
                                onClick={() => navigate(`/teacher/classroom/${classroom.id}`)}
                            >
                                Manage Courses
                            </button>
                        </div>

                        {/* NEW: Edit/Delete Buttons */}
                        <div className="flex justify-between border-t pt-3 mt-2">
                            <button 
                                className="text-sm text-gray-500 hover:text-blue-600 font-bold"
                                onClick={() => {
                                    setEditingClassroom(classroom);
                                    setEditClassroomName(classroom.name);
                                }}
                            >
                                Edit Name
                            </button>
                            <button 
                                className="text-sm text-red-400 hover:text-red-600 font-bold"
                                onClick={() => handleDeleteClassroom(classroom.id)}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="card modal-content">
                        <h2 className="text-xl mb-4 font-bold">Create New Classroom</h2>
                        <form onSubmit={handleCreateClassroom}>
                            <input className="input-field mb-4 w-full" placeholder="Classroom Name" value={newClassroomName} onChange={(e) => setNewClassroomName(e.target.value)} required />
                            <div className="flex justify-end gap-2">
                                <button type="button" className="btn bg-gray-400" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="btn bg-green-600">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {editingClassroom && (
                <div className="modal-overlay">
                    <div className="card modal-content">
                        <h2 className="text-xl mb-4 font-bold">Edit Classroom</h2>
                        <form onSubmit={handleUpdateClassroom}>
                            <input className="input-field mb-4 w-full" placeholder="Classroom Name" value={editClassroomName} onChange={(e) => setEditClassroomName(e.target.value)} required />
                            <div className="flex justify-end gap-2">
                                <button type="button" className="btn bg-gray-400" onClick={() => setEditingClassroom(null)}>Cancel</button>
                                <button type="submit" className="btn bg-blue-600">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}