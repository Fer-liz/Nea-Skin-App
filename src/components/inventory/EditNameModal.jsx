import { useState, useEffect } from 'react'
import { useIngredients } from '../../hooks/useIngredients'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { esTextoValido } from '../../lib/utils'

export const EditNameModal = ({ isOpen, onClose, ingredient, onSuccess }) => {
    const { updateIngredientName } = useIngredients()
    const [nombre, setNombre] = useState('')
    const [error, setError] = useState('')

    useEffect(() => {
        if (ingredient) {
            setNombre(ingredient.nombre)
        }
    }, [ingredient])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!esTextoValido(nombre)) {
            setError('El nombre no puede estar vacío')
            return
        }

        if (nombre.trim() === ingredient.nombre) {
            onClose()
            return
        }

        const result = await updateIngredientName(ingredient.id, nombre.trim())

        if (result.success) {
            onSuccess()
        } else {
            // Check if it's a duplicate name error
            if (result.error && (result.error.includes('duplicate key') || result.error.includes('unique constraint'))) {
                setError('Ups, revisa si ya tienes otro ingrediente con ese nombre idéntico ya creado')
            } else {
                setError(result.error)
            }
        }
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="✏️ Editar Nombre">
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <div className="alert alert-error">{error}</div>}

                <div className="alert alert-info">
                    <strong>Nombre actual:</strong> {ingredient?.nombre}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nuevo nombre:
                    </label>
                    <input
                        type="text"
                        className="neumorphic-input"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        autoFocus
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
