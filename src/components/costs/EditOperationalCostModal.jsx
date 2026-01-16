import { useState, useEffect } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { esTextoValido, esNumeroPositivo } from '../../lib/utils'

export const EditOperationalCostModal = ({ isOpen, onClose, cost, onSuccess }) => {
    const [nombre, setNombre] = useState('')
    const [precio, setPrecio] = useState('')
    const [error, setError] = useState(null)

    useEffect(() => {
        if (cost) {
            setNombre(cost.nombre)
            setPrecio(cost.precio.toString())
        }
    }, [cost])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError(null)

        if (!esTextoValido(nombre) || !esNumeroPositivo(precio)) {
            setError('Por favor completa todos los campos correctamente')
            return
        }

        onSuccess(nombre.trim(), precio)
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <div className="p-6">
                <h2 className="text-2xl font-bold text-neumorphic-text mb-6">Editar Gasto Operativo</h2>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
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

                    <div className="flex gap-3 justify-end">
                        <Button type="button" onClick={onClose} variant="secondary">
                            Cancelar
                        </Button>
                        <Button type="submit" variant="success">
                            Guardar Cambios
                        </Button>
                    </div>
                </form>
            </div>
        </Modal>
    )
}
