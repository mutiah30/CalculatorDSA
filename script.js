// NeonCalculator class encapsulates all logic for the calculator system
class NeonCalculator {
    constructor() {
        // Initialize references to DOM elements
        this.inputField = document.getElementById('inputField');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.historyContainer = document.getElementById('historyContainer');
        this.historyList = document.getElementById('historyList');
        this.history = []; // Stores history of calculations
        
        this.initializeEventListeners(); // Set up UI event listeners
    }
    
    // Sets up all event listeners for buttons and inputs
    initializeEventListeners() {
        // Trigger evaluation on Enter key press
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.evaluateExpression();
            }
        });
        
        // Keypad button click handlers
        document.querySelectorAll('.keypad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleKeypadInput(e.target);
            });
        });
        
        // Functional button handlers
        document.getElementById('evaluateBtn').addEventListener('click', () => {
            this.evaluateExpression();
        });
        
        document.getElementById('clearAllBtn').addEventListener('click', () => {
            this.clearAll();
        });
        
        document.getElementById('clearHistoryBtn').addEventListener('click', () => {
            this.clearHistory();
        });
        
        document.getElementById('clearInputBtn').addEventListener('click', () => {
            this.clearInput();
        });
    }
    
    // Handles logic for keypad inputs and actions (evaluate, clear, backspace)
    handleKeypadInput(button) {
        const value = button.dataset.value;
        const action = button.dataset.action;
        
        if (value) {
            this.inputField.value += value;
        } else if (action) {
            switch (action) {
                case 'evaluate':
                    this.evaluateExpression();
                    break;
                case 'clear':
                    this.clearInput();
                    break;
                case 'backspace':
                    this.inputField.value = this.inputField.value.slice(0, -1);
                    break;
            }
        }
        
        // Adds simple animation effect to the button
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }
    
    // Handles full expression evaluation process
    evaluateExpression() {
        const expression = this.inputField.value.trim();
        
        if (!expression) {
            this.showResult('Please enter an expression', 'error');
            return;
        }
        
        try {
            // Validate expression format and characters
            if (!this.isValidExpression(expression)) {
                this.showResult('Invalid input', 'error');
                this.addToHistory(expression, 'Invalid input', 'error');
                return;
            }
            
            // Evaluate expression and display result
            const result = this.evaluate(expression);
            const resultText = this.formatResult(result);
            
            this.showResult(resultText, 'success');
            this.addToHistory(expression, resultText, 'success');
            
        } catch (error) {
            // Catch and handle runtime errors such as division by zero
            this.showResult('Invalid input', 'error');
            this.addToHistory(expression, 'Invalid input', 'error');
        }
    }
    
    // Validates an expression for correct characters and balanced parentheses
    isValidExpression(expression) {
        expression = expression.replace(/\s+/g, ''); // Remove spaces
        
        // Check for any illegal characters
        if (!/^[0-9+\-*/().]+$/.test(expression)) {
            return false;
        }
        
        // Parentheses balancing check
        let parenthesesCount = 0;
        for (let char of expression) {
            if (char === '(') parenthesesCount++;
            if (char === ')') parenthesesCount--;
            if (parenthesesCount < 0) return false; // Early mismatch
        }
        
        return parenthesesCount === 0; // Must end with balanced parentheses
    }
    
    // Core infix expression evaluation using stacks
    evaluate(expression) {
        expression = expression.replace(/\s+/g, ''); // Clean input
        
        const values = [];    // Stack for numbers
        const operators = []; // Stack for operators
        
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            
            // If digit, parse full number (including decimals)
            if (/\d/.test(char)) {
                let numStr = '';
                while (i < expression.length && (/\d/.test(expression[i]) || expression[i] === '.')) {
                    numStr += expression[i++];
                }
                i--; // Adjust index after while loop
                values.push(parseFloat(numStr));
            } 
            else if (char === '(') {
                operators.push(char);
            } 
            else if (char === ')') {
                // Evaluate inside parentheses
                while (operators[operators.length - 1] !== '(') {
                    values.push(this.applyOperation(operators.pop(), values.pop(), values.pop()));
                }
                operators.pop(); // Remove the '(' from stack
            } 
            else if (/[+\-*/]/.test(char)) {
                // Operator precedence check before pushing new operator
                while (operators.length && this.hasPrecedence(char, operators[operators.length - 1])) {
                    values.push(this.applyOperation(operators.pop(), values.pop(), values.pop()));
                }
                operators.push(char);
            }
        }
        
        // Apply remaining operations
        while (operators.length) {
            values.push(this.applyOperation(operators.pop(), values.pop(), values.pop()));
        }
        
        return values[0]; // Final result
    }
    
    // Determines if op2 has higher or equal precedence than op1
    hasPrecedence(op1, op2) {
        if (op2 === '(' || op2 === ')') return false;
        if ((op1 === '*' || op1 === '/') && (op2 === '+' || op2 === '-')) return false;
        return true;
    }
    
    // Applies a binary arithmetic operation
    applyOperation(op, b, a) {
        switch (op) {
            case '+': return a + b;
            case '-': return a - b;
            case '*': return a * b;
            case '/':
                if (b === 0) throw new Error('Division by zero');
                return a / b;
            default: return 0;
        }
    }
    
    // Converts result to a cleaner format (removes decimal if not needed)
    formatResult(result) {
        return result % 1 === 0 ? result.toString() : result.toString();
    }
    
    // Displays result or error message in the result area
    showResult(text, type) {
        this.resultDisplay.textContent = text;
        this.resultDisplay.className = `result-display ${type}`;
    }
    
    // Adds calculation to history and updates display
    addToHistory(expression, result, type) {
        this.history.push({ expression, result, type });
        this.updateHistoryDisplay();
    }
    
    // Updates the on-screen history list with previous calculations
    updateHistoryDisplay() {
        this.historyList.innerHTML = ''; // Clear existing items
        
        if (this.history.length === 0) {
            const emptyItem = document.createElement('li');
            emptyItem.className = 'history-empty';
            emptyItem.textContent = 'No calculations yet';
            this.historyList.appendChild(emptyItem);
        } else {
            this.history.forEach((entry, index) => {
                const listItem = document.createElement('li');
                listItem.className = 'history-item';
                
                const expressionSpan = document.createElement('span');
                expressionSpan.className = 'history-expression';
                expressionSpan.textContent = entry.expression;
                
                const resultSpan = document.createElement('span');
                resultSpan.className = `history-result ${entry.type}`;
                resultSpan.textContent = entry.result;
                
                listItem.appendChild(expressionSpan);
                listItem.appendChild(resultSpan);
                
                this.historyList.appendChild(listItem);
            });
        }
        
        // Scroll to bottom automatically
        this.historyContainer.scrollTop = this.historyContainer.scrollHeight;
    }
    
    // Clears only the input field
    clearInput() {
        this.inputField.value = '';
        this.resultDisplay.textContent = 'Enter an expression to see the result';
        this.resultDisplay.className = 'result-display';
        this.inputField.focus();
    }
    
    // Clears calculation history
    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
    }
    
    // Clears both input and history
    clearAll() {
        this.clearInput();
        this.clearHistory();
    }
}

// Run calculator after page fully loads
window.addEventListener('DOMContentLoaded', () => {
    new NeonCalculator();
});
