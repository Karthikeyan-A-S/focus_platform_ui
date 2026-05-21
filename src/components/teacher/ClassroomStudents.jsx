import { useState, useEffect } from 'react';
import api from '../../api/axiosConfig';
import LoadingSpinner from '../common/LoadingSpinner';
import EmptyState from '../common/EmptyState';

export default function ClassroomStudents({ classroomId }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Autocomplete State
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        fetchStudents();
    }, [classroomId]);

    // --- Debounced Search Effect ---
    // This waits until the user stops typing for 300ms before calling the API
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim().length >= 2) {
                searchDatabaseForStudents(searchQuery);
            } else {
                setSuggestions([]); // Clear if less than 2 chars
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/teacher/classrooms/${classroomId}/students`);
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to load students', error);
        } finally {
            setLoading(false);
        }
    };

    const searchDatabaseForStudents = async (query) => {
        try {
            setIsSearching(true);
            const response = await api.get(`/teacher/students/search?query=${query}`);
            
            // Filter out students who are ALREADY in this classroom
            const existingIds = new Set(students.map(s => s.id));
            const filteredSuggestions = response.data.filter(s => !existingIds.has(s.id));
            
            setSuggestions(filteredSuggestions);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleInviteStudent = async (studentId) => {
        try {
            await api.post(`/teacher/classrooms/${classroomId}/students/${studentId}`);
            setSearchQuery('');
            setSuggestions([]);
            setShowInviteModal(false);
            fetchStudents(); // Refresh the list!
        } catch (error) {
            console.error('Failed to add student', error);
        }
    };

    const handleRemoveStudent = async (studentId) => {
        if (window.confirm('Are you sure you want to remove this student from the classroom?')) {
            try {
                await api.delete(`/teacher/classrooms/${classroomId}/students/${studentId}`);
                fetchStudents();
            } catch (error) {
                console.error('Error removing student', error);
            }
        }
    };

    if (loading) return <LoadingSpinner message="Loading students..." />;

    return (
        <div>
            <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-2">
                <h2 className="text-xl font-bold">Enrolled Students ({students.length})</h2>
                <button 
                    className="btn btn-sm" 
                    style={{ background: 'var(--success)' }}
                    onClick={() => setShowInviteModal(true)}
                >
                    + Invite Student
                </button>
            </div>

            {students.length === 0 ? (
                <EmptyState
                    title="No students enrolled yet"
                    description="Invite students using the button above or share your classroom invite code."
                    icon="🎓"
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {students.map((student) => (
                        <div key={student.id} className="card flex items-center justify-between py-3">
                            <div>
                                <p className="font-bold text-[var(--text)]">{student.name}</p>
                                <p className="text-sm text-[var(--text-muted)]">{student.email}</p>
                            </div>
                            <button
                                type="button"
                                className="text-sm font-bold text-[var(--danger)] hover:underline"
                                onClick={() => handleRemoveStudent(student.id)}
                            >
                                Remove
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* INVITE MODAL WITH AUTOCOMPLETE */}
            {showInviteModal && (
                <div className="modal-overlay">
                    <div className="modal-content max-w-md min-h-[400px]">
                        <h2 className="mb-4 text-xl font-bold">Invite a Student</h2>
                        
                        <div className="relative">
                            <input
                                type="text"
                                className="input-field mb-2"
                                placeholder="Start typing student's name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            {isSearching && (
                                <span className="absolute right-3 top-3 text-sm text-[var(--text-muted)]">
                                    Searching...
                                </span>
                            )}
                        </div>

                        {/* Search Results Dropdown Area */}
                        <div className="mt-2 flex-1 overflow-y-auto max-h-[250px] rounded border border-[var(--border)] bg-[var(--surface)]">
                            {searchQuery.trim().length < 2 ? (
                                <p className="p-4 text-center text-sm text-[var(--text-muted)]">
                                    Type at least 2 characters to search.
                                </p>
                            ) : suggestions.length === 0 && !isSearching ? (
                                <p className="p-4 text-center text-sm text-[var(--text-muted)]">
                                    No matching students found outside this classroom.
                                </p>
                            ) : (
                                <ul>
                                    {suggestions.map(user => (
                                        <li 
                                            key={user.id} 
                                            className="flex cursor-pointer items-center justify-between border-b border-[var(--border)] p-3 hover:bg-[var(--primary-muted)] transition-colors"
                                            onClick={() => handleInviteStudent(user.id)}
                                        >
                                            <div>
                                                <p className="font-bold text-sm">{user.name}</p>
                                            </div>
                                            <span className="text-xs font-bold text-[var(--primary)]">
                                                Add +
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                className="btn btn-secondary w-full"
                                onClick={() => {
                                    setShowInviteModal(false);
                                    setSearchQuery('');
                                    setSuggestions([]);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}