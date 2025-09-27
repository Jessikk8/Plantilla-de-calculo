// Variables globales
let numVars = 2;
let numConstraints = 2;
let iterations = [];
let currentIteration = 0;
let finalSolution = null;

// Función para generar los inputs del problema
function generateInputs() {
    numVars = parseInt(document.getElementById('numVariables').value);
    numConstraints = parseInt(document.getElementById('numConstraints').value);
    
    // Mostrar la sección de inputs
    document.getElementById('problemInputs').style.display = 'block';
    
    // Generar inputs para la función objetivo
    generateObjectiveInputs();
    
    // Generar inputs para las restricciones
    generateConstraintInputs();
}

function generateObjectiveInputs() {
    const container = document.getElementById('objectiveInputs');
    container.innerHTML = '';
    
    for (let i = 0; i < numVars; i++) {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
        input.id = `obj_${i}`;
        input.placeholder = '0';
        input.value = i === 0 ? '3' : (i === 1 ? '2' : '1'); // Valores por defecto
        
        const label = document.createElement('span');
        label.className = 'variable-label';
        label.textContent = `x${i + 1}`;
        
        container.appendChild(input);
        container.appendChild(label);
        
        if (i < numVars - 1) {
            const plus = document.createElement('span');
            plus.textContent = ' + ';
            container.appendChild(plus);
        }
    }
}

function generateConstraintInputs() {
    const container = document.getElementById('constraintsSection');
    container.innerHTML = '';
    
    for (let i = 0; i < numConstraints; i++) {
        const row = document.createElement('div');
        row.className = 'constraint-row';
        
        // Coeficientes de las variables
        for (let j = 0; j < numVars; j++) {
            const input = document.createElement('input');
            input.type = 'number';
            input.step = 'any';
            input.id = `const_${i}_${j}`;
            input.placeholder = '0';
            // Valores por defecto para ejemplo
            input.value = (i === 0 && j === 0) ? '1' : 
                         (i === 0 && j === 1) ? '2' :
                         (i === 1 && j === 0) ? '2' : 
                         (i === 1 && j === 1) ? '1' : '1';
            
            const label = document.createElement('span');
            label.className = 'variable-label';
            label.textContent = `x${j + 1}`;
            
            row.appendChild(input);
            row.appendChild(label);
            
            if (j < numVars - 1) {
                const plus = document.createElement('span');
                plus.textContent = ' + ';
                row.appendChild(plus);
            }
        }
        
        // Operador de comparación
        const select = document.createElement('select');
        select.id = `op_${i}`;
        const operators = [
            { value: '<=', text: '≤' },
            { value: '>=', text: '≥' },
            { value: '=', text: '=' }
        ];
        
        operators.forEach(op => {
            const option = document.createElement('option');
            option.value = op.value;
            option.textContent = op.text;
            select.appendChild(option);
        });
        
        row.appendChild(select);
        
        // Valor del lado derecho
        const rhsInput = document.createElement('input');
        rhsInput.type = 'number';
        rhsInput.step = 'any';
        rhsInput.id = `rhs_${i}`;
        rhsInput.placeholder = '0';
        rhsInput.value = i === 0 ? '8' : '6'; // Valores por defecto
        
        row.appendChild(rhsInput);
        
        container.appendChild(row);
    }
}

// Función principal para resolver el problema
function solveProblem() {
    try {
        // Obtener datos del problema
        const problemData = collectProblemData();
        
        // Validar datos
        if (!validateProblemData(problemData)) {
            alert('Por favor, complete todos los campos correctamente.');
            return;
        }
        
        // Resolver según el método seleccionado
        const method = document.getElementById('method').value;
        let solution;
        
        switch (method) {
            case 'simplex':
                solution = solveWithSimplex(problemData);
                break;
            case 'dosFases':
                solution = solveWithTwoPhase(problemData);
                break;
            case 'bigM':
                solution = solveWithBigM(problemData);
                break;
            default:
                alert('Método no válido');
                return;
        }
        
        // Mostrar resultados
        displayResults(solution, method);
        
    } catch (error) {
        console.error('Error al resolver el problema:', error);
        alert('Error al resolver el problema: ' + error.message);
    }
}

