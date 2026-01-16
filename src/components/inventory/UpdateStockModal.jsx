import { useState } from 'react'
import { useIngredients } from '../../hooks/useIngredients'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { formatearGramos, esNumeroPositivo } from '../../lib/utils'

export const UpdateStockModal = ({ isOpen, onClose, ingredient, onSuccess }) => {
    const { updateStock } = useIngredients()
    const [cantidadAgregar, setCantidadAgregar] = useState('')
    const [costoAgregar, setCostoAgregar] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!esNumeroPositivo(cantidadAgregar) || !esNumeroPositivo(costoAgregar)) {
            setError('Por favor completa todos los campos correctamente')
            return
        }

        const result = await updateStock(ingredient.id, cantidadAgregar, costoAgregar)

        if (result.success) {
            setCantidadAgregar('')
            setCostoAgregar('')
            onSuccess()
        } else {
            setError(result.error)
        }
    }

    const handleClose = () => {
        setCantidadAgregar('')
        setCostoAgregar('')
        setError('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title={`📦 Actualizar Stock - ${ingredient?.nombre}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="alert alert-info">
                    <div>
                        <strong>Stock actual:</strong> {formatearGramos(ingredient?.stock)}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad a AGREGAR (gramos):
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        className="neumorphic-input"
                        placeholder="Ej: 200"
                        value={cantidadAgregar}
                        onChange={(e) => setCantidadAgregar(e.target.value)}
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo de esta cantidad ($):
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        className="neumorphic-input"
                        placeholder="Ej: 80.00"
                        value={costoAgregar}
                        onChange={(e) => setCostoAgregar(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" variant="success" className="flex-1">
                        Actualizar
                    </Button>
                    <Button type="button" variant="danger" onClick={handleClose} className="flex-1">
                        Cancelar
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
