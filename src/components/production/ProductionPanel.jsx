export const ProductionPanel = () => {
    return (
        <div className="neumorphic-card">
            <div className="text-center py-12">
                <h2 className="text-2xl font-bold text-neumorphic-text mb-4">⚙️ Módulo de Producción</h2>
                <p className="text-gray-600 mb-6">
                    Este módulo permite verificar el stock disponible y producir lotes de recetas,
                    descontando automáticamente los ingredientes del inventario.
                </p>
                <div className="alert alert-info inline-block">
                    <strong>Próximamente:</strong> Funcionalidad de producción en desarrollo
                </div>
            </div>
        </div>
    )
}
