import { useState, useEffect } from 'react'

/**
 * Hook personalizado para manejar la navegación por teclado en listas
 * @param {Array} items - Lista de items a navegar
 * @param {Function} onSelect - Función a ejecutar al presionar Enter sobre un item
 * @param {boolean} isActive - Si el componente está activo para recibir eventos
 * @returns {Object} { selectedIndex, setSelectedIndex }
 */
export const useKeyboardNavigation = (items, onSelect, onRight = null, isActive = true) => {
    const [selectedIndex, setSelectedIndex] = useState(-1)

    useEffect(() => {
        // Reset selection when items change
        setSelectedIndex(-1)
    }, [items?.length])

    useEffect(() => {
        if (!isActive) return

        const handleKeyDown = (e) => {
            switch (e.key) {
                case 'ArrowDown':
                    e.preventDefault()
                    setSelectedIndex(prev =>
                        prev < items.length - 1 ? prev + 1 : prev
                    )
                    break
                case 'ArrowUp':
                    e.preventDefault()
                    setSelectedIndex(prev =>
                        prev > 0 ? prev - 1 : prev
                    )
                    break
                case 'ArrowRight':
                    e.preventDefault()
                    if (onRight && selectedIndex >= 0) {
                        onRight(items[selectedIndex])
                    }
                    break
                case 'ArrowLeft':
                    e.preventDefault()
                    // Optional: Collapse or go back
                    break
                case 'Enter':
                    if (selectedIndex >= 0 && selectedIndex < items.length) {
                        e.preventDefault()
                        onSelect(items[selectedIndex])
                    }
                    break
                default:
                    break
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [items, selectedIndex, onSelect, isActive])

    return { selectedIndex, setSelectedIndex }
}
