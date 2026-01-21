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
        <>
            {/* Desktop Navigation */}
            <nav className="hidden md:block bg-gradient-to-r from-neumorphic-primary to-neumorphic-secondary shadow-lg py-4 sticky top-0 z-50">
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

            {/* Mobile Header (Logo Only) */}
            <div className="md:hidden bg-gradient-to-r from-neumorphic-primary to-neumorphic-secondary p-4 shadow-md sticky top-0 z-50 flex justify-center">
                <button className="logo-button scale-75">
                    <span className="actual-text">NEA</span>
                    <span className="hover-text">SKIN</span>
                </button>
            </div>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 px-2 pb-safe">
                <div className="flex justify-around items-center">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className={`flex-1 py-3 flex flex-col items-center justify-center transition-colors duration-200 ${activeTab === tab.id
                                ? 'text-neumorphic-primary'
                                : 'text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            <span className={`text-xl mb-1 ${activeTab === tab.id ? 'transform scale-110' : ''}`}>
                                {tab.icon}
                            </span>
                            <span className="text-[10px] uppercase tracking-wide font-medium">
                                {tab.label.replace(/^.+ /, '')}
                            </span>
                        </button>
                    ))}
                </div>
            </nav>
            {/* Spacer for bottom nav */}
            <div className="h-16 md:hidden"></div>
        </>
    )
}