function collectProblemData() {
    const data = {
        numVars: numVars,
        numConstraints: numConstraints,
        optimization: document.getElementById('optimizationType').value,
        objective: [],
        constraints: []
    };
    
    // Recoger coeficientes de la función objetivo
    for (let i = 0; i < numVars; i++) {
        const value = parseFloat(document.getElementById(`obj_${i}`).value) || 0;
        data.objective.push(value);
    }
    
    // Recoger restricciones
    for (let i = 0; i < numConstraints; i++) {
        const constraint = {
            coefficients: [],
            operator: document.getElementById(`op_${i}`).value,
            rhs: parseFloat(document.getElementById(`rhs_${i}`).value) || 0
        };
        
        for (let j = 0; j < numVars; j++) {
            const value = parseFloat(document.getElementById(`const_${i}_${j}`).value) || 0;
            constraint.coefficients.push(value);
        }
        
        data.constraints.push(constraint);
    }
    
    return data;
}

function validateProblemData(data) {
    // Validación básica
    return data.objective.length > 0 && data.constraints.length > 0;
}

// Método Simplex estándar
function solveWithSimplex(problemData) {
    const { objective, constraints, optimization } = problemData;
    
    // Verificar que todas las restricciones sean de tipo <=
    const hasNonLessEqual = constraints.some(constraint => constraint.operator !== '<=');
    if (hasNonLessEqual) {
        throw new Error('El método Simplex estándar solo acepta restricciones ≤. Use el método de Dos Fases o M Grande para otros tipos.');
    }
    
    // Preparar tabla inicial
    const tableau = prepareInitialTableau(problemData, 'simplex');
    iterations = [{ tableau: deepCopy(tableau), phase: 'Simplex', iteration: 0 }];
    
    let iterationCount = 0;
    let maxIterations = 100;
    
    while (iterationCount < maxIterations) {
        // Verificar optimalidad
        if (isOptimal(tableau, optimization)) {
            break;
        }
        
        // Encontrar columna pivote
        const pivotCol = findPivotColumn(tableau, optimization);
        if (pivotCol === -1) {
            throw new Error('Problema no acotado');
        }
        
        // Encontrar fila pivote
        const pivotRow = findPivotRow(tableau, pivotCol);
        if (pivotRow === -1) {
            throw new Error('Problema no acotado');
        }
        
        // Realizar operaciones de pivoteo
        performPivotOperation(tableau, pivotRow, pivotCol);
        
        iterationCount++;
        
        // Guardar iteración
        iterations.push({
            tableau: deepCopy(tableau),
            phase: 'Simplex',
            iteration: iterationCount,
            pivotRow: pivotRow,
            pivotCol: pivotCol
        });
    }
    
    if (iterationCount >= maxIterations) {
        throw new Error('Máximo número de iteraciones alcanzado');
    }
    
    // Extraer solución
    const solution = extractSolution(tableau, problemData);
    
    return {
        iterations: iterations,
        finalSolution: solution,
        method: 'Simplex'
    };
}

// Método de Dos Fases
function solveWithTwoPhase(problemData) {
    iterations = [];
    
    // Fase 1: Encontrar solución factible básica
    const phase1Tableau = prepareTwoPhaseTableau(problemData);
    iterations.push({ 
        tableau: deepCopy(phase1Tableau), 
        phase: 'Fase 1', 
        iteration: 0 
    });
    
    // Resolver Fase 1
    let iterationCount = 0;
    while (iterationCount < 100 && !isOptimal(phase1Tableau, 'min')) {
        const pivotCol = findPivotColumn(phase1Tableau, 'min');
        if (pivotCol === -1) break;
        
        const pivotRow = findPivotRow(phase1Tableau, pivotCol);
        if (pivotRow === -1) {
            throw new Error('Problema infactible');
        }
        
        performPivotOperation(phase1Tableau, pivotRow, pivotCol);
        iterationCount++;
        
        iterations.push({
            tableau: deepCopy(phase1Tableau),
            phase: 'Fase 1',
            iteration: iterationCount,
            pivotRow: pivotRow,
            pivotCol: pivotCol
        });
    }
    
    // Verificar factibilidad
    const phase1Value = phase1Tableau[phase1Tableau.length - 1][phase1Tableau[0].length - 1];
    if (Math.abs(phase1Value) > 1e-10) {
        throw new Error('Problema infactible - No existe solución factible');
    }
    
    // Fase 2: Optimizar función objetivo original
    const phase2Tableau = preparePhase2Tableau(phase1Tableau, problemData);
    iterations.push({ 
        tableau: deepCopy(phase2Tableau), 
        phase: 'Fase 2', 
        iteration: 0 
    });
    
    iterationCount = 0;
    while (iterationCount < 100 && !isOptimal(phase2Tableau, problemData.optimization)) {
        const pivotCol = findPivotColumn(phase2Tableau, problemData.optimization);
        if (pivotCol === -1) break;
        
        const pivotRow = findPivotRow(phase2Tableau, pivotCol);
        if (pivotRow === -1) {
            throw new Error('Problema no acotado');
        }
        
        performPivotOperation(phase2Tableau, pivotRow, pivotCol);
        iterationCount++;
        
        iterations.push({
            tableau: deepCopy(phase2Tableau),
            phase: 'Fase 2',
            iteration: iterationCount,
            pivotRow: pivotRow,
            pivotCol: pivotCol
        });
    }
    
    const solution = extractSolution(phase2Tableau, problemData);
    
    return {
        iterations: iterations,
        finalSolution: solution,
        method: 'Dos Fases'
    };
}

