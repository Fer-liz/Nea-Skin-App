import { useState, Fragment } from 'react'
import { Combobox, Transition } from '@headlessui/react'

export const SearchableCombobox = ({ items, value, onChange, placeholder = 'Buscar...', displayValue }) => {
    const [query, setQuery] = useState('')

    const filteredItems =
        query === ''
            ? items
            : items.filter((item) => {
                const displayText = displayValue ? displayValue(item) : item.toString()
                return displayText.toLowerCase().includes(query.toLowerCase())
            })

    return (
        <Combobox value={value} onChange={onChange}>
            <div className="relative">
                <Combobox.Input
                    className="neumorphic-input"
                    placeholder={placeholder}
                    displayValue={displayValue}
                    onChange={(event) => setQuery(event.target.value)}
                />
                <Transition
                    as={Fragment}
                    leave="transition ease-in duration-100"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                    afterLeave={() => setQuery('')}
                >
                    <Combobox.Options className="absolute z-[9999] mt-2 w-full bg-white rounded-lg shadow-neumorphic max-h-60 overflow-auto border border-gray-200">
                        {filteredItems.length === 0 && query !== '' ? (
                            <div className="px-4 py-2 text-gray-500">No se encontraron resultados</div>
                        ) : (
                            filteredItems.map((item, index) => (
                                <Combobox.Option
                                    key={index}
                                    value={item}
                                    className={({ active }) =>
                                        `px-4 py-2 cursor-pointer ${active ? 'bg-neumorphic-primary text-white' : 'text-gray-900'}`
                                    }
                                >
                                    {displayValue ? displayValue(item) : item.toString()}
                                </Combobox.Option>
                            ))
                        )}
                    </Combobox.Options>
                </Transition>
            </div>
        </Combobox>
    )
}
