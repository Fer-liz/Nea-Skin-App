import { useState, useEffect } from 'react'
import { useRecipes } from '../../hooks/useRecipes'
import { useIngredients } from '../../hooks/useIngredients'
import { useOperationalCosts } from '../../hooks/useOperationalCosts'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { SearchableCombobox } from '../ui/Combobox'
import { esTextoValido, esNumeroPositivo, formatearMoneda } from '../../lib/utils'
import { AddIngredientModal } from '../inventory/AddIngredientModal'
import { AddOperationalCostModal } from '../costs/AddOperationalCostModal'

export const CreateRecipeModal = ({ isOpen, onClose, onSuccess, recipeToEdit = null }) => {
    const { createRecipe, updateRecipe } = useRecipes()
    const { ingredients } = useIngredients()
    const { costs } = useOperationalCosts()

    const [nombre, setNombre] = useState('')
    const [gramaje, setGramaje] = useState('')
    const [margen, setMargen] = useState('50')
    const [notas, setNotas] = useState('')
    const [ingredientesReceta, setIngredientesReceta] = useState([])
    const [gastosReceta, setGastosReceta] = useState([])
    const [error, setError] = useState('')

    // Populate form when editing
    useEffect(() => {
        if (recipeToEdit && isOpen) {
            setNombre(recipeToEdit.nombre)
            setGramaje(recipeToEdit.gramaje)
            setMargen(recipeToEdit.margen)
            setNotas(recipeToEdit.notas || '')
            setItemsWithCosts(recipeToEdit.ingredientes || [])
            setGastosReceta(recipeToEdit.extras || [])
        } else if (isOpen && !recipeToEdit) {
            resetForm()
        }
    }, [recipeToEdit, isOpen])

    // Helper to attach unit costs to existing ingredients when editing
    const setItemsWithCosts = (savedIngredients) => {
        // We try to find the current unit cost from the 'ingredients' list
        // If not found, we calculate it from the saved record (costo / gramos)
        const processed = savedIngredients.map(ing => {
            const masterIng = ingredients.find(i => i.id === ing.ingrediente_id)
            // Default to percentage-based scaling (isFixed: false) for existing recipes
            return {
                ...ing,
                isFixed: false,
                costo_unitario: masterIng ? masterIng.costo_unitario : (ing.gramos > 0 ? ing.costo / ing.gramos : 0)
            }
        })
        setIngredientesReceta(processed)
    }

    // Add ingredient modal state
    const [showIngredientModal, setShowIngredientModal] = useState(false)
    const [showNewIngredientModal, setShowNewIngredientModal] = useState(false)
    const [showNewCostModal, setShowNewCostModal] = useState(false)
    const [selectedIngredient, setSelectedIngredient] = useState(null)
    const [metodo, setMetodo] = useState('porcentaje')
    const [cantidad, setCantidad] = useState('')

    const porcentajeTotal = ingredientesReceta.reduce((sum, ing) => sum + parseFloat(ing.porcentaje), 0)

    const handleAddIngredient = () => {
        if (!esNumeroPositivo(gramaje)) {
            alert('Por favor ingresa un gramaje válido primero')
            return
        }

        if (porcentajeTotal >= 100) {
            alert('La receta ya está al 100%')
            return
        }

        setShowIngredientModal(true)
    }

    const handleConfirmIngredient = () => {
        if (!selectedIngredient) {
            alert('Selecciona un ingrediente')
            return
        }

        let porcentaje = 0
        const gramajeNum = parseFloat(gramaje)

        if (metodo === 'rellenar') {
            porcentaje = 100 - porcentajeTotal
        } else if (metodo === 'porcentaje') {
            porcentaje = parseFloat(cantidad)
        } else {
            // gramos
            const gramos = parseFloat(cantidad)
            porcentaje = (gramos / gramajeNum) * 100
        }

        if (porcentajeTotal + porcentaje > 100.01) {
            alert(`Excede el 100%. Disponible: ${(100 - porcentajeTotal).toFixed(2)}%`)
            return
        }

        const gramos = (porcentaje / 100) * gramajeNum
        const costo = gramos * selectedIngredient.costo_unitario

        setIngredientesReceta([
            ...ingredientesReceta,
            {
                ingrediente_id: selectedIngredient.id,
                nombre: selectedIngredient.nombre,
                part_is_fixed: metodo === 'gramos', // Store if fixed weight
                costo_unitario: selectedIngredient.costo_unitario,
                porcentaje,
                gramos,
                costo
            }
        ])

        setShowIngredientModal(false)
        setSelectedIngredient(null)
        setCantidad('')
    }

    const handleRemoveIngredient = (index) => {
        setIngredientesReceta(ingredientesReceta.filter((_, i) => i !== index))
    }

    const handleAddGasto = (gasto) => {
        if (gastosReceta.find((g) => g.gasto_id === gasto.id)) {
            alert('Este gasto ya fue agregado')
            return
        }

        setGastosReceta([
            ...gastosReceta,
            {
                gasto_id: gasto.id,
                nombre: gasto.nombre,
                costo: gasto.precio
            }
        ])
    }

    const handleRemoveGasto = (index) => {
        setGastosReceta(gastosReceta.filter((_, i) => i !== index))
    }

    // SCALING LOGIC
    const handleGramajeChange = (e) => {
        const newGramajeStr = e.target.value
        setGramaje(newGramajeStr)

        const newTotal = parseFloat(newGramajeStr)
        if (!newTotal || newTotal <= 0) return

        // Recalculate ingredients based on the new total
        // RULE: All ingredients scale their weight to maintain the same percentage
        const newIngredients = ingredientesReceta.map(ing => {
            // We use the stored percentage to calculate new grams
            // This ensures strictly proportional scaling for everything
            const newGramos = (ing.porcentaje / 100) * newTotal
            const newCosto = newGramos * (ing.costo_unitario || 0)

            return {
                ...ing,
                gramos: newGramos,
                costo: newCosto
                // isFixed property is ignored/irrelevant now for scaling behavior
            }
        })

        setIngredientesReceta(newIngredients)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!esTextoValido(nombre) || !esNumeroPositivo(gramaje) || !esNumeroPositivo(margen)) {
            setError('Por favor completa todos los campos obligatorios')
            return
        }

        if (ingredientesReceta.length === 0) {
            setError('Agrega al menos un ingrediente')
            return
        }

        // Removed strict 100% check allow saving drafts
        // if (Math.abs(porcentajeTotal - 100) > 0.1) {
        //     setError(`El porcentaje total debe ser 100% (actual: ${porcentajeTotal.toFixed(2)}%)`)
        //     return
        // }

        let result
        if (recipeToEdit) {
            result = await updateRecipe(
                recipeToEdit.id,
                nombre.trim(),
                gramaje,
                margen,
                ingredientesReceta,
                gastosReceta,
                notas.trim()
            )
        } else {
            result = await createRecipe(
                nombre.trim(),
                gramaje,
                margen,
                ingredientesReceta,
                gastosReceta,
                notas.trim()
            )
        }

        if (result.success) {
            resetForm()
            onSuccess(result.mensaje)
        } else {
            setError(result.error)
        }
    }

    const resetForm = () => {
        setNombre('')
        setGramaje('')
        setMargen('50')
        setNotas('')
        setIngredientesReceta([])
        setGastosReceta([])
        setError('')
    }

    const handleClose = () => {
        resetForm()
        onClose()
    }

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} title={recipeToEdit ? "✏️ Editar Receta" : "🧪 Crear Nueva Receta"} wide={true}>
                <form onSubmit={handleSubmit} className="flex flex-col h-full max-h-full overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                        {error && <div className="alert alert-error py-2 mb-2">{error}</div>}

                        {/* Compact Grid: Basic Info + Notes */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            {/* Left Col: Inputs */}
                            <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Nombre:</label>
                                    <input
                                        type="text"
                                        className="neumorphic-input py-1 px-2 text-sm"
                                        placeholder="Ej: Crema Facial"
                                        value={nombre}
                                        onChange={(e) => setNombre(e.target.value)}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Gramaje (g):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="neumorphic-input py-1 px-2 text-sm"
                                        placeholder="100"
                                        value={gramaje}
                                        onChange={handleGramajeChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">Margen (%):</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        className="neumorphic-input py-1 px-2 text-sm"
                                        placeholder="50"
                                        value={margen}
                                        onChange={(e) => setMargen(e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Right Col: Notes */}
                            <div className="md:col-span-1">
                                <label className="block text-xs font-medium text-gray-700 mb-1">Notas:</label>
                                <textarea
                                    className="neumorphic-input w-full h-[84px] py-1 px-2 text-sm resize-none"
                                    placeholder="Comentarios..."
                                    value={notas}
                                    onChange={(e) => setNotas(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Ingredients Section */}
                        <div className="flex-1 flex flex-col min-h-0">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-semibold text-sm">Ingredientes:</h4>
                                <span className={`text-xs font-bold ${porcentajeTotal > 100 ? 'text-red-600' : 'text-neumorphic-accent'}`}>
                                    {porcentajeTotal.toFixed(1)}% / 100%
                                </span>
                            </div>

                            {/* Progress Bar */}
                            <div className="progress-bar mb-2 h-2">
                                <div
                                    className="progress-fill"
                                    style={{ width: `${Math.min(porcentajeTotal, 100)}%` }}
                                >
                                    {porcentajeTotal.toFixed(1)}%
                                </div>
                            </div>

                            {/* Ingredients List */}
                            <div className="space-y-1 mb-2 overflow-y-auto max-h-[150px] pr-1">
                                {ingredientesReceta.length === 0 ? (
                                    <p className="text-center text-gray-400 py-2 text-sm italic">No hay ingredientes</p>
                                ) : (
                                    ingredientesReceta.map((ing, index) => (
                                        <div key={index} className="p-2 bg-white rounded border border-gray-100 flex justify-between items-center text-sm">
                                            <div className="truncate flex-1 mr-2">
                                                <span className="font-medium text-gray-800">{ing.nombre}</span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                    {ing.porcentaje.toFixed(2)}% ({ing.gramos.toFixed(1)}g)
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-600 font-mono text-xs">${ing.costo.toFixed(2)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveIngredient(index)}
                                                    className="text-red-400 hover:text-red-600"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <Button type="button" onClick={handleAddIngredient} variant="primary" className="mt-2">
                                ➕ Agregar Ingrediente
                            </Button>
                        </div>

                        {/* Operational Costs Section */}
                        <div className="pt-2 border-t border-gray-100">
                            <div className="flex justify-between items-center mb-1">
                                <h4 className="font-semibold text-sm text-gray-700">Gastos Operativos:</h4>
                                <Button
                                    type="button"
                                    onClick={() => setShowNewCostModal(true)}
                                    className="px-2 py-0.5 text-xs bg-neumorphic-primary text-white rounded shadow-sm hover:shadow"
                                    title="Crear nuevo gasto"
                                >
                                    + Crear Nuevo
                                </Button>
                            </div>

                            <div className="space-y-1 mb-2 max-h-[120px] overflow-y-auto pr-1">
                                {gastosReceta.length > 0 && (
                                    gastosReceta.map((gasto, index) => (
                                        <div key={index} className="p-2 bg-white rounded border border-gray-100 flex justify-between items-center text-sm shadow-sm">
                                            <span className="truncate flex-1 mr-2">{gasto.nombre}</span>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-xs text-gray-600">${gasto.costo.toFixed(2)}</span>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveGasto(index)}
                                                    className="text-red-400 hover:text-red-600 p-1"
                                                >
                                                    ×
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="max-h-[80px] overflow-y-auto pr-1">
                                <div className="flex gap-2 flex-wrap">
                                    {costs.map((cost) => (
                                        <button
                                            key={cost.id}
                                            type="button"
                                            onClick={() => handleAddGasto(cost)}
                                            className="px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg text-xs transition-colors border border-gray-200"
                                            disabled={gastosReceta.find((g) => g.gasto_id === cost.id)}
                                        >
                                            {cost.nombre} (${cost.precio})
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Fixed Footer with Integrated Summary */}
                    <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 p-4">
                        {/* Summary Bar */}
                        <div className="flex justify-between items-end mb-3 px-1 text-sm">
                            <div className="space-x-4 text-gray-600">
                                <span>Mat: <b>{formatearMoneda(ingredientesReceta.reduce((s, i) => s + i.costo, 0))}</b></span>
                                <span>Ext: <b>{formatearMoneda(gastosReceta.reduce((s, g) => s + g.costo, 0))}</b></span>
                            </div>
                            <div className="flex items-end gap-4">
                                <div className="text-right">
                                    <span className="block text-xs text-gray-500">Costo Total</span>
                                    <span className="font-bold text-neumorphic-primary text-base">
                                        {formatearMoneda(
                                            ingredientesReceta.reduce((s, i) => s + i.costo, 0) +
                                            gastosReceta.reduce((s, g) => s + g.costo, 0)
                                        )}
                                    </span>
                                </div>
                                <div className="text-right pl-4 border-l border-gray-300">
                                    <span className="block text-xs text-gray-500">Sugerido ({margen}%)</span>
                                    <span className="font-bold text-neumorphic-secondary text-lg leading-none">
                                        {formatearMoneda(
                                            (ingredientesReceta.reduce((s, i) => s + i.costo, 0) +
                                                gastosReceta.reduce((s, g) => s + g.costo, 0)) * (1 + (parseFloat(margen) || 0) / 100)
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-3">
                            <Button type="submit" variant="success" className="flex-[2] py-2 text-base shadow-md">
                                {recipeToEdit ? 'Actualizar' : 'Guardar Receta'}
                            </Button>
                            <Button type="button" variant="danger" onClick={handleClose} className="flex-1 py-2 text-base shadow-sm">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </form>
            </Modal>

            {/* Add Ingredient Sub-Modal */}
            {/* Add Ingredient Sub-Modal */}
            <Modal
                isOpen={showIngredientModal}
                onClose={() => {
                    setShowIngredientModal(false)
                    setSelectedIngredient(null)
                    setCantidad('')
                }}
                title="➕ Agregar Ingrediente"
            >
                <div className="space-y-4 p-6 overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ingrediente:
                        </label>
                        <div className="flex gap-2">
                            <div className="flex-1">
                                <SearchableCombobox
                                    items={ingredients}
                                    value={selectedIngredient}
                                    onChange={setSelectedIngredient}
                                    placeholder="Buscar ingrediente..."
                                    displayValue={(item) => item?.nombre || ''}
                                />
                            </div>
                            <Button
                                type="button"
                                onClick={() => setShowNewIngredientModal(true)}
                                className="px-3 bg-neumorphic-primary text-white rounded-lg"
                                title="Crear nuevo ingrediente"
                            >
                                +
                            </Button>
                        </div>
                    </div>

                    {selectedIngredient && (
                        <div className="alert alert-info text-sm">
                            Stock: {selectedIngredient.stock}g | Costo: ${selectedIngredient.costo_unitario.toFixed(2)}/g
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Método de entrada:
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="metodo"
                                    value="porcentaje"
                                    checked={metodo === 'porcentaje'}
                                    onChange={(e) => setMetodo(e.target.value)}
                                    className="mr-2"
                                />
                                Porcentaje
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="metodo"
                                    value="gramos"
                                    checked={metodo === 'gramos'}
                                    onChange={(e) => setMetodo(e.target.value)}
                                    className="mr-2"
                                />
                                Gramos
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="metodo"
                                    value="rellenar"
                                    checked={metodo === 'rellenar'}
                                    onChange={(e) => setMetodo(e.target.value)}
                                    className="mr-2"
                                />
                                Rellenar hasta 100%
                            </label>
                        </div>
                    </div>

                    {metodo !== 'rellenar' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Cantidad ({metodo === 'porcentaje' ? '%' : 'g'}):
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                className="neumorphic-input"
                                placeholder={metodo === 'porcentaje' ? 'Ej: 25' : 'Ej: 25'}
                                value={cantidad}
                                onChange={(e) => setCantidad(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleConfirmIngredient} variant="success" className="flex-1">
                            Agregar
                        </Button>
                        <Button
                            onClick={() => {
                                setShowIngredientModal(false)
                                setSelectedIngredient(null)
                                setCantidad('')
                            }}
                            variant="danger"
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                    </div>
                </div>
            </Modal>

            {/* Quick Create Ingredient Modal */}
            <AddIngredientModal
                isOpen={showNewIngredientModal}
                onClose={() => setShowNewIngredientModal(false)}
                onSuccess={(newIngredient) => {
                    setShowNewIngredientModal(false)
                    if (newIngredient) {
                        setSelectedIngredient(newIngredient)
                    }
                }}
            />

            {/* Quick Create Operational Cost Modal */}
            <AddOperationalCostModal
                isOpen={showNewCostModal}
                onClose={() => setShowNewCostModal(false)}
                onSuccess={(newCost) => {
                    if (newCost) {
                        handleAddGasto(newCost)
                    }
                    setShowNewCostModal(false)
                }}
            />
        </>
    )
}
