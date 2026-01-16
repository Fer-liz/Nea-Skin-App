import { useState, useEffect } from 'react'
import { useRecipes } from '../../hooks/useRecipes'
import { useProduction } from '../../hooks/useProduction'
import { SearchableCombobox } from '../ui/Combobox' // We can reuse this or simple select if preferred
import { Button } from '../ui/Button'
import { Loading } from '../ui/Loading'
import { Alert } from '../ui/Alert'
import { formatearGramos } from '../../lib/utils'

export const ProductionTab = () => {
    const { recipes, getRecipeDetail, loading: recipesLoading } = useRecipes()
    const { produceBatch, loading: productionLoading } = useProduction()

    const [selectedRecipe, setSelectedRecipe] = useState(null)
    const [units, setUnits] = useState('')
    const [requirements, setRequirements] = useState([])
    const [alert, setAlert] = useState(null)

    // Calculate requirements preview when recipe or units change
    useEffect(() => {
        const calculateRequirements = async () => {
            if (selectedRecipe && units && parseInt(units) > 0) {
                const fullRecipe = await getRecipeDetail(selectedRecipe.id)
                if (fullRecipe) {
                    const reqs = fullRecipe.ingredientes.map(ing => ({
                        nombre: ing.nombre,
                        requerido: ing.gramos * parseInt(units),
                        // Note: Current stock isn't in fullRecipe (it just has names/amounts for recipe). 
                        // To show stock status here perfectly we might need to fetch ingredients stock separately 
                        // or rely on the hook's validation.
                        // For this UI, we'll just show what is needed.
                    }))
                    setRequirements(reqs)
                }
            } else {
                setRequirements([])
            }
        }
        calculateRequirements()
    }, [selectedRecipe, units])

    const handleProduction = async () => {
        if (!selectedRecipe || !units || parseInt(units) <= 0) {
            setAlert({ type: 'error', message: 'Selecciona una receta y una cantidad válida' })
            return
        }

        if (!confirm(`¿Confirmar producción de ${units} unidades de ${selectedRecipe.nombre}?\n\nSe descontarán los ingredientes del inventario.`)) {
            return
        }

        const result = await produceBatch(selectedRecipe.id, parseInt(units))

        if (result.success) {
            setAlert({ type: 'success', message: result.message })
            setUnits('')
            setSelectedRecipe(null)
            setRequirements([])
            // Ideally we should refresh inventory context if it exists, roughly handled by page navigation or future refreshes
        } else {
            setAlert({ type: 'error', message: result.error })
        }
    }

    if (recipesLoading) return <Loading message="Cargando panel de producción..." />

    return (
        <div className="space-y-6 animate-fade-in">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-2xl font-bold text-neumorphic-primary font-serif mb-6">🏭 Nueva Orden de Producción</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Control Panel */}
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                1. Seleccionar Receta
                            </label>
                            <SearchableCombobox
                                items={recipes}
                                value={selectedRecipe}
                                onChange={setSelectedRecipe}
                                placeholder="Buscar receta a producir..."
                                displayValue={(item) => item?.nombre || ''}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                2. Cantidad a Producir (Unidades)
                            </label>
                            <input
                                type="number"
                                min="1"
                                className="neumorphic-input w-full"
                                placeholder="Ej: 50"
                                value={units}
                                onChange={(e) => setUnits(e.target.value)}
                            />
                        </div>

                        <div className="pt-4">
                            <Button
                                onClick={handleProduction}
                                variant="primary"
                                className="w-full py-3 text-lg"
                                disabled={productionLoading || !selectedRecipe}
                            >
                                {productionLoading ? 'Procesando...' : '🚀 Confirmar Producción'}
                            </Button>
                        </div>
                    </div>

                    {/* Preview Panel */}
                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                            📋 Requerimientos de Material
                        </h3>

                        {requirements.length > 0 ? (
                            <div className="space-y-3">
                                <div className="text-sm text-gray-500 mb-2">
                                    Para producir <strong>{units} unidades</strong> de <strong>{selectedRecipe.nombre}</strong> necesitas:
                                </div>
                                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    {requirements.map((req, idx) => (
                                        <div key={idx} className="flex justify-between items-center bg-white p-3 rounded shadow-sm">
                                            <span className="font-medium text-gray-700">{req.nombre}</span>
                                            <span className="font-bold text-neumorphic-primary">{formatearGramos(req.requerido)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center p-8">
                                <span className="text-4xl mb-2">🧪</span>
                                <p>Selecciona una receta y cantidad para ver los materiales necesarios</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
