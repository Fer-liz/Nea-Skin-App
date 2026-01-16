import { useState } from 'react'
import { Layout } from './components/layout/Layout'
import { Navigation } from './components/layout/Navigation'
import { InventoryTable } from './components/inventory/InventoryTable'
import { RecipeList } from './components/recipes/RecipeList'
import { ProductionTab } from './components/production/ProductionTab'
import { OperationalCosts } from './components/costs/OperationalCosts'
import './index.css'

import { motion, AnimatePresence } from 'framer-motion'

function App() {
    const [activeTab, setActiveTab] = useState('inventario')

    return (
        <Layout>
            <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

            <main className="max-w-7xl mx-auto px-4 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                    >
                        {activeTab === 'inventario' && <InventoryTable />}
                        {activeTab === 'recetas' && <RecipeList />}
                        {activeTab === 'produccion' && <ProductionTab />}
                        {activeTab === 'gastos' && <OperationalCosts />}
                    </motion.div>
                </AnimatePresence>
            </main>
        </Layout>
    )
}

export default App
