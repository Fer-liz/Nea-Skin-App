import { useState, useEffect } from 'react'
import { useRecipes } from '../../hooks/useRecipes'
import { Modal } from '../ui/Modal'
import { Loading } from '../ui/Loading'
import { formatearMoneda, formatearGramos, formatearPorcentaje, formatearPrecioUnitario } from '../../lib/utils'

export const RecipeDetailModal = ({ isOpen, onClose, recipeId }) => {
    const { getRecipeDetail } = useRecipes()
    const [recipe, setRecipe] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (isOpen && recipeId) {
            loadRecipe()
        }
    }, [isOpen, recipeId])

    const loadRecipe = async () => {
        setLoading(true)
        const data = await getRecipeDetail(recipeId)
        setRecipe(data)
        setLoading(false)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`🧪 ${recipe?.nombre || 'Receta'} `} wide={true}>
            {loading ? (
                <Loading message="Cargando detalles..." />
            ) : recipe ? (
                <div className="space-y-6 h-full overflow-y-auto px-1">
                    {/* Recipe Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <span className="text-gray-600">Gramaje:</span>
                                <span className="ml-2 font-semibold">{recipe.gramaje}g</span>
                            </div>
                            <div>
                                <span className="text-gray-600">Margen:</span>
                                <span className="ml-2 font-semibold">{recipe.margen}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    {recipe.notas && (
                        <div className="p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                            <h4 className="font-semibold mb-2">📝 Notas:</h4>
                            <p className="text-gray-700">{recipe.notas}</p>
                        </div>
                    )}

                    {/* Ingredients */}
                    <div>
                        <h4 className="font-semibold text-lg mb-3">Ingredientes:</h4>
                        <div className="space-y-2">
                            {recipe.ingredientes.map((ing, index) => (
                                <div key={index} className="p-3 bg-white rounded-lg shadow-sm">
                                    <div className="flex justify-between items-center">
                                        <span className="font-medium">{ing.nombre}</span>
                                        <span className="text-neumorphic-accent font-semibold">
                                            {formatearMoneda(ing.costo)}
                                        </span>
                                    </div>
                                    <div className="text-sm text-gray-600 mt-1">
                                        {formatearPorcentaje(ing.porcentaje)} ({formatearGramos(ing.gramos)})
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Operational Costs */}
                    {recipe.extras && recipe.extras.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-lg mb-3">Gastos Operativos:</h4>
                            <div className="space-y-2">
                                {recipe.extras.map((extra, index) => (
                                    <div key={index} className="p-3 bg-white rounded-lg shadow-sm flex justify-between">
                                        <span>{extra.nombre}</span>
                                        <span className="font-semibold">{formatearMoneda(extra.costo)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Totals */}
                    <div className="bg-gradient-to-r from-neumorphic-primary to-neumorphic-secondary text-white p-6 rounded-lg">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span>💵 Costo Total:</span>
                                <span className="font-bold">{formatearMoneda(recipe.costo_total)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>💰 Precio Venta:</span>
                                <span className="font-bold">{formatearMoneda(recipe.precio_venta)}</span>
                            </div>
                            <div className="flex justify-between text-sm opacity-90">
                                <span>Costo/g:</span>
                                <span>{formatearPrecioUnitario(recipe.costo_por_gramo)}</span>
                            </div>
                            <div className="flex justify-between text-sm opacity-90">
                                <span>Venta/g:</span>
                                <span>{formatearPrecioUnitario(recipe.precio_venta_por_gramo)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">Receta no encontrada</div>
            )}
        </Modal>
    )
}
