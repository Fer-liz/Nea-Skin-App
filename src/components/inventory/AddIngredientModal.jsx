import { useState } from 'react'
import { useIngredients } from '../../hooks/useIngredients'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { esTextoValido, esNumeroPositivo } from '../../lib/utils'

export const AddIngredientModal = ({ isOpen, onClose, onSuccess }) => {
    const { addIngredient } = useIngredients()
    const [nombre, setNombre] = useState('')
    const [cantidad, setCantidad] = useState('')
    const [costo, setCosto] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!esTextoValido(nombre) || !esNumeroPositivo(cantidad) || !esNumeroPositivo(costo)) {
            setError('Por favor completa todos los campos correctamente')
            return
        }

        const result = await addIngredient(nombre.trim(), cantidad, costo)

        if (result.success) {
            setNombre('')
            setCantidad('')
            setCosto('')
            onSuccess(result.data)
        } else {
            setError(result.error)
        }
    }

    const handleClose = () => {
        setNombre('')
        setCantidad('')
        setCosto('')
        setError('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="➕ Nuevo Ingrediente">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="alert alert-error">{error}</div>}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del ingrediente:
                    </label>
                    <input
                        type="text"
                        className="neumorphic-input"
                        placeholder="Ej: Aceite de coco"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Cantidad (gramos):
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        className="neumorphic-input"
                        placeholder="Ej: 500"
                        value={cantidad}
                        onChange={(e) => setCantidad(e.target.value)}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Costo total ($):
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        className="neumorphic-input"
                        placeholder="Ej: 150.00"
                        value={costo}
                        onChange={(e) => setCosto(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="submit" variant="primary" className="flex-1">
                        Guardar
                    </Button>
                    <Button type="button" variant="danger" onClick={handleClose} className="flex-1">
                        Cancelar
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
