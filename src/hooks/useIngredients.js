import { useContext } from 'react'
import { IngredientsContext } from '../context/IngredientsContext'

export const useIngredients = () => {
    return useContext(IngredientsContext)
}
