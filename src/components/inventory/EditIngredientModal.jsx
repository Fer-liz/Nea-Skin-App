import { useState, useEffect } from 'react'
import { useIngredients } from '../../hooks/useIngredients'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { formatearMoneda, formatearGramos, esNumeroPositivo } from '../../lib/utils'

export const EditIngredientModal = ({ isOpen, onClose, ingredient, onSuccess }) => {
    const { updateIngredient } = useIngredients()
    const [cantidad, setCantidad] = useState('')
    const [costo, setCosto] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (ingredient) {
            setCantidad(ingredient.stock)
            setCosto(ingredient.costo_total)
        }
    }, [ingredient])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!esNumeroPositivo(cantidad) || !esNumeroPositivo(costo)) {
            setError('Por favor completa todos los campos correctamente')
            return
        }

        const result = await updateIngredient(ingredient.id, cantidad, costo)

        if (result.success) {
            onSuccess()
        } else {
            setError(result.error)
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`🔄 Editar - ${ingredient?.nombre}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="alert alert-info">
                    <div>
                        <strong>Valores actuales:</strong><br />
                        Stock: {formatearGramos(ingredient?.stock)} |
                        Costo: {formatearMoneda(ingredient?.costo_total)} |
                        Unitario: {formatearMoneda(ingredient?.costo_unitario)}/g
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nueva cantidad total (gramos):
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        className="neumorphic-input"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nuevo costo total ($):
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        className="neumorphic-input"
                        value={costo}
                        onChange={(e) => setCosto(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" variant="success" className="flex-1">
                        Guardar Cambios
                    </Button>
                    <Button type="button" variant="danger" onClick={onClose} className="flex-1">
                        Cancelar
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
