class NeonCalculator {
    constructor() {
        this.inputField = document.getElementById('inputField');
        this.resultDisplay = document.getElementById('resultDisplay');
        this.historyContainer = document.getElementById('historyContainer');
        this.historyList = document.getElementById('historyList');
        this.history = [];
        
        this.initializeEventListeners();
    }
    
    initializeEventListeners() {
        // Input field events
        this.inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.evaluateExpression();
            }
        });
        
        // Keypad events
        document.querySelectorAll('.keypad-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleKeypadInput(e.target);
            });
        });
        
        // Button events
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
        
        // Add visual feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 100);
    }
    
    evaluateExpression() {
        const expression = this.inputField.value.trim();
        
        if (!expression) {
            this.showResult('Please enter an expression', 'error');
            return;
        }
        
        try {
            if (!this.isValidExpression(expression)) {
                this.showResult('Invalid input', 'error');
                this.addToHistory(expression, 'Invalid input', 'error');
                return;
            }
            
            const result = this.evaluate(expression);
            const resultText = this.formatResult(result);
            
            this.showResult(resultText, 'success');
            this.addToHistory(expression, resultText, 'success');
            
        } catch (error) {
            this.showResult('Invalid input', 'error');
            this.addToHistory(expression, 'Invalid input', 'error');
        }
    }
    
    isValidExpression(expression) {
        // Remove spaces
        expression = expression.replace(/\s+/g, '');
        
        // Check for invalid characters
        if (!/^[0-9+\-*/().]+$/.test(expression)) {
            return false;
        }
        
        // Check balanced parentheses
        let parenthesesCount = 0;
        for (let char of expression) {
            if (char === '(') parenthesesCount++;
            if (char === ')') parenthesesCount--;
            if (parenthesesCount < 0) return false;
        }
        
        return parenthesesCount === 0;
    }
    
    evaluate(expression) {
        // Remove spaces
        expression = expression.replace(/\s+/g, '');
        
        const values = [];
        const operators = [];
        
        for (let i = 0; i < expression.length; i++) {
            const char = expression[i];
            
            if (/\d/.test(char)) {
                let numStr = '';
                while (i < expression.length && (/\d/.test(expression[i]) || expression[i] === '.')) {
                    numStr += expression[i++];
                }
                i--; // Adjust for the extra increment
                values.push(parseFloat(numStr));
            } else if (char === '(') {
                operators.push(char);
            } else if (char === ')') {
                while (operators[operators.length - 1] !== '(') {
                    values.push(this.applyOperation(operators.pop(), values.pop(), values.pop()));
                }
                operators.pop(); // Remove '('
            } else if (/[+\-*/]/.test(char)) {
                while (operators.length && this.hasPrecedence(char, operators[operators.length - 1])) {
                    values.push(this.applyOperation(operators.pop(), values.pop(), values.pop()));
                }
                operators.push(char);
            }
        }
        
        while (operators.length) {
            values.push(this.applyOperation(operators.pop(), values.pop(), values.pop()));
        }
        
        return values[0];
    }
    
    hasPrecedence(op1, op2) {
        if (op2 === '(' || op2 === ')') return false;
        if ((op1 === '*' || op1 === '/') && (op2 === '+' || op2 === '-')) return false;
        return true;
    }
    
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
    
    formatResult(result) {
        return result % 1 === 0 ? result.toString() : result.toString();
    }
    
    showResult(text, type) {
        this.resultDisplay.textContent = text;
        this.resultDisplay.className = `result-display ${type}`;
    }
    
    addToHistory(expression, result, type) {
        this.history.push({ expression, result, type });
        this.updateHistoryDisplay();
    }
    
    updateHistoryDisplay() {
        // Clear the list first
        this.historyList.innerHTML = '';
        
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
        
        // Auto-scroll to bottom
        this.historyContainer.scrollTop = this.historyContainer.scrollHeight;
    }
    
    clearInput() {
        this.inputField.value = '';
        this.resultDisplay.textContent = 'Enter an expression to see the result';
        this.resultDisplay.className = 'result-display';
        this.inputField.focus();
    }
    
    clearHistory() {
        this.history = [];
        this.updateHistoryDisplay();
    }
    
    clearAll() {
        this.clearInput();
        this.clearHistory();
    }
}

// Initialize calculator when page loads
window.addEventListener('DOMContentLoaded', () => {
    new NeonCalculator();
});