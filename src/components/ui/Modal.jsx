import ReactDOM from 'react-dom'

export const Modal = ({ isOpen, onClose, title, children, wide = false }) => {
    if (!isOpen) return null

    return ReactDOM.createPortal(
        <div className="modal-overlay" onClick={onClose}>
            <div
                className={`modal-content ${wide ? 'modal-content-wide' : 'modal-content-normal'} animate-in fade-in zoom-in duration-200 flex flex-col`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-neumorphic flex-shrink-0">
                        <h2 className="text-2xl font-semibold text-neumorphic-text">{title}</h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                            <span className="text-2xl">×</span>
                        </button>
                    </div>
                )}
                <div className="flex-1 overflow-hidden flex flex-col relative">{children}</div>
            </div>
        </div>,
        document.getElementById('modal-root')
    )
}
