import { useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { formatDuration, formatDurationMmSs } from '../../utils/formatTime';
import EmptyState from '../common/EmptyState';

const RANK_TOOLTIP =
    'Ranking: more questions attempted → faster total time → more correct answers.';

function PodiumCard({ entry, place }) {
    const heights = { 1: 'h-28', 2: 'h-20', 3: 'h-16' };
    const colors = {
        1: 'from-amber-400 to-amber-600',
        2: 'from-slate-300 to-slate-500',
        3: 'from-orange-300 to-orange-500',
    };

    return (
        <div className="flex flex-1 flex-col items-center">
            <div
                className={`mb-2 flex w-full max-w-[140px] flex-col items-center justify-end rounded-t-xl bg-gradient-to-t ${colors[place]} ${heights[place]} px-2 pt-3 text-white shadow-lg`}
                title={RANK_TOOLTIP}
            >
                <span className="text-2xl font-black">#{entry.rank}</span>
            </div>
            <p className="max-w-[140px] truncate text-center text-sm font-bold text-[var(--text)]">
                {entry.studentName}
            </p>
            <p className="text-xs text-[var(--text-muted)]">
                {entry.correctCount} correct · {formatDuration(entry.totalTimeMs)}
            </p>
        </div>
    );
}

export default function Leaderboard({ entries, courseTitle }) {
    const { user } = useContext(AuthContext);
    const currentUserId = user?.id ? Number(user.id) : null;

    const hasAttempts = entries.some((e) => e.questionsAttempted > 0);

    if (!entries.length || !hasAttempts) {
        return (
            <EmptyState
                title="No attempts yet for this course."
                description="Complete a quiz to appear on the leaderboard."
                icon="🏆"
            />
        );
    }

    const topThree = entries.filter((e) => e.rank <= 3);
    const rest = entries.filter((e) => e.rank > 3);

    const podiumOrder = [
        topThree.find((e) => e.rank === 2),
        topThree.find((e) => e.rank === 1),
        topThree.find((e) => e.rank === 3),
    ].filter(Boolean);

    return (
        <div className="animate-fade-in space-y-8">
            {courseTitle && (
                <div>
                    <h2 className="text-2xl font-bold text-[var(--text)]">{courseTitle}</h2>
                    <p className="mt-1 text-sm text-[var(--text-muted)]" title={RANK_TOOLTIP}>
                        Rankings are calculated by the server.
                    </p>
                </div>
            )}

            {podiumOrder.length > 0 && (
                <div className="flex items-end justify-center gap-4 px-4 py-6">
                    {podiumOrder.map((entry) => (
                        <PodiumCard
                            key={entry.studentId}
                            entry={entry}
                            place={entry.rank}
                        />
                    ))}
                </div>
            )}

            <div className="overflow-x-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-sm">
                <table className="w-full text-sm">
                    <thead className="border-b border-[var(--border)] bg-[var(--surface)]">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--text-muted)]">Rank</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--text-muted)]">Name</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--text-muted)]">Attempted</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--text-muted)]">Correct</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-[var(--text-muted)]">Time</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {entries.map((entry) => {
                            const isCurrentUser =
                                currentUserId != null && entry.studentId === currentUserId;
                            return (
                                <tr
                                    key={entry.studentId}
                                    className={
                                        isCurrentUser
                                            ? 'bg-[var(--primary-muted)] ring-1 ring-inset ring-[var(--primary)]'
                                            : 'hover:bg-[var(--surface)]'
                                    }
                                    title={RANK_TOOLTIP}
                                >
                                    <td className="px-4 py-3 font-bold text-[var(--primary)]">#{entry.rank}</td>
                                    <td className="px-4 py-3 font-medium">
                                        {entry.studentName}
                                        {isCurrentUser && (
                                            <span className="ml-2 rounded-full bg-[var(--primary)] px-2 py-0.5 text-xs text-white">
                                                You
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">{entry.questionsAttempted}</td>
                                    <td className="px-4 py-3 text-[var(--success)]">{entry.correctCount}</td>
                                    <td className="px-4 py-3 font-mono text-[var(--text-muted)]">
                                        {formatDurationMmSs(entry.totalTimeMs)}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {rest.length === 0 && entries.length <= 3 && (
                <p className="text-center text-sm text-[var(--text-muted)]">
                    {entries.length} participant{entries.length !== 1 ? 's' : ''} on the board.
                </p>
            )}
        </div>
    );
}
