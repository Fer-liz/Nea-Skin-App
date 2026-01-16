import { useState } from 'react'
import { motion } from 'framer-motion'
import { useIngredients } from '../../hooks/useIngredients'
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation'
import { formatearMoneda, formatearGramos, formatearPorcentaje, formatearPrecioUnitario } from '../../lib/utils'
import { KebabMenu } from '../ui/KebabMenu'
import { Loading } from '../ui/Loading'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { AddIngredientModal } from './AddIngredientModal'
import { EditIngredientModal } from './EditIngredientModal'
import { UpdateStockModal } from './UpdateStockModal'
import { EditNameModal } from './EditNameModal'

export const InventoryTable = () => {
    const { ingredients, loading, error, deleteIngredient, refresh } = useIngredients()
    const [searchTerm, setSearchTerm] = useState('')
    const [selectedIngredient, setSelectedIngredient] = useState(null)
    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showStockModal, setShowStockModal] = useState(false)
    const [showNameModal, setShowNameModal] = useState(false)
    const [alert, setAlert] = useState(null)

    // Filter ingredients based on search term (already sorted alphabetically from hook)
    const filteredIngredients = ingredients.filter((ing) =>
        ing.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    )

    // Keyboard Navigation
    const handleKeyboardSelect = (ingredient) => {
        setSelectedIngredient(ingredient)
        setShowEditModal(true)
    }

    const { selectedIndex } = useKeyboardNavigation(
        filteredIngredients,
        handleKeyboardSelect,
        (item) => handleKeyboardSelect(item), // Right arrow triggers select/edit for now
        !showAddModal && !showEditModal && !showStockModal && !showNameModal
    )

    const handleDelete = async (ingredient) => {
        if (!confirm(`¿Estás seguro de eliminar '${ingredient.nombre}' ?\n\nEsta acción no se puede deshacer.`)) {
            return
        }

        const result = await deleteIngredient(ingredient.id)
        if (result.success) {
            setAlert({ type: 'success', message: result.mensaje })
            setTimeout(() => setAlert(null), 3000)
        } else {
            setAlert({ type: 'error', message: result.error })
        }
    }

    const getKebabMenuItems = (ingredient) => [
        {
            label: 'Editar Nombre',
            icon: '✏️',
            onClick: () => {
                setSelectedIngredient(ingredient)
                setShowNameModal(true)
            }
        },
        {
            label: 'Actualizar Stock',
            icon: '📦',
            onClick: () => {
                setSelectedIngredient(ingredient)
                setShowStockModal(true)
            }
        },
        {
            label: 'Editar Detalles',
            icon: '🔄',
            onClick: () => {
                setSelectedIngredient(ingredient)
                setShowEditModal(true)
            }
        },
        {
            label: 'Eliminar',
            icon: '🗑️',
            onClick: () => handleDelete(ingredient),
            danger: true
        }
    ]

    if (loading) return <Loading message="Cargando inventario..." />

    return (
        <div className="space-y-6">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            {/* Header with Search and Add Button */}
            <div className="flex justify-between items-center">
                <div className="flex-1 max-w-md">
                    <input
                        type="text"
                        placeholder="🔍 Buscar ingrediente..."
                        className="neumorphic-input"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <Button onClick={() => setShowAddModal(true)} variant="primary">
                    ➕ Nuevo Ingrediente
                </Button>
            </div>

            {/* Inventory Table */}
            <div className="neumorphic-table">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Nombre</th>
                            <th>Stock</th>
                            <th>Costo Unitario</th>
                            <th>Costo Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredIngredients.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-gray-500">
                                    {searchTerm ? 'No se encontraron ingredientes' : 'No hay ingredientes registrados'}
                                </td>
                            </tr>
                        ) : (
                            filteredIngredients.map((ingredient, index) => (
                                <motion.tr
                                    key={ingredient.id}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                    className="hover:bg-gray-50 transition-colors"
                                >
                                    <td className="text-center text-gray-500">{index + 1}</td>
                                    <td className="font-medium">{ingredient.nombre}</td>
                                    <td className="text-right">{formatearGramos(ingredient.stock)}</td>
                                    <td className="text-right">{formatearPrecioUnitario(ingredient.costo_unitario)}/g</td>
                                    <td className="text-right font-semibold text-neumorphic-primary">
                                        {formatearMoneda(ingredient.costo_total)}
                                    </td>
                                    <td>
                                        <KebabMenu items={getKebabMenuItems(ingredient)} />
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modals */}
            <AddIngredientModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={() => {
                    setShowAddModal(false)
                    setAlert({ type: 'success', message: '✅ Ingrediente agregado correctamente' })
                    setTimeout(() => setAlert(null), 3000)
                }}
            />

            {selectedIngredient && (
                <>
                    <EditNameModal
                        isOpen={showNameModal}
                        onClose={() => {
                            setShowNameModal(false)
                            setSelectedIngredient(null)
                        }}
                        ingredient={selectedIngredient}
                        onSuccess={() => {
                            setShowNameModal(false)
                            setSelectedIngredient(null)
                            setAlert({ type: 'success', message: '✅ Nombre actualizado correctamente' })
                            setTimeout(() => setAlert(null), 3000)
                        }}
                    />

                    <EditIngredientModal
                        isOpen={showEditModal}
                        onClose={() => {
                            setShowEditModal(false)
                            setSelectedIngredient(null)
                        }}
                        ingredient={selectedIngredient}
                        onSuccess={() => {
                            setShowEditModal(false)
                            setSelectedIngredient(null)
                            setAlert({ type: 'success', message: '✅ Ingrediente actualizado correctamente' })
                            setTimeout(() => setAlert(null), 3000)
                        }}
                    />

                    <UpdateStockModal
                        isOpen={showStockModal}
                        onClose={() => {
                            setShowStockModal(false)
                            setSelectedIngredient(null)
                        }}
                        ingredient={selectedIngredient}
                        onSuccess={() => {
                            setShowStockModal(false)
                            setSelectedIngredient(null)
                            setAlert({ type: 'success', message: '✅ Stock actualizado correctamente' })
                            setTimeout(() => setAlert(null), 3000)
                        }}
                    />
                </>
            )}
        </div>
    )
}
