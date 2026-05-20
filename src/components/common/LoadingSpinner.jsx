export default function LoadingSpinner({ message = 'Loading...' }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-16">
            <div
                className="h-10 w-10 animate-spin rounded-full border-4 border-[var(--border)] border-t-[var(--primary)]"
                role="status"
                aria-label="Loading"
            />
            <p className="text-sm font-medium text-[var(--text-muted)]">{message}</p>
        </div>
    );
}
