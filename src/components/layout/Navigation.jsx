import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export const Navigation = ({ activeTab, onTabChange }) => {
    const [isHovered, setIsHovered] = useState(false)

    const tabs = [
        { id: 'inventario', label: '📦 Inventario', icon: '📦' },
        { id: 'recetas', label: '🧪 Recetas', icon: '🧪' },
        { id: 'produccion', label: '⚙️ Producción', icon: '⚙️' },
        { id: 'gastos', label: '💰 Gastos', icon: '💰' }
    ]

    return (
        <nav className="bg-gradient-to-r from-neumorphic-primary to-neumorphic-secondary shadow-lg py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
                <button className="logo-button">
                    <span className="actual-text">NEA</span>
                    <span className="hover-text">SKIN</span>
                </button>

                <div className="flex space-x-4">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`px-8 py-4 rounded-xl font-bold transition-all duration-300 flex flex-col items-center justify-center min-w-[100px] ${activeTab === tab.id
                                ? 'bg-white text-neumorphic-primary shadow-xl scale-105 transform'
                                : 'text-white hover:bg-white hover:bg-opacity-20'
                                }`}
                        >
                            <span className="text-2xl mb-1">{tab.icon}</span>
                            <span className="text-xs uppercase tracking-widest">{tab.label.replace(/^.+ /, '')}</span>
                        </button>
                    ))}
                </div>
            </div>
        </nav>
    )
}
