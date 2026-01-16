export const Alert = ({ type = 'info', message, onClose }) => {
    const types = {
        success: 'alert-success',
        error: 'alert-error',
        info: 'alert-info'
    }

    if (!message) return null

    return (
        <div className={`alert ${types[type]}`}>
            <div className="flex justify-between items-center">
                <span>{message}</span>
                {onClose && (
                    <button onClick={onClose} className="ml-4 text-xl font-bold hover:opacity-70">
                        ×
                    </button>
                )}
            </div>
        </div>
    )
}
