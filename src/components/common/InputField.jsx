export default function InputField({ 
    label, 
    type = 'text', 
    value, 
    onChange, 
    placeholder, 
    required = false,
    maxLength,
    min,
    max
}) {
    return (
        <div className="form-group">
            {label && <label>{label}</label>}
            <input 
                type={type} 
                className="input-field"
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                maxLength={maxLength}
                min={min}
                max={max}
            />
        </div>
    );
}