import { useEffect, useState } from 'react';
import {
    fetchClassroomStudents,
    removeClassroomStudent,
} from '../../api/teacherStudentsApi';
import { getApiErrorMessage } from '../../utils/apiError';
import ConfirmDialog from '../common/ConfirmDialog';
import EmptyState from '../common/EmptyState';
import LoadingSpinner from '../common/LoadingSpinner';

export default function ClassroomStudents({ classroomId }) {
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [removing, setRemoving] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                setLoading(true);
                setError('');
                const data = await fetchClassroomStudents(classroomId);
                if (!cancelled) setStudents(data);
            } catch (err) {
                if (!cancelled) setError(getApiErrorMessage(err));
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [classroomId, refreshKey]);

    const loadStudents = () => setRefreshKey((k) => k + 1);

    const handleRemove = async () => {
        if (!removing) return;
        try {
            setActionLoading(true);
            await removeClassroomStudent(classroomId, removing.id);
            setRemoving(null);
            await loadStudents();
        } catch (err) {
            setError(getApiErrorMessage(err));
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) return <LoadingSpinner message="Loading student roster..." />;

    return (
        <div className="animate-fade-in">
            <div className="page-header mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text)]">Classroom Students</h2>
                    <p className="text-sm text-[var(--text-muted)]">
                        View and manage enrolled students for this class
                    </p>
                </div>
                <span className="rounded-full bg-[var(--primary-muted)] px-4 py-1 text-sm font-semibold text-[var(--primary)]">
                    {students.length} student{students.length !== 1 ? 's' : ''}
                </span>
            </div>

            {error && <div className="alert alert-error mb-4">{error}</div>}

            {students.length === 0 ? (
                <EmptyState
                    title="No students enrolled yet"
                    description="Share your classroom invite code so students can join."
                    icon="🎓"
                />
            ) : (
                <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                    <table className="w-full text-sm">
                        <thead className="border-b border-[var(--border)] bg-[var(--surface)]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--text-muted)]">Name</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--text-muted)]">Email</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-[var(--text-muted)]">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {students.map((student) => (
                                <tr key={student.id} className="hover:bg-[var(--surface)]">
                                    <td className="px-4 py-3 font-medium text-[var(--text)]">{student.name}</td>
                                    <td className="px-4 py-3 text-[var(--text-muted)]">{student.email}</td>
                                    <td className="px-4 py-3 text-right">
                                        <button
                                            type="button"
                                            className="btn btn-danger btn-sm"
                                            onClick={() => setRemoving(student)}
                                            disabled={actionLoading}
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <ConfirmDialog
                open={!!removing}
                title="Remove student?"
                message={
                    removing
                        ? `Remove ${removing.name} (${removing.email}) from this classroom? They will lose access to its courses.`
                        : ''
                }
                confirmLabel={actionLoading ? 'Removing...' : 'Remove'}
                onConfirm={handleRemove}
                onCancel={() => !actionLoading && setRemoving(null)}
            />
        </div>
    );
}
