import { useMemo, useState } from 'react';
import { formatDurationMmSs } from '../../utils/formatTime';

function SortHeader({ label, field, sortKey, sortDir, onSort }) {
    return (
        <th
            className="cursor-pointer select-none px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] hover:text-[var(--primary)]"
            onClick={() => onSort(field)}
        >
            {label}
            {sortKey === field && (sortDir === 'asc' ? ' ↑' : ' ↓')}
        </th>
    );
}

/**
 * Display-only sortable table. Initial order follows backend `rank` when sortKey is null.
 */
export default function StatsTable({ students, showEmail = true }) {
    const [sortKey, setSortKey] = useState(null);
    const [sortDir, setSortDir] = useState('asc');

    const sorted = useMemo(() => {
        if (!sortKey) return students;
        const copy = [...students];
        copy.sort((a, b) => {
            const av = a[sortKey];
            const bv = b[sortKey];
            if (typeof av === 'string') {
                return sortDir === 'asc'
                    ? av.localeCompare(bv)
                    : bv.localeCompare(av);
            }
            return sortDir === 'asc' ? av - bv : bv - av;
        });
        return copy;
    }, [students, sortKey, sortDir]);

    const handleSort = (key) => {
        if (sortKey === key) {
            setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(key);
            setSortDir(key === 'rank' ? 'asc' : 'desc');
        }
    };

    return (
        <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
            <table className="w-full min-w-[640px] text-sm">
                <thead className="border-b border-[var(--border)] bg-[var(--surface)]">
                    <tr>
                        <SortHeader label="Rank" field="rank" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                        <SortHeader label="Name" field="studentName" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                        {showEmail && (
                            <SortHeader label="Email" field="studentEmail" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                        )}
                        <SortHeader label="Attempted" field="questionsAttempted" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                        <SortHeader label="Correct" field="correctCount" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                        <SortHeader label="Wrong" field="wrongCount" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                        <SortHeader label="Time" field="totalTimeMs" sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                    {sorted.map((s) => (
                        <tr key={s.studentId} className="hover:bg-[var(--surface)] transition-colors">
                            <td className="px-4 py-3 font-bold text-[var(--primary)]">#{s.rank}</td>
                            <td className="px-4 py-3 font-medium text-[var(--text)]">{s.studentName}</td>
                            {showEmail && (
                                <td className="px-4 py-3 text-[var(--text-muted)]">{s.studentEmail}</td>
                            )}
                            <td className="px-4 py-3">{s.questionsAttempted}</td>
                            <td className="px-4 py-3 text-[var(--success)]">{s.correctCount}</td>
                            <td className="px-4 py-3 text-[var(--danger)]">{s.wrongCount}</td>
                            <td className="px-4 py-3 font-mono text-[var(--text-muted)]">
                                {formatDurationMmSs(s.totalTimeMs)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {sortKey && sortKey !== 'rank' && (
                <p className="border-t border-[var(--border)] px-4 py-2 text-xs text-[var(--text-muted)]">
                    Sorted for viewing only — ranks are assigned by the server.
                </p>
            )}
        </div>
    );
}