// Método de la M Grande
function solveWithBigM(problemData) {
    const { objective, constraints, optimization } = problemData;
    
    // Preparar tabla con M grande
    const tableau = prepareBigMTableau(problemData);
    iterations = [{ tableau: deepCopy(tableau), phase: 'M Grande', iteration: 0 }];
    
    let iterationCount = 0;
    while (iterationCount < 100) {
        if (isOptimal(tableau, optimization)) {
            break;
        }
        
        const pivotCol = findPivotColumn(tableau, optimization);
        if (pivotCol === -1) {
            throw new Error('Problema no acotado');
        }
        
        const pivotRow = findPivotRow(tableau, pivotCol);
        if (pivotRow === -1) {
            throw new Error('Problema no acotado');
        }
        
        performPivotOperation(tableau, pivotRow, pivotCol);
        iterationCount++;
        
        iterations.push({
            tableau: deepCopy(tableau),
            phase: 'M Grande',
            iteration: iterationCount,
            pivotRow: pivotRow,
            pivotCol: pivotCol
        });
    }
    
    const solution = extractSolution(tableau, problemData);
    
    return {
        iterations: iterations,
        finalSolution: solution,
        method: 'M Grande'
    };
}

// Funciones auxiliares para preparar tablas

function prepareInitialTableau(problemData, method) {
    const { objective, constraints, optimization } = problemData;
    const numOriginalVars = objective.length;
    let numSlackVars = 0;
    
    // Contar variables de holgura necesarias
    constraints.forEach(constraint => {
        if (constraint.operator === '<=') {
            numSlackVars++;
        }
    });
    
    const totalVars = numOriginalVars + numSlackVars;
    
    // Crear tabla
    const tableau = [];
    
    // Agregar restricciones
    let slackIndex = 0;
    for (let i = 0; i < constraints.length; i++) {
        const row = new Array(totalVars + 1).fill(0);
        
        // Coeficientes de variables originales
        for (let j = 0; j < numOriginalVars; j++) {
            row[j] = constraints[i].coefficients[j];
        }
        
        // Variables de holgura
        if (constraints[i].operator === '<=') {
            row[numOriginalVars + slackIndex] = 1;
            slackIndex++;
        }
        
        // Lado derecho
        row[totalVars] = constraints[i].rhs;
        
        tableau.push(row);
    }
    
    // Fila de función objetivo
    const objRow = new Array(totalVars + 1).fill(0);
    for (let i = 0; i < numOriginalVars; i++) {
        objRow[i] = optimization === 'max' ? -objective[i] : objective[i];
    }
    tableau.push(objRow);
    
    return tableau;
}

