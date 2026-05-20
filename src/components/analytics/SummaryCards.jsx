import { formatDuration } from '../../utils/formatTime';

const CARD_CONFIG = [
    { key: 'attempted', label: 'Questions Attempted', color: 'var(--primary)' },
    { key: 'correct', label: 'Correct', color: 'var(--success)' },
    { key: 'wrong', label: 'Wrong', color: 'var(--danger)' },
    { key: 'time', label: 'Total Time', color: 'var(--accent)' },
];

export default function SummaryCards({ attempted, correct, wrong, timeMs }) {
    const values = {
        attempted,
        correct,
        wrong,
        time: formatDuration(timeMs),
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CARD_CONFIG.map(({ key, label, color }) => (
                <div
                    key={key}
                    className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-sm transition-shadow hover:shadow-md"
                >
                    <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                        {label}
                    </p>
                    <p className="mt-2 text-3xl font-bold" style={{ color }}>
                        {values[key]}
                    </p>
                </div>
            ))}
        </div>
    );
}
