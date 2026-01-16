import { Fragment, useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, Transition } from '@headlessui/react'

export const KebabMenu = ({ items, className = '' }) => {
    const [position, setPosition] = useState({ top: 0, left: 0 })
    const buttonRef = useRef(null)

    const calculatePosition = () => {
        if (buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            const menuHeight = items.length * 40 + 8 // Approx 40px per item + padding
            const spaceBelow = window.innerHeight - rect.bottom
            const spaceAbove = rect.top

            let top = rect.bottom + window.scrollY + 4

            // If not enough space below, show above the button
            if (spaceBelow < menuHeight && spaceAbove > menuHeight) {
                top = rect.top + window.scrollY - menuHeight - 4
            }

            setPosition({
                top,
                left: rect.right + window.scrollX - 192 // 192px is w-48
            })
        }
    }

    return (
        <Menu as="div" className={`inline-block text-left ${className}`}>
            <Menu.Button
                ref={buttonRef}
                onClick={calculatePosition}
                className="kebab-menu-button"
            >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
            </Menu.Button>

            {createPortal(
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items
                        className="absolute z-[9999] w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 focus:outline-none focus:ring-1 focus:ring-neumorphic-primary/20"
                        style={{ top: position.top, left: position.left }}
                    >
                        <div className="py-1">
                            {items.map((item, index) => (
                                <Menu.Item key={index}>
                                    {({ active }) => (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                item.onClick()
                                            }}
                                            className={`kebab-menu-item w-full text-left flex items-center gap-2 px-4 py-2 text-sm ${active ? 'bg-gray-50 text-gray-900' : 'text-gray-700'
                                                } ${item.danger ? 'text-red-600 hover:bg-red-50' : ''}`}
                                        >
                                            {item.icon && <span className="w-5 h-5 flex items-center justify-center">{item.icon}</span>}
                                            <span>{item.label}</span>
                                        </button>
                                    )}
                                </Menu.Item>
                            ))}
                        </div>
                    </Menu.Items>
                </Transition>,
                document.body
            )}
        </Menu>
    )
}