function prepareTwoPhaseTableau(problemData) {
    const { constraints } = problemData;
    const numOriginalVars = problemData.objective.length;
    let numSlackVars = 0;
    let numArtificialVars = 0;
    
    // Contar variables necesarias
    constraints.forEach(constraint => {
        if (constraint.operator === '<=') {
            numSlackVars++;
        } else if (constraint.operator === '>=') {
            numSlackVars++;
            numArtificialVars++;
        } else if (constraint.operator === '=') {
            numArtificialVars++;
        }
    });
    
    const totalVars = numOriginalVars + numSlackVars + numArtificialVars;
    const tableau = [];
    
    // Agregar restricciones
    let slackIndex = 0;
    let artificialIndex = 0;
    
    for (let i = 0; i < constraints.length; i++) {
        const row = new Array(totalVars + 1).fill(0);
        
        // Variables originales
        for (let j = 0; j < numOriginalVars; j++) {
            row[j] = constraints[i].coefficients[j];
        }
        
        // Variables de holgura y artificiales
        if (constraints[i].operator === '<=') {
            row[numOriginalVars + slackIndex] = 1;
            slackIndex++;
        } else if (constraints[i].operator === '>=') {
            row[numOriginalVars + slackIndex] = -1;
            row[numOriginalVars + numSlackVars + artificialIndex] = 1;
            slackIndex++;
            artificialIndex++;
        } else if (constraints[i].operator === '=') {
            row[numOriginalVars + numSlackVars + artificialIndex] = 1;
            artificialIndex++;
        }
        
        row[totalVars] = constraints[i].rhs;
        tableau.push(row);
    }
    
    // Función objetivo de Fase 1 (minimizar suma de variables artificiales)
    const phase1ObjRow = new Array(totalVars + 1).fill(0);
    for (let i = numOriginalVars + numSlackVars; i < numOriginalVars + numSlackVars + numArtificialVars; i++) {
        phase1ObjRow[i] = 1;
    }
    
    tableau.push(phase1ObjRow);
    
    // Eliminar variables artificiales de la función objetivo
    for (let i = 0; i < constraints.length; i++) {
        if (constraints[i].operator === '>=' || constraints[i].operator === '=') {
            for (let j = 0; j < totalVars + 1; j++) {
                tableau[tableau.length - 1][j] -= tableau[i][j];
            }
        }
    }
    
    return tableau;
}

function prepareBigMTableau(problemData) {
    const { objective, constraints, optimization } = problemData;
    const numOriginalVars = objective.length;
    let numSlackVars = 0;
    let numArtificialVars = 0;
    
    const M = 1000000; // Valor grande para M
    
    constraints.forEach(constraint => {
        if (constraint.operator === '<=') {
            numSlackVars++;
        } else if (constraint.operator === '>=') {
            numSlackVars++;
            numArtificialVars++;
        } else if (constraint.operator === '=') {
            numArtificialVars++;
        }
    });
    
    const totalVars = numOriginalVars + numSlackVars + numArtificialVars;
    const tableau = [];
    
    let slackIndex = 0;
    let artificialIndex = 0;
    
    for (let i = 0; i < constraints.length; i++) {
        const row = new Array(totalVars + 1).fill(0);
        
        for (let j = 0; j < numOriginalVars; j++) {
            row[j] = constraints[i].coefficients[j];
        }
        
        if (constraints[i].operator === '<=') {
            row[numOriginalVars + slackIndex] = 1;
            slackIndex++;
        } else if (constraints[i].operator === '>=') {
            row[numOriginalVars + slackIndex] = -1;
            row[numOriginalVars + numSlackVars + artificialIndex] = 1;
            slackIndex++;
            artificialIndex++;
        } else if (constraints[i].operator === '=') {
            row[numOriginalVars + numSlackVars + artificialIndex] = 1;
            artificialIndex++;
        }
        
        row[totalVars] = constraints[i].rhs;
        tableau.push(row);
    }
    
    // Función objetivo con penalización M
    const objRow = new Array(totalVars + 1).fill(0);
    for (let i = 0; i < numOriginalVars; i++) {
        objRow[i] = optimization === 'max' ? -objective[i] : objective[i];
    }
    
    // Penalizar variables artificiales
    for (let i = numOriginalVars + numSlackVars; i < totalVars; i++) {
        objRow[i] = optimization === 'max' ? M : -M;
    }
    
    tableau.push(objRow);
    
    // Eliminar variables artificiales de la función objetivo si es necesario
    let artificialVarIndex = numOriginalVars + numSlackVars;
    for (let i = 0; i < constraints.length; i++) {
        if (constraints[i].operator === '>=' || constraints[i].operator === '=') {
            const multiplier = optimization === 'max' ? M : -M;
            for (let j = 0; j < totalVars + 1; j++) {
                tableau[tableau.length - 1][j] -= multiplier * tableau[i][j];
            }
            if (constraints[i].operator === '>=') {
                artificialVarIndex++;
            } else if (constraints[i].operator === '=') {
                artificialVarIndex++;
            }
        }
    }
    
    return tableau;
}

