import { useState } from 'react'
import { motion } from 'framer-motion'
import { useOperationalCosts } from '../../hooks/useOperationalCosts'
import { formatearMoneda } from '../../lib/utils'
import { Loading } from '../ui/Loading'
import { Alert } from '../ui/Alert'
import { Button } from '../ui/Button'
import { esTextoValido, esNumeroPositivo } from '../../lib/utils'
import { EditOperationalCostModal } from './EditOperationalCostModal'

export const OperationalCosts = () => {
    const { costs, loading, error, addCost, updateCost, deleteCost } = useOperationalCosts()
    const [showAddForm, setShowAddForm] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [selectedCost, setSelectedCost] = useState(null)
    const [nombre, setNombre] = useState('')
    const [precio, setPrecio] = useState('')
    const [alert, setAlert] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!esTextoValido(nombre) || !esNumeroPositivo(precio)) {
            setAlert({ type: 'error', message: 'Por favor completa todos los campos correctamente' })
            return
        }

        const result = await addCost(nombre.trim(), precio)

        if (result.success) {
            setNombre('')
            setPrecio('')
            setShowAddForm(false)
            setAlert({ type: 'success', message: result.mensaje })
            setTimeout(() => setAlert(null), 3000)
        } else {
            setAlert({ type: 'error', message: result.error })
        }
    }

    const handleDelete = async (cost) => {
        if (!confirm(`¿Estás seguro de eliminar '${cost.nombre}'?`)) {
            return
        }

        const result = await deleteCost(cost.id)

        if (result.success) {
            setAlert({ type: 'success', message: result.mensaje })
            setTimeout(() => setAlert(null), 3000)
        } else {
            setAlert({ type: 'error', message: result.error })
        }
    }

    const handleEdit = (cost) => {
        setSelectedCost(cost)
        setShowEditModal(true)
    }

    const handleEditSubmit = async (nombre, precio) => {
        const result = await updateCost(selectedCost.id, nombre, precio)

        if (result.success) {
            setShowEditModal(false)
            setSelectedCost(null)
            setAlert({ type: 'success', message: result.mensaje })
            setTimeout(() => setAlert(null), 3000)
        } else {
            setAlert({ type: 'error', message: result.error })
        }
    }

    if (loading) return <Loading message="Cargando gastos operativos..." />

    return (
        <div className="space-y-6">
            {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-neumorphic-text">Gastos Operativos</h2>
                <Button onClick={() => setShowAddForm(!showAddForm)} variant="primary">
                    {showAddForm ? '❌ Cancelar' : '➕ Nuevo Gasto'}
                </Button>
            </div>

            {showAddForm && (
                <div className="neumorphic-card">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nombre del gasto:
                                </label>
                                <input
                                    type="text"
                                    className="neumorphic-input"
                                    placeholder="Ej: Envase 50ml"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Precio ($):
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    className="neumorphic-input"
                                    placeholder="Ej: 5.00"
                                    value={precio}
                                    onChange={(e) => setPrecio(e.target.value)}
                                />
                            </div>
                        </div>
                        <Button type="submit" variant="success">
                            Guardar
                        </Button>
                    </form>
                </div>
            )}

            <div className="neumorphic-table">
                <table className="w-full">
                    <thead>
                        <tr>
                            <th className="w-16">#</th>
                            <th className="text-left">Nombre</th>
                            <th className="text-right">Precio</th>
                            <th className="w-24"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {costs.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="text-center py-12 text-gray-500">
                                    No hay gastos operativos registrados
                                </td>
                            </tr>
                        ) : (
                            costs.map((cost, index) => (
                                <motion.tr
                                    key={cost.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <td className="text-center text-gray-500">{index + 1}</td>
                                    <td className="font-medium">{cost.nombre}</td>
                                    <td className="text-right font-semibold text-neumorphic-primary">
                                        {formatearMoneda(cost.precio)}
                                    </td>
                                    <td className="text-center">
                                        <div className="flex gap-2 justify-center">
                                            <button
                                                onClick={() => handleEdit(cost)}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                ✏️ Editar
                                            </button>
                                            <button
                                                onClick={() => handleDelete(cost)}
                                                className="text-red-600 hover:text-red-800 font-medium"
                                            >
                                                🗑️ Eliminar
                                            </button>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <EditOperationalCostModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false)
                    setSelectedCost(null)
                }}
                cost={selectedCost}
                onSuccess={handleEditSubmit}
            />
        </div>
    )
}
