import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRecipes } from '../../hooks/useRecipes'
import { formatearMoneda } from '../../lib/utils'
import { Loading } from '../ui/Loading'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { KebabMenu } from '../ui/KebabMenu'
import { CreateRecipeModal } from './CreateRecipeModal'
import { RecipeDetailModal } from './RecipeDetailModal'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'

export const RecipeList = () => {
    const { recipes, loading, error, deleteRecipe, getRecipeDetail } = useRecipes()
    const [searchTerm, setSearchTerm] = useState('')
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [selectedRecipeId, setSelectedRecipeId] = useState(null)
    const [showDetailModal, setShowDetailModal] = useState(false)
    const [recipeToEdit, setRecipeToEdit] = useState(null)
    const [alert, setAlert] = useState(null)

    const filteredRecipes = recipes.filter((recipe) =>
        recipe.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Keyboard Navigation
    const handleKeyboardSelect = (recipe) => {
        setSelectedRecipeId(recipe.id)
        setShowDetailModal(true)
    }

    const { selectedIndex } = useKeyboardNavigation(
        filteredRecipes,
        handleKeyboardSelect,
        (recipe) => {
            setSelectedRecipeId(recipe.id)
            setShowDetailModal(true)
        },
        !showCreateModal && !showDetailModal
    )

    const handleEdit = async (recipe) => {
        const fullRecipe = await getRecipeDetail(recipe.id)
        if (fullRecipe) {
            setRecipeToEdit(fullRecipe)
            setShowCreateModal(true)
        } else {
            setAlert({ type: 'error', message: 'Error al cargar los detalles de la receta' })
        }
    }

    const handleDelete = async (recipe) => {
        if (!confirm(`¿Estás seguro de eliminar la receta '${recipe.nombre}'?\n\nEsta acción no se puede deshacer.`)) {
            return
        }

        const result = await deleteRecipe(recipe.id)
        if (result.success) {
            setAlert({ type: 'success', message: result.mensaje })
            setTimeout(() => setAlert(null), 3000)
        } else {
            setAlert({ type: 'error', message: result.error })
        }
    }

    const getKebabMenuItems = (recipe) => [
        {
            label: 'Ver Detalles',
            icon: '📋',
            onClick: () => {
                setSelectedRecipeId(recipe.id)
                setShowDetailModal(true)
            }
        },
        {
            label: 'Editar',
            icon: '✏️',
            onClick: () => handleEdit(recipe)
        },
        {
            label: 'Eliminar',
            icon: '🗑️',
            onClick: () => handleDelete(recipe),
            danger: true
        }
    ]

    if (loading) return <Loading message="Cargando recetas..." />

    return (
        <div className="space-y-6">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            {/* Header */}
            <div className="flex justify-between items-center">
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="🔍 Buscar receta..."
                        className="neumorphic-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => {
                    setRecipeToEdit(null)
                    setShowCreateModal(true)
                }} variant="primary">
                    ➕ Nueva Receta
                </Button>
            </div>

            {/* Recipe Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-500">
                        {searchTerm ? 'No se encontraron recetas' : 'No hay recetas registradas. ¡Crea tu primera receta!'}
                    </div>
                ) : (
                    filteredRecipes.map((recipe, index) => (
                        <motion.div
                            key={recipe.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`neumorphic-card cursor-pointer group hover:ring-2 hover:ring-neumorphic-primary/20 ${index === selectedIndex ? 'ring-2 ring-neumorphic-primary bg-gray-50/50' : ''}`}
                            onClick={() => {
                                setSelectedRecipeId(recipe.id)
                                setShowDetailModal(true)
                            }}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-xl font-bold text-neumorphic-primary font-serif">{recipe.nombre}</h3>
                                <div onClick={(e) => e.stopPropagation()}>
                                    <KebabMenu items={getKebabMenuItems(recipe)} />
                                </div>
                            </div>

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">💰 Precio Venta:</span>
                                    <span className="font-semibold">{formatearMoneda(recipe.precio_venta)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">⚖️ Gramaje:</span>
                                    <span className="font-semibold">{recipe.gramaje}g</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">📈 Margen:</span>
                                    <span className="font-semibold">{recipe.margen}%</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">💵 Costo:</span>
                                    <span className="font-semibold text-neumorphic-accent">{formatearMoneda(recipe.costo_total)}</span>
                                </div>
                            </div>

                            {recipe.notas && (
                                <div className="mt-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                                    <p className="text-sm text-gray-700">📝 {recipe.notas}</p>
                                </div>
                            )}
                        </motion.div>
                    ))
                )}
            </div>

            {/* Modals */}
            <CreateRecipeModal
                isOpen={showCreateModal}
                onClose={() => {
                    setShowCreateModal(false)
                    setRecipeToEdit(null)
                }}
                recipeToEdit={recipeToEdit}
                onSuccess={(message) => {
                    setShowCreateModal(false)
                    setRecipeToEdit(null)
                    setAlert({ type: 'success', message: message || '✅ Receta guardada correctamente' })
                    setTimeout(() => setAlert(null), 3000)
                }}
            />

            {selectedRecipeId && (
                <RecipeDetailModal
                    isOpen={showDetailModal}
                    onClose={() => {
                        setShowDetailModal(false)
                        setSelectedRecipeId(null)
                    }}
                    recipeId={selectedRecipeId}
                />
            )}
        </div>
    )
}