function preparePhase2Tableau(phase1Tableau, problemData) {
    const { objective, optimization } = problemData;
    const numOriginalVars = objective.length;
    
    // Copiar tabla de fase 1 sin las columnas de variables artificiales
    const tableau = deepCopy(phase1Tableau);
    
    // Reemplazar función objetivo
    const objRowIndex = tableau.length - 1;
    
    // Limpiar fila objetivo
    for (let i = 0; i < tableau[objRowIndex].length; i++) {
        tableau[objRowIndex][i] = 0;
    }
    
    // Establecer coeficientes originales
    for (let i = 0; i < numOriginalVars; i++) {
        tableau[objRowIndex][i] = optimization === 'max' ? -objective[i] : objective[i];
    }
    
    return tableau;
}

// Funciones de optimización

function isOptimal(tableau, optimization) {
    const objRow = tableau[tableau.length - 1];
    
    if (optimization === 'max') {
        // Para maximización, óptimo si todos los coeficientes son >= 0
        for (let i = 0; i < objRow.length - 1; i++) {
            if (objRow[i] < -1e-10) {
                return false;
            }
        }
    } else {
        // Para minimización, óptimo si todos los coeficientes son <= 0
        for (let i = 0; i < objRow.length - 1; i++) {
            if (objRow[i] > 1e-10) {
                return false;
            }
        }
    }
    
    return true;
}

function findPivotColumn(tableau, optimization) {
    const objRow = tableau[tableau.length - 1];
    let pivotCol = -1;
    let bestValue = 0;
    
    for (let i = 0; i < objRow.length - 1; i++) {
        if (optimization === 'max') {
            if (objRow[i] < bestValue) {
                bestValue = objRow[i];
                pivotCol = i;
            }
        } else {
            if (objRow[i] > bestValue) {
                bestValue = objRow[i];
                pivotCol = i;
            }
        }
    }
    
    return pivotCol;
}

function findPivotRow(tableau, pivotCol) {
    let pivotRow = -1;
    let minRatio = Infinity;
    
    for (let i = 0; i < tableau.length - 1; i++) {
        if (tableau[i][pivotCol] > 1e-10) {
            const ratio = tableau[i][tableau[i].length - 1] / tableau[i][pivotCol];
            if (ratio >= -1e-10 && ratio < minRatio) {
                minRatio = ratio;
                pivotRow = i;
            }
        }
    }
    
    return pivotRow;
}

function performPivotOperation(tableau, pivotRow, pivotCol) {
    const pivotElement = tableau[pivotRow][pivotCol];
    
    // Dividir fila pivote por elemento pivote
    for (let j = 0; j < tableau[pivotRow].length; j++) {
        tableau[pivotRow][j] /= pivotElement;
    }
    
    // Hacer ceros en la columna pivote
    for (let i = 0; i < tableau.length; i++) {
        if (i !== pivotRow) {
            const multiplier = tableau[i][pivotCol];
            for (let j = 0; j < tableau[i].length; j++) {
                tableau[i][j] -= multiplier * tableau[pivotRow][j];
            }
        }
    }
}

function extractSolution(tableau, problemData) {
    const numVars = problemData.objective.length;
    const solution = {
        variables: new Array(numVars).fill(0),
        optimalValue: 0,
        status: 'optimal'
    };
    
    // Encontrar variables básicas
    for (let col = 0; col < numVars; col++) {
        let basicRow = -1;
        let nonZeroCount = 0;
        
        for (let row = 0; row < tableau.length - 1; row++) {
            if (Math.abs(tableau[row][col]) > 1e-10) {
                nonZeroCount++;
                if (Math.abs(tableau[row][col] - 1) < 1e-10) {
                    basicRow = row;
                }
            }
        }
        
        if (nonZeroCount === 1 && basicRow !== -1) {
            solution.variables[col] = Math.max(0, tableau[basicRow][tableau[basicRow].length - 1]);
        }
    }
    
    // Valor óptimo
    const objRowIndex = tableau.length - 1;
    solution.optimalValue = problemData.optimization === 'max' 
        ? -tableau[objRowIndex][tableau[objRowIndex].length - 1]
        : tableau[objRowIndex][tableau[objRowIndex].length - 1];
    
    return solution;
}

// Funciones de visualización

function displayResults(solution, method) {
    iterations = solution.iterations;
    finalSolution = solution.finalSolution;
    currentIteration = 0;
    
    document.getElementById('resultsSection').style.display = 'block';
    document.getElementById('resultsSection').scrollIntoView({ behavior: 'smooth' });
    
    displayCurrentIteration();
    displayFinalSolution();
}

