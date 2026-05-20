export default function EmptyState({ title, description, icon = '📊' }) {
    return (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center">
            <span className="mb-4 text-4xl" aria-hidden="true">{icon}</span>
            <h3 className="text-lg font-semibold text-[var(--text)]">{title}</h3>
            {description && (
                <p className="mt-2 max-w-md text-sm text-[var(--text-muted)]">{description}</p>
            )}
        </div>
    );
}
