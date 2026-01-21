import { createContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const IngredientsContext = createContext()

export const IngredientsProvider = ({ children }) => {
    const [ingredients, setIngredients] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchIngredients = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('ingredientes')
                .select('*')
                .order('nombre', { ascending: true })

            if (error) throw error

            setIngredients(data || [])
            setError(null)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching ingredients:', err)
        } finally {
            setLoading(false)
        }
    }

    const addIngredient = async (nombre, stock, costoTotal) => {
        try {
            const s = parseFloat(stock)
            const costoUnitario = s > 0 ? parseFloat(costoTotal) / s : 0

            const { data, error } = await supabase
                .from('ingredientes')
                .insert([{
                    nombre,
                    stock: parseFloat(stock),
                    costo_unitario: costoUnitario,
                    costo_total: parseFloat(costoTotal)
                }])
                .select()

            if (error) throw error

            await fetchIngredients()
            return { success: true, data: data[0], mensaje: '✅ Ingrediente agregado correctamente' }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const updateIngredient = async (id, stock, costoTotal) => {
        try {
            const s = parseFloat(stock)
            const costoUnitario = s > 0 ? parseFloat(costoTotal) / s : 0

            const { error } = await supabase
                .from('ingredientes')
                .update({
                    stock: parseFloat(stock),
                    costo_unitario: costoUnitario,
                    costo_total: parseFloat(costoTotal)
                })
                .eq('id', id)

            if (error) throw error

            await fetchIngredients()
            return { success: true, mensaje: '✅ Ingrediente actualizado correctamente' }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const updateIngredientName = async (id, nuevoNombre) => {
        try {
            const { error } = await supabase
                .from('ingredientes')
                .update({ nombre: nuevoNombre })
                .eq('id', id)

            if (error) throw error

            await fetchIngredients()
            return { success: true, mensaje: '✅ Nombre actualizado correctamente' }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const updateStock = async (id, cantidadAgregar, costoAgregar) => {
        try {
            // Get current values
            const { data: current, error: fetchError } = await supabase
                .from('ingredientes')
                .select('stock, costo_total')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const nuevoStock = parseFloat(current.stock) + parseFloat(cantidadAgregar)
            const nuevoCosto = parseFloat(current.costo_total) + parseFloat(costoAgregar)
            const nuevoCostoUnitario = nuevoStock > 0 ? nuevoCosto / nuevoStock : 0

            const { error } = await supabase
                .from('ingredientes')
                .update({
                    stock: nuevoStock,
                    costo_unitario: nuevoCostoUnitario,
                    costo_total: nuevoCosto
                })
                .eq('id', id)

            if (error) throw error

            await fetchIngredients()
            return { success: true, mensaje: '✅ Stock actualizado correctamente' }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const deleteIngredient = async (id) => {
        try {
            const { error } = await supabase
                .from('ingredientes')
                .delete()
                .eq('id', id)

            if (error) throw error

            await fetchIngredients()
            return { success: true, mensaje: '✅ Ingrediente eliminado correctamente' }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        fetchIngredients()
    }, [])

    return (
        <IngredientsContext.Provider value={{
            ingredients,
            loading,
            error,
            addIngredient,
            updateIngredient,
            updateIngredientName,
            updateStock,
            deleteIngredient,
            refresh: fetchIngredients
        }}>
            {children}
        </IngredientsContext.Provider>
    )
}