function displayCurrentIteration() {
    const container = document.getElementById('iterationsContainer');
    const counter = document.getElementById('iterationCounter');
    
    if (iterations.length === 0) return;
    
    const iteration = iterations[currentIteration];
    counter.textContent = `${iteration.phase} - Iteración ${iteration.iteration}`;
    
    container.innerHTML = '';
    
    // Crear tabla
    const table = createSimplexTable(iteration.tableau, iteration.pivotRow, iteration.pivotCol);
    container.appendChild(table);
    
    // Actualizar botones de navegación
    document.getElementById('prevBtn').disabled = currentIteration === 0;
    document.getElementById('nextBtn').disabled = currentIteration === iterations.length - 1;
    
    // Agregar explicación del paso
    if (iteration.iteration > 0) {
        const explanation = document.createElement('div');
        explanation.className = 'method-explanation';
        explanation.innerHTML = `
            <h4>Operación realizada:</h4>
            <p>Elemento pivote en fila ${iteration.pivotRow + 1}, columna ${iteration.pivotCol + 1}</p>
            <p>Valor del pivote: ${iteration.tableau[iteration.pivotRow][iteration.pivotCol].toFixed(4)}</p>
        `;
        container.appendChild(explanation);
    }
}

function createSimplexTable(tableau, pivotRow = -1, pivotCol = -1) {
    const table = document.createElement('table');
    table.className = 'simplex-table';
    
    // Cabeceras
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    headerRow.appendChild(createTableCell('th', 'Base'));
    
    // Variables originales
    for (let i = 0; i < numVars; i++) {
        headerRow.appendChild(createTableCell('th', `x${i + 1}`));
    }
    
    // Variables de holgura/artificiales
    for (let i = numVars; i < tableau[0].length - 1; i++) {
        headerRow.appendChild(createTableCell('th', `s${i - numVars + 1}`));
    }
    
    headerRow.appendChild(createTableCell('th', 'RHS'));
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Cuerpo de la tabla
    const tbody = document.createElement('tbody');
    
    for (let i = 0; i < tableau.length; i++) {
        const row = document.createElement('tr');
        
        // Columna base
        const baseCell = createTableCell('td', i === tableau.length - 1 ? 'Z' : `x${findBasicVariable(tableau, i) + 1}`);
        row.appendChild(baseCell);
        
        // Valores
        for (let j = 0; j < tableau[i].length; j++) {
            const value = Math.abs(tableau[i][j]) < 1e-10 ? 0 : tableau[i][j];
            const cell = createTableCell('td', value.toFixed(4));
            
            // Resaltar elemento pivote
            if (i === pivotRow && j === pivotCol) {
                cell.classList.add('pivot-element');
            } else if (i === pivotRow) {
                cell.classList.add('pivot-row');
            } else if (j === pivotCol) {
                cell.classList.add('pivot-column');
            }
            
            row.appendChild(cell);
        }
        
        tbody.appendChild(row);
    }
    
    table.appendChild(tbody);
    return table;
}

function findBasicVariable(tableau, rowIndex) {
    if (rowIndex === tableau.length - 1) return -1; // Fila objetivo
    
    for (let col = 0; col < tableau[rowIndex].length - 1; col++) {
        if (Math.abs(tableau[rowIndex][col] - 1) < 1e-10) {
            // Verificar que es la única entrada no cero en la columna
            let isBasic = true;
            for (let row = 0; row < tableau.length; row++) {
                if (row !== rowIndex && Math.abs(tableau[row][col]) > 1e-10) {
                    isBasic = false;
                    break;
                }
            }
            if (isBasic) return col;
        }
    }
    return numVars + rowIndex; // Variable de holgura por defecto
}

function createTableCell(type, content) {
    const cell = document.createElement(type);
    cell.textContent = content;
    return cell;
}

function displayFinalSolution() {
    const container = document.getElementById('finalSolution');
    
    if (!finalSolution) {
        container.innerHTML = '<p>No hay solución disponible.</p>';
        return;
    }
    
    const solutionDiv = document.createElement('div');
    solutionDiv.className = 'solution-display';
    
    solutionDiv.innerHTML = `
        <h3>🎯 Solución Óptima Encontrada</h3>
        <div class="solution-variables">
            ${finalSolution.variables.map((value, index) => `
                <div class="variable-result">
                    <div class="variable-name">x${index + 1}</div>
                    <div class="variable-value">${value.toFixed(4)}</div>
                </div>
            `).join('')}
        </div>
        <div class="optimal-value">
            Valor óptimo de Z = ${finalSolution.optimalValue.toFixed(4)}
        </div>
        <div class="status-optimal">
            Estado: ${finalSolution.status === 'optimal' ? 'Solución Óptima' : finalSolution.status}
        </div>
    `;
    
    container.innerHTML = '';
    container.appendChild(solutionDiv);
}

