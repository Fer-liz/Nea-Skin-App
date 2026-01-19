import { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { useOperationalCosts } from '../../hooks/useOperationalCosts'
import { esTextoValido, esNumeroPositivo } from '../../lib/utils'

export const AddOperationalCostModal = ({ isOpen, onClose, onSuccess }) => {
    const { addCost } = useOperationalCosts()
    const [nombre, setNombre] = useState('')
    const [precio, setPrecio] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')

        if (!esTextoValido(nombre) || !esNumeroPositivo(precio)) {
            setError('Por favor completa todos los campos correctamente')
            return
        }

        setLoading(true)
        const result = await addCost(nombre.trim(), precio)
        setLoading(false)

        if (result.success) {
            setNombre('')
            setPrecio('')
            if (onSuccess) onSuccess(result.data ? result.data[0] : null)
            onClose()
        } else {
            setError(result.error)
        }
    }

    const handleClose = () => {
        setNombre('')
        setPrecio('')
        setError('')
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={handleClose} title="➕ Nuevo Gasto Operativo">
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {error && <div className="alert alert-error py-2 text-sm">{error}</div>}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nombre:</label>
                    <input
                        type="text"
                        className="neumorphic-input"
                        placeholder="Ej: Envase Especial"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        autoFocus
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($):</label>
                    <input
                        type="number"
                        step="0.01"
                        className="neumorphic-input"
                        placeholder="0.00"
                        value={precio}
                        onChange={(e) => setPrecio(e.target.value)}
                    />
                </div>

                <div className="flex gap-3 pt-2">
                    <Button type="submit" variant="success" className="flex-1" disabled={loading}>
                        {loading ? 'Guardando...' : 'Guardar Gasto'}
                    </Button>
                    <Button type="button" variant="danger" onClick={handleClose} className="flex-1">
                        Cancelar
                    </Button>
                </div>
            </form>
        </Modal>
    )
}
