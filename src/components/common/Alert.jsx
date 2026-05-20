export default function Alert({ type = 'error', message }) {
    if (!message) return null;

    const baseStyle = {
        padding: '12px',
        marginBottom: '15px',
        borderRadius: '4px',
        fontSize: '14px',
        fontWeight: '500'
    };

    const typeStyles = {
        error: {
            color: 'var(--error-color)',
            backgroundColor: '#fdf3f4', // Light red background
            border: '1px solid var(--error-color)'
        },
        success: {
            color: 'var(--success-color)',
            backgroundColor: '#e6f4ea', // Light green background
            border: '1px solid var(--success-color)'
        }
    };

    return (
        <div style={{ ...baseStyle, ...typeStyles[type] }}>
            {message}
        </div>
    );
}