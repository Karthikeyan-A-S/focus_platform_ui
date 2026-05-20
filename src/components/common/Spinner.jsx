export default function Spinner({ text = 'Loading...' }) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <span style={{ 
                color: 'var(--text-muted)', 
                fontSize: '18px', 
                fontWeight: '500' 
            }}>
                {text}
            </span>
        </div>
    );
}