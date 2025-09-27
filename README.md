# Plantilla-de-calculo
Solucionador de Programación Lineal
Una plantilla web completa para resolver problemas de Programación Lineal usando los métodos Simplex, Dos Fases y M Grande, con visualización paso a paso de las iteraciones.
Características
Tres métodos de resolución: Simplex, Dos Fases y M Grande
Interfaz intuitiva: Formularios dinámicos que se adaptan al número de variables y restricciones
Visualización paso a paso: Navegación entre iteraciones con tablas interactivas
Resultados detallados: Solución óptima con valores de variables y función objetivo
Validación de datos: Verificación automática de entrada de datos válidos
Diseño responsive: Compatible con dispositivos móviles y tablets
Interfaz moderna: Diseño atractivo con gradientes y animaciones
Exportación de resultados: Descarga de resultados en formato de texto
Sistema de ayuda: Guía integrada para usar cada método
Sin dependencias externas: Funciona completamente offline
Estructura del Proyecto
linear-programming-solver/
├── index.html          # Archivo principal HTML
├── css/
│   └── styles.css      # Estilos CSS con diseño moderno
└── js/
    └── script.js       # Lógica JavaScript completa
Instalación y Configuración
Requisitos Previos
Navegador web moderno (Chrome, Firefox, Safari, Edge)
Editor de código (recomendado: Visual Studio Code)
Pasos de Instalación
Crear la estructura del proyecto


mkdir linear-programming-solver
cd linear-programming-solver
mkdir css js

Crear los archivos necesarios


index.html (en la carpeta raíz)
css/styles.css (en la carpeta css)
js/script.js (en la carpeta js)
Copiar el código proporcionado en cada archivo respectivo


Ejecutar el proyecto


Opción A: Usar Live Server en VS Code
Instalar extensión "Live Server"
Clic derecho en index.html → "Open with Live Server"
Opción B: Abrir directamente
Doble clic en index.html o arrastrarlo al navegador
Funcionamiento de la Plantilla
Arquitectura General
La plantilla está dividida en tres componentes principales:
1. Interfaz de Usuario (HTML + CSS)
Formularios dinámicos: Se generan automáticamente según el número de variables y restricciones
Sistema de pestañas: Separación entre iteraciones y solución final
Controles de navegación: Botones para navegar entre las iteraciones
Diseño responsivo: Adaptable a diferentes tamaños de pantalla
2. Lógica de Resolución (JavaScript)
Algoritmos matemáticos: Implementación completa de los tres métodos
Gestión de estado: Manejo de iteraciones y resultados
Validación de datos: Verificación de entrada de datos válidos
Manejo de errores: Detección de problemas infactibles o no acotados
3. Visualización de Resultados
Tablas interactivas: Visualización de las tablas simplex con resaltado de elementos pivote
Navegación temporal: Posibilidad de ver cada iteración del algoritmo
Solución final: Presentación clara de las variables y valor óptimo
Flujo de Funcionamiento
graph TD
    A[Configuración del Problema] --> B[Generación de Formularios]
    B --> C[Entrada de Datos]
    C --> D[Validación de Datos]
    D --> E{¿Datos Válidos?}
    E -->|No| F[Mostrar Error]
    E -->|Sí| G[Selección de Método]
    G --> H[Ejecución del Algoritmo]
    H --> I[Generación de Iteraciones]
    I --> J[Visualización de Resultados]
    J --> K[Navegación entre Iteraciones]
Componentes Técnicos
Generación Dinámica de Formularios
function generateInputs() {
    numVars = parseInt(document.getElementById('numVariables').value);
    numConstraints = parseInt(document.getElementById('numConstraints').value);
    
    generateObjectiveInputs();  // Función objetivo
    generateConstraintInputs(); // Restricciones
}
Sistema de Validación
Verificación de campos vacíos
Validación de números válidos
Comprobación de RHS no negativos
Verificación de función objetivo no nula
Algoritmos Implementados
Método Simplex: Para restricciones ≤ únicamente
Método Dos Fases: Para restricciones mixtas (≤, ≥, =)
Método M Grande: Alternativa para restricciones mixtas
Instrucciones de Uso
Paso 1: Configuración Inicial
Abrir la aplicación en el navegador
Definir parámetros:
Número de variables (2-10)
Número de restricciones (1-10)
Hacer clic en "Generar Formulario"
Paso 2: Ingreso de Datos
Función Objetivo:


Ingresar coeficientes para cada variable
Seleccionar "Maximizar" o "Minimizar"
Restricciones:


Ingresar coeficientes para cada variable en cada restricción
Seleccionar operador (≤, ≥, =)
Ingresar valor del lado derecho (RHS)
Método de Resolución:


