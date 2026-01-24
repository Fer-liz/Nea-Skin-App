import { createContext, useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export const RecipesContext = createContext()

export const RecipesProvider = ({ children }) => {
    const [recipes, setRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    const fetchRecipes = async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('recetas')
                .select('*')
                .order('nombre', { ascending: true })

            if (error) throw error

            // Calculate per-gram values
            const recipesWithCalcs = (data || []).map(recipe => ({
                ...recipe,
                costo_por_gramo: recipe.costo_total / recipe.gramaje,
                precio_venta_por_gramo: recipe.precio_venta / recipe.gramaje
            }))

            setRecipes(recipesWithCalcs)
            setError(null)
        } catch (err) {
            setError(err.message)
            console.error('Error fetching recipes:', err)
        } finally {
            setLoading(false)
        }
    }

    const getRecipeDetail = async (id) => {
        try {
            // Get recipe
            const { data: recipe, error: recipeError } = await supabase
                .from('recetas')
                .select('*')
                .eq('id', id)
                .single()

            if (recipeError) throw recipeError

            // Get ingredients
            const { data: ingredients, error: ingredientsError } = await supabase
                .from('receta_ingredientes')
                .select(`
          *,
          ingrediente:ingredientes(nombre)
        `)
                .eq('receta_id', id)

            if (ingredientsError) throw ingredientsError

            // Get operational costs
            const { data: gastos, error: gastosError } = await supabase
                .from('receta_gastos')
                .select(`
          *,
          gasto:gastos_operativos(nombre)
        `)
                .eq('receta_id', id)

            if (gastosError) throw gastosError

            return {
                ...recipe,
                ingredientes: ingredients.map(ing => ({
                    ingrediente_id: ing.ingrediente_id,
                    nombre: ing.ingrediente.nombre,
                    porcentaje: ing.porcentaje,
                    gramos: ing.gramos,
                    costo: ing.costo
                })),
                extras: gastos.map(g => ({
                    gasto_id: g.gasto_id,
                    nombre: g.gasto.nombre,
                    costo: g.costo
                })),
                costo_por_gramo: recipe.costo_total / recipe.gramaje,
                precio_venta_por_gramo: recipe.precio_venta / recipe.gramaje
            }
        } catch (err) {
            console.error('Error fetching recipe detail:', err)
            return null
        }
    }

    const createRecipe = async (nombre, gramaje, margen, ingredientes, extras, notas = '') => {
        try {
            // Calculate total cost
            let costoTotal = 0
            ingredientes.forEach(ing => {
                costoTotal += parseFloat(ing.costo)
            })
            extras.forEach(extra => {
                costoTotal += parseFloat(extra.costo)
            })

            const precioVenta = costoTotal * (1 + parseFloat(margen) / 100)

            // Insert recipe
            const { data: newRecipe, error: recipeError } = await supabase
                .from('recetas')
                .insert([{
                    nombre,
                    gramaje: parseFloat(gramaje),
                    margen: parseFloat(margen),
                    costo_total: costoTotal,
                    precio_venta: precioVenta,
                    notas
                }])
                .select()
                .single()

            if (recipeError) throw recipeError

            // Insert ingredients
            for (const ing of ingredientes) {
                const { error: ingError } = await supabase
                    .from('receta_ingredientes')
                    .insert([{
                        receta_id: newRecipe.id,
                        ingrediente_id: ing.ingrediente_id,
                        porcentaje: parseFloat(ing.porcentaje),
                        gramos: parseFloat(ing.gramos),
                        costo: parseFloat(ing.costo)
                    }])

                if (ingError) throw ingError
            }

            // Insert operational costs
            for (const extra of extras) {
                const { error: extraError } = await supabase
                    .from('receta_gastos')
                    .insert([{
                        receta_id: newRecipe.id,
                        gasto_id: extra.gasto_id,
                        costo: parseFloat(extra.costo)
                    }])

                if (extraError) throw extraError
            }

            await fetchRecipes()
            return { success: true, mensaje: '✅ Receta creada correctamente' }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const deleteRecipe = async (id) => {
        try {
            const { error } = await supabase
                .from('recetas')
                .delete()
                .eq('id', id)

            if (error) throw error

            await fetchRecipes()
            return { success: true, mensaje: '✅ Receta eliminada correctamente' }
        } catch (err) {
            return { success: false, error: err.message }
        }
    }

    const updateRecipe = async (id, nombre, gramaje, margen, ingredientes, extras, notas = '') => {
        try {
            // 1. Calculate new totals
            let costoTotal = 0
            ingredientes.forEach(ing => costoTotal += parseFloat(ing.costo))
            extras.forEach(extra => costoTotal += parseFloat(extra.costo))
            const precioVenta = costoTotal * (1 + parseFloat(margen) / 100)

            // 2. Update Recipe Header
            const { error: recipeError } = await supabase
                .from('recetas')
                .update({
                    nombre,
                    gramaje: parseFloat(gramaje),
                    margen: parseFloat(margen),
                    costo_total: costoTotal,
                    precio_venta: precioVenta,
                    notas
                })
                .eq('id', id)

            if (recipeError) throw recipeError

            // 3. Clear existing relations (Ingredients & Extras)
            await supabase.from('receta_ingredientes').delete().eq('receta_id', id)
            await supabase.from('receta_gastos').delete().eq('receta_id', id)

            // 4. Insert new Inputs
            if (ingredientes.length > 0) {
                const ingredientsToInsert = ingredientes.map(ing => ({
                    receta_id: id,
                    ingrediente_id: ing.ingrediente_id,
                    porcentaje: parseFloat(ing.porcentaje),
                    gramos: parseFloat(ing.gramos),
                    costo: parseFloat(ing.costo)
                }))
                const { error: ingError } = await supabase.from('receta_ingredientes').insert(ingredientsToInsert)
                if (ingError) throw ingError
            }

            // 5. Insert new Extras
            if (extras.length > 0) {
                const extrasToInsert = extras.map(extra => ({
                    receta_id: id,
                    gasto_id: extra.gasto_id,
                    costo: parseFloat(extra.costo)
                }))
                const { error: extraError } = await supabase.from('receta_gastos').insert(extrasToInsert)
                if (extraError) throw extraError
            }

            await fetchRecipes()
            return { success: true, mensaje: '✅ Receta actualizada correctamente' }
        } catch (err) {
            console.error('Update error:', err)
            return { success: false, error: err.message }
        }
    }

    const duplicateRecipe = async (originalRecipeId) => {
        try {
            // 1. Get full details of original recipe
            const original = await getRecipeDetail(originalRecipeId)
            if (!original) throw new Error('No se pudo cargar la receta original')

            // 2. Create new recipe header
            const newName = `(Copia) ${original.nombre}`
            const newRecipeData = {
                nombre: newName,
                gramaje: original.gramaje,
                margen: original.margen,
                costo_total: original.costo_total,
                precio_venta: original.precio_venta,
                notas: original.notas
            }

            const { data: newRecipe, error: createError } = await supabase
                .from('recetas')
                .insert([newRecipeData])
                .select()
                .single()

            if (createError) throw createError

            // 3. Copy Ingredients
            if (original.ingredientes && original.ingredientes.length > 0) {
                const ingredientsToInsert = original.ingredientes.map(ing => ({
                    receta_id: newRecipe.id,
                    ingrediente_id: ing.ingrediente_id,
                    porcentaje: ing.porcentaje,
                    gramos: ing.gramos,
                    costo: ing.costo
                }))

                const { error: ingError } = await supabase
                    .from('receta_ingredientes')
                    .insert(ingredientsToInsert)

                if (ingError) throw ingError
            }

            // 4. Copy Operational Costs
            if (original.extras && original.extras.length > 0) {
                const extrasToInsert = original.extras.map(extra => ({
                    receta_id: newRecipe.id,
                    gasto_id: extra.gasto_id,
                    costo: extra.costo
                }))

                const { error: extraError } = await supabase
                    .from('receta_gastos')
                    .insert(extrasToInsert)

                if (extraError) throw extraError
            }

            await fetchRecipes()
            return { success: true, mensaje: '✅ Receta duplicada correctamente', newId: newRecipe.id }

        } catch (err) {
            console.error('Duplicate error:', err)
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        fetchRecipes()
    }, [])

    return (
        <RecipesContext.Provider value={{
            recipes,
            loading,
            error,
            createRecipe,
            updateRecipe,
            createRecipe,
            updateRecipe,
            deleteRecipe,
            duplicateRecipe,
            getRecipeDetail,
            refresh: fetchRecipes
        }}>
            {children}
        </RecipesContext.Provider>
    )
}
