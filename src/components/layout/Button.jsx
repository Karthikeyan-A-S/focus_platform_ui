export default function Button({ 
    children, 
    onClick, 
    type = 'button', 
    variant = 'primary', 
    disabled = false, 
    style,
    className = ''
}) {
    // Dynamically apply the correct CSS class based on the variant prop
    const baseClass = 'btn';
    const variantClass = variant === 'primary' ? 'btn-primary' : variant === 'danger' ? 'btn-danger' : '';
    
    return (
        <button 
            type={type} 
            className={`${baseClass} ${variantClass} ${className}`} 
            onClick={onClick} 
            disabled={disabled} 
            style={style}
        >
            {children}
        </button>
    );
}