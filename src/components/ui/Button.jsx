export const Button = ({
    children,
    onClick,
    variant = 'primary',
    type = 'button',
    disabled = false,
    className = ''
}) => {
    const baseClasses = 'neumorphic-btn'
    const variantClasses = {
        primary: 'neumorphic-btn-primary',
        danger: 'neumorphic-btn-danger',
        success: 'neumorphic-btn-success',
        default: ''
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className={`${baseClasses} ${variantClasses[variant]} ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : ''
                }`}
        >
            {children}
        </button>
    )
}
