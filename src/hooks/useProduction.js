import { useState } from 'react'
import { supabase } from '../lib/supabase'

export const useProduction = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const produceBatch = async (recipeId, units) => {
        try {
            setLoading(true)
            setError(null)

            // 1. Get Recipe Details with Ingredients
            const { data: recipe, error: recipeError } = await supabase
                .from('recetas')
                .select(`
                    *,
                    ingredientes:receta_ingredientes (
                        ingrediente_id,
                        gramos,
                        ingrediente:ingredientes (
                            id,
                            nombre,
                            stock
                        )
                    )
                `)
                .eq('id', recipeId)
                .single()

            if (recipeError) throw recipeError

            // 2. Calculate Requirements & Validate Stock
            const requiredMaterials = recipe.ingredientes.map(ri => {
                const totalGramsNeeded = ri.gramos * units
                return {
                    id: ri.ingrediente.id,
                    name: ri.ingrediente.nombre,
                    currentStock: ri.ingrediente.stock,
                    required: totalGramsNeeded,
                    hasStock: ri.ingrediente.stock >= totalGramsNeeded
                }
            })

            const missingIngredients = requiredMaterials.filter(m => !m.hasStock)

            if (missingIngredients.length > 0) {
                const missingNames = missingIngredients.map(m => m.name).join(', ')
                throw new Error(`Stock insuficiente para: ${missingNames}`)
            }

            // 3. Process Production (Deduct Stock)
            // Note: Ideally this should be a transaction/RPC to guarantee atomicity.
            // For now we process sequentially checking errors.

            for (const material of requiredMaterials) {
                const newStock = material.currentStock - material.required
                const { error: updateError } = await supabase
                    .from('ingredientes')
                    .update({ stock: newStock })
                    .eq('id', material.id)

                if (updateError) {
                    console.error(`Failed to update stock for ${material.name}`, updateError)
                    throw new Error(`Error al actualizar stock de ${material.name}`)
                }
            }

            // 4. Log Production (Optional - Future Feature: Production History Table)
            // const { error: logError } = await supabase.from('produccion_logs').insert(...)

            return { success: true, message: `✅ Producción exitosa: ${units} unidades de ${recipe.nombre}` }

        } catch (err) {
            console.error('Production error:', err)
            setError(err.message)
            return { success: false, error: err.message }
        } finally {
            setLoading(false)
        }
    }

    return {
        produceBatch,
        loading,
        error
    }
}
