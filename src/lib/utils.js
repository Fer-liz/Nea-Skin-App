// Formatting utilities

export const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(valor || 0)
}

export const formatearPrecioUnitario = (valor) => {
    return new Intl.NumberFormat('es-MX', {
        style: 'currency',
        currency: 'MXN',
        minimumFractionDigits: 2,
        maximumFractionDigits: 4
    }).format(valor || 0)
}

export const formatearGramos = (valor) => {
    return `${parseFloat(valor || 0).toFixed(2)}g`
}

export const formatearPorcentaje = (valor) => {
    return `${parseFloat(valor || 0).toFixed(2)}%`
}

export const esTextoValido = (texto) => {
    return texto && texto.trim().length > 0
}

export const esNumeroPositivo = (numero) => {
    const num = parseFloat(numero)
    return !isNaN(num) && num > 0
}

// Debounce function for search inputs
export const debounce = (func, wait) => {
    let timeout
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout)
            func(...args)
        }
        clearTimeout(timeout)
        timeout = setTimeout(later, wait)
    }
}

// Sort array alphabetically by property
export const sortAlphabetically = (array, property) => {
    return [...array].sort((a, b) => {
        const aValue = a[property]?.toLowerCase() || ''
        const bValue = b[property]?.toLowerCase() || ''
        return aValue.localeCompare(bValue, 'es')
    })
}