Simplex: Solo para restricciones ≤
Dos Fases: Para cualquier tipo de restricciones
M Grande: Alternativa para restricciones mixtas
Paso 3: Resolución
Hacer clic en "Resolver Problema"
Esperar procesamiento (mensaje de carga aparecerá)
Ver resultados en la sección que se despliega automáticamente
Paso 4: Análisis de Resultados
Pestaña "Iteraciones":


Navegar con botones "Anterior" y "Siguiente"
Observar elementos pivote resaltados
Leer explicaciones de cada operación
Pestaña "Solución Final":


Ver valores de todas las variables
Obtener valor óptimo de la función objetivo
Verificar estado de la solución
Paso 5: Funciones Adicionales
Ayuda: Obtener información sobre cada método
Limpiar: Reiniciar la aplicación
Exportar: Descargar resultados en archivo de texto
Métodos Implementados
1. Método Simplex
Aplicación: Problemas con restricciones ≤ únicamente
Ventajas: Algoritmo más directo y eficiente
Limitaciones: Solo para restricciones de tipo "menor o igual"
Ejemplo de uso:
Maximizar: Z = 3x₁ + 2x₂
Sujeto a:
  x₁ + 2x₂ ≤ 8
  2x₁ + x₂ ≤ 6
  x₁, x₂ ≥ 0
2. Método de Dos Fases
Aplicación: Problemas con cualquier tipo de restricciones
Fase 1: Encontrar solución factible básica
Fase 2: Optimizar función objetivo original
Ventajas: Maneja todos los tipos de restricciones
Ejemplo de uso:
Minimizar: Z = 2x₁ + 3x₂
Sujeto a:
  x₁ + x₂ ≥ 4
  2x₁ - x₂ = 2
  x₁, x₂ ≥ 0
3. Método de la M Grande
Aplicación: Alternativa para restricciones mixtas
Principio: Penalizar variables artificiales con valor M muy grande
Ventajas: Un solo proceso de optimización
Consideración: Puede tener problemas numéricos con M muy grande
Ejemplo de uso:
Maximizar: Z = x₁ + 2x₂
Sujeto a:
  x₁ + x₂ = 3
  x₁ - x₂ ≥ 1
  x₁, x₂ ≥ 0
Tecnologías Utilizadas
HTML5: Estructura semántica y accesible
CSS3:
Flexbox y Grid para layouts
Gradientes y animaciones
Media queries para responsive design
Variables CSS para consistencia de colores
JavaScript ES6+:
Programación orientada a objetos
Manipulación del DOM
Algoritmos matemáticos avanzados
Manejo de eventos y estados
Ejemplos de Uso
Ejemplo 1: Problema de Producción (Simplex)
Maximizar ganancias: Z = 40x₁ + 30x₂
Restricciones de recursos:
  2x₁ + x₂ ≤ 100  (horas de trabajo)
  x₁ + 2x₂ ≤ 80   (materia prima)
  x₁, x₂ ≥ 0
Ejemplo 2: Problema de Dieta (Dos Fases)
Minimizar costo: Z = 3x₁ + 2x₂
Requerimientos nutricionales:
  2x₁ + x₂ ≥ 6   (proteínas)
  x₁ + 2x₂ ≥ 8   (vitaminas)
  x₁ + x₂ = 5    (calorías exactas)
  x₁, x₂ ≥ 0
Ejemplo 3: Problema de Transporte (M Grande)
Minimizar costo: Z = 5x₁ + 3x₂ + 4x₃
Restricciones de capacidad:
  x₁ + x₂ + x₃ = 100  (demanda total)
  x₁ ≤ 40              (capacidad ruta 1)
  x₂ ≥ 20              (mínimo ruta 2)
  x₁, x₂, x₃ ≥ 0
Solución de Problemas
Problemas Comunes y Soluciones
Error: "Problema no acotado"
Causa: La función objetivo puede aumentar infinitamente
Solución: Revisar las restricciones del problema
Verificar: Que las restricciones limiten adecuadamente el espacio factible
Error: "Problema infactible"
Causa: Las restricciones son contradictorias
Solución: Revisar la consistencia de las restricciones
Ejemplo: x ≤ 5 y x ≥ 10 simultáneamente
Error: "Método no válido para este tipo de problema"
Causa: Usar Simplex con restricciones ≥ o =
Solución: Usar método de Dos Fases o M Grande
La aplicación no carga
Verificar: Estructura de archivos correcta
Comprobar: Rutas de CSS y JavaScript en index.html
Revisar: Consola del navegador para errores
Resultados incorrectos
Validar: Entrada de datos (números negativos en RHS)
Verificar: Selección correcta del método
Comprobar: Formulación matemática del problema
Limitaciones Conocidas
Precisión numérica: Problemas muy grandes pueden tener errores de redondeo
Método M Grande: M = 1,000,000 puede causar problemas numéricos
Capacidad: Máximo 10 variables y 10 restricciones por limitaciones de interfaz
Navegadores: Requiere JavaScript habilitado
