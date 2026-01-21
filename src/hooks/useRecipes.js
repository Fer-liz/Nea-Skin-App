import { useContext } from 'react'
import { RecipesContext } from '../context/RecipesContext'

export const useRecipes = () => {
    return useContext(RecipesContext)
}