// Funciones de navegación

function previousIteration() {
    if (currentIteration > 0) {
        currentIteration--;
        displayCurrentIteration();
    }
}

function nextIteration() {
    if (currentIteration < iterations.length - 1) {
        currentIteration++;
        displayCurrentIteration();
    }
}

function showTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // Desactivar todos los botones
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });
    
    // Mostrar contenido seleccionado
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // Activar botón seleccionado
    event.target.classList.add('active');
}

// Funciones auxiliares

function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// Función para limpiar los resultados
function clearResults() {
    document.getElementById('resultsSection').style.display = 'none';
    iterations = [];
    currentIteration = 0;
    finalSolution = null;
}

// Función para exportar resultados
function exportResults() {
    if (!finalSolution) {
        alert('No hay resultados para exportar.');
        return;
    }
    
    let exportData = `Resultados del Solucionador de Programación Lineal\n`;
    exportData += `=====================================================\n\n`;
    exportData += `Método utilizado: ${iterations[0].phase}\n`;
    exportData += `Total de iteraciones: ${iterations.length - 1}\n\n`;
    
    exportData += `Solución óptima:\n`;
    finalSolution.variables.forEach((value, index) => {
        exportData += `x${index + 1} = ${value.toFixed(4)}\n`;
    });
    exportData += `Valor óptimo de Z = ${finalSolution.optimalValue.toFixed(4)}\n`;
    
    // Crear y descargar archivo
    const blob = new Blob([exportData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultados_programacion_lineal.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
}

// Función para validar entrada de datos
function validateInputs() {
    const objectiveInputs = [];
    for (let i = 0; i < numVars; i++) {
        const value = document.getElementById(`obj_${i}`).value;
        if (value === '' || isNaN(value)) {
            return { valid: false, message: `El coeficiente de x${i + 1} en la función objetivo no es válido.` };
        }
        objectiveInputs.push(parseFloat(value));
    }
    
    // Verificar que al menos un coeficiente objetivo no sea cero
    if (objectiveInputs.every(coef => coef === 0)) {
        return { valid: false, message: 'La función objetivo no puede tener todos los coeficientes en cero.' };
    }
    
    // Validar restricciones
    for (let i = 0; i < numConstraints; i++) {
        const rhs = document.getElementById(`rhs_${i}`).value;
        if (rhs === '' || isNaN(rhs)) {
            return { valid: false, message: `El valor del lado derecho de la restricción ${i + 1} no es válido.` };
        }
        
        // Verificar que el RHS sea no negativo para métodos que lo requieren
        if (parseFloat(rhs) < 0) {
            return { valid: false, message: `El valor del lado derecho de la restricción ${i + 1} debe ser no negativo.` };
        }
        
        for (let j = 0; j < numVars; j++) {
            const coef = document.getElementById(`const_${i}_${j}`).value;
            if (coef === '' || isNaN(coef)) {
                return { valid: false, message: `El coeficiente de x${j + 1} en la restricción ${i + 1} no es válido.` };
            }
        }
    }
    
    return { valid: true };
}

// Función mejorada para resolver problemas
function solveProblemImproved() {
    try {
        // Limpiar resultados anteriores
        clearResults();
        
        // Validar entradas
        const validation = validateInputs();
        if (!validation.valid) {
            alert(validation.message);
            return;
        }
        
        // Obtener datos del problema
        const problemData = collectProblemData();
        
        // Resolver según el método seleccionado
        const method = document.getElementById('method').value;
        let solution;
        
        // Mostrar mensaje de procesamiento
        const loadingMsg = document.createElement('div');
        loadingMsg.id = 'loadingMessage';
        loadingMsg.className = 'method-explanation';
        loadingMsg.innerHTML = '<h4>🔄 Procesando...</h4><p>Resolviendo el problema de programación lineal...</p>';
        document.body.appendChild(loadingMsg);
        
        setTimeout(() => {
            try {
                switch (method) {
                    case 'simplex':
                        solution = solveWithSimplex(problemData);
                        break;
                    case 'dosFases':
                        solution = solveWithTwoPhase(problemData);
                        break;
                    case 'bigM':
                        solution = solveWithBigM(problemData);
                        break;
                    default:
                        throw new Error('Método no válido');
                }
                
                // Remover mensaje de carga
                const loading = document.getElementById('loadingMessage');
                if (loading) loading.remove();
                
                // Mostrar resultados
                displayResults(solution, method);
                
            } catch (error) {
                // Remover mensaje de carga
                const loading = document.getElementById('loadingMessage');
                if (loading) loading.remove();
                
                console.error('Error al resolver el problema:', error);
                alert('Error al resolver el problema: ' + error.message);
            }
        }, 100);
        
    } catch (error) {
        console.error('Error general:', error);
        alert('Error general: ' + error.message);
    }
}

// Función para mostrar ayuda
function showHelp() {
    const helpContent = `
    <div class="method-explanation">
        <h4>📖 Ayuda - Solucionador de Programación Lineal</h4>
        <p><strong>Método Simplex:</strong> Para problemas con restricciones ≤ únicamente.</p>
        <p><strong>Método de Dos Fases:</strong> Para problemas con cualquier tipo de restricciones (≤, ≥, =).</p>
        <p><strong>Método de la M Grande:</strong> Alternativa al método de dos fases para restricciones mixtas.</p>
        
        <h5>Cómo usar:</h5>
        <ol>
            <li>Defina el número de variables y restricciones</li>
            <li>Ingrese los coeficientes de la función objetivo</li>
            <li>Ingrese los coeficientes y operadores de las restricciones</li>
            <li>Seleccione si desea maximizar o minimizar</li>
            <li>Elija el método de resolución apropiado</li>
            <li>Haga clic en "Resolver Problema"</li>
        </ol>
        
        <p><strong>Nota:</strong> Todos los valores del lado derecho (RHS) deben ser no negativos.</p>
    </div>
    `;
    
    const helpDiv = document.createElement('div');
    helpDiv.innerHTML = helpContent;
    helpDiv.style.position = 'fixed';
    helpDiv.style.top = '50%';
    helpDiv.style.left = '50%';
    helpDiv.style.transform = 'translate(-50%, -50%)';
    helpDiv.style.backgroundColor = 'white';
    helpDiv.style.padding = '20px';
    helpDiv.style.borderRadius = '10px';
    helpDiv.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    helpDiv.style.zIndex = '1000';
    helpDiv.style.maxWidth = '80%';
    helpDiv.style.maxHeight = '80%';
    helpDiv.style.overflow = 'auto';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = '✕ Cerrar';
    closeBtn.className = 'btn btn-secondary';
    closeBtn.style.marginTop = '20px';
    closeBtn.onclick = () => document.body.removeChild(helpDiv);
    
    helpDiv.appendChild(closeBtn);
    document.body.appendChild(helpDiv);
}

// Reemplazar la función original solveProblem
window.solveProblem = solveProblemImproved;

// Inicialización mejorada
document.addEventListener('DOMContentLoaded', function() {
    // Generar inputs por defecto
    generateInputs();
    
    // Agregar efectos de animación
    document.querySelector('.container').classList.add('fade-in');
    
    // Agregar botones adicionales
    const buttonContainer = document.querySelector('#problemInputs');
    if (buttonContainer) {
        const helpBtn = document.createElement('button');
        helpBtn.textContent = '❓ Ayuda';
        helpBtn.className = 'btn btn-secondary';
        helpBtn.onclick = showHelp;
        helpBtn.style.marginLeft = '10px';
        
        const clearBtn = document.createElement('button');
        clearBtn.textContent = '🗑️ Limpiar';
        clearBtn.className = 'btn btn-secondary';
        clearBtn.onclick = () => {
            if (confirm('¿Está seguro de que desea limpiar todos los datos?')) {
                location.reload();
            }
        };
        clearBtn.style.marginLeft = '10px';
        
        // Encontrar el botón "Resolver Problema" y agregar los nuevos botones después
        setTimeout(() => {
            const solveBtn = buttonContainer.querySelector('button[onclick="solveProblem()"]');
            if (solveBtn) {
                solveBtn.parentNode.insertBefore(helpBtn, solveBtn.nextSibling);
                solveBtn.parentNode.insertBefore(clearBtn, helpBtn.nextSibling);
            }
        }, 100);
    }
    
    console.log('✅ Solucionador de Programación Lineal cargado correctamente');
});