# NEA Cosmética - Modern Web Application

Sistema de inventario y gestión de recetas para productos cosméticos, migrado de Google Apps Script a una arquitectura moderna con React + Supabase.

## 🚀 Características

- ✅ **Inventario**: Gestión completa de ingredientes con ordenamiento alfabético, búsqueda en tiempo real, y menús contextuales
- ✅ **Recetas**: Creación y gestión de recetas con cálculo automático de costos y márgenes
- ✅ **Gastos Operativos**: Control de costos adicionales por receta
- ⚙️ **Producción**: Módulo en desarrollo para gestión de lotes
- 🎨 **Diseño Neumórfico**: Interfaz moderna con sombras suaves y transiciones fluidas

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta de Supabase (https://supabase.com)

## 🛠️ Instalación

1. **Instalar dependencias:**
   ```bash
   cd nea-cosmetica-app
   npm install
   ```

2. **Configurar Supabase:**
   - Crea un proyecto en Supabase
   - Ejecuta el script SQL en `../supabase-schema.sql` en el SQL Editor de Supabase
   - Copia la URL y la clave anónima de tu proyecto

3. **Configurar variables de entorno:**
   - Edita el archivo `.env.local`
   - Reemplaza los valores con tus credenciales de Supabase:
     ```
     VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
     VITE_SUPABASE_ANON_KEY=tu_clave_anonima_aqui
     ```

## 🚀 Uso

### Modo Desarrollo
```bash
npm run dev
```
La aplicación se abrirá automáticamente en `http://localhost:5173`

### Compilar para Producción
```bash
npm run build
```

### Vista Previa de Producción
```bash
npm run preview
```

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── inventory/     # Módulo de inventario
│   ├── recipes/       # Módulo de recetas
│   ├── production/    # Módulo de producción
│   ├── costs/         # Módulo de gastos
│   ├── layout/        # Componentes de layout
│   └── ui/            # Componentes reutilizables
├── hooks/             # Custom React hooks
├── lib/               # Utilidades y configuración
├── App.jsx            # Componente principal
└── main.jsx           # Punto de entrada

```

## 🎨 Mejoras UX Implementadas

1. **Ordenamiento Alfabético**: Todos los listados se muestran ordenados alfabéticamente
2. **Menús Kebab**: Acciones contextuales en cada elemento con confirmación de eliminación
3. **Edición Rápida**: Posibilidad de editar nombres directamente desde el inventario
4. **Modales Amplios**: Las ventanas de recetas usan 70-80% del ancho de pantalla
5. **Búsqueda Inteligente**: Combobox con filtrado en tiempo real para seleccionar ingredientes
6. **Notas en Recetas**: Campo de texto para agregar comentarios y notas a cada receta

## 🗄️ Base de Datos

El esquema de la base de datos incluye:
- `ingredientes`: Inventario de ingredientes
- `recetas`: Recetas maestras con notas
- `receta_ingredientes`: Detalle de ingredientes por receta
- `gastos_operativos`: Gastos operativos globales
- `receta_gastos`: Gastos asignados a cada receta

## 📝 Notas

- La aplicación requiere conexión a internet para acceder a Supabase
- Los datos se sincronizan en tiempo real
- El diseño es completamente responsive

## 🤝 Soporte

Para problemas o preguntas, consulta la documentación de:
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
- [Supabase](https://supabase.com/docs)
- [TailwindCSS](https://tailwindcss.com)
