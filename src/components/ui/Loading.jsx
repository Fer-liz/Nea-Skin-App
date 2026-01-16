export const Loading = ({ message = 'Cargando...' }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12">
            <div className="spinner mb-4"></div>
            <p className="text-neumorphic-text-light">{message}</p>
        </div>
    )
}
