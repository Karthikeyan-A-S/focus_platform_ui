export default function ConfirmDialog({
    open,
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    variant = 'danger',
    onConfirm,
    onCancel,
}) {
    if (!open) return null;

    const confirmClass =
        variant === 'danger'
            ? 'bg-[var(--danger)] hover:opacity-90'
            : 'bg-[var(--primary)] hover:opacity-90';

    return (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-labelledby="confirm-title">
            <div className="modal-content max-w-md">
                <h2 id="confirm-title" className="text-xl font-bold text-[var(--text)]">{title}</h2>
                <p className="mt-3 text-sm text-[var(--text-muted)]">{message}</p>
                <div className="mt-6 flex justify-end gap-3">
                    <button type="button" className="btn btn-secondary" onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button type="button" className={`btn text-white ${confirmClass}`} onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
