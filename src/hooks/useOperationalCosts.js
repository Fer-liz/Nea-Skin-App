import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const useOperationalCosts = () => {
    const [costs, setCosts] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchCosts = async () => {
        try {
            setLoading(true)

            const { data, error } = await supabase
                .from('gastos_operativos')
                .select('*')
                .order('nombre', { ascending: true })

            if (error) throw error

            setCosts(data || [])
            setError(null)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching operational costs:', err)
        } finally {
            setLoading(false)
        }
    }

    const addCost = async (nombre, precio) => {
        try {
            const { data, error } = await supabase
                .from('gastos_operativos')
                .insert([{
                    nombre,
                    precio: parseFloat(precio)
                }])
                .select()

            if (error) throw error

            await fetchCosts()
            return { success: true, mensaje: '✅ Gasto agregado correctamente' }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const deleteCost = async (id) => {
        try {
            const { error } = await supabase
                .from('gastos_operativos')
                .delete()
                .eq('id', id)

            if (error) throw error

            await fetchCosts()
            return { success: true, mensaje: '✅ Gasto eliminado correctamente' }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const updateCost = async (id, nombre, precio) => {
        try {
            const { error } = await supabase
                .from('gastos_operativos')
                .update({
                    nombre,
                    precio: parseFloat(precio)
                })
                .eq('id', id)

            if (error) throw error

            await fetchCosts()
            return { success: true, mensaje: '✅ Gasto actualizado correctamente' }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        fetchCosts()
    }, [])

    return {
        costs,
        loading,
        error,
        addCost,
        updateCost,
        deleteCost,
        refresh: fetchCosts
    }
}
