const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const keys = document.querySelectorAll(".key");

const MAX_INPUT_LENGTH = 16;

let currentValue = "0";
let previousValue = null;
let operator = null;
let waitingForNewNumber = false;
let lastExpression = "";
let lastOperator = null;
let lastOperand = null;

const operatorSymbols = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷"
};

function updateDisplay() {
    // Final safety guard: never allow the displayed number to exceed 16 characters.
    if (currentValue !== "Error") {
        currentValue = currentValue.slice(0, MAX_INPUT_LENGTH);
    }

    display.textContent = currentValue;

    if (previousValue !== null && operator) {
        const expressionValue = waitingForNewNumber ? "" : currentValue;
        expressionDisplay.textContent = `${formatNumber(previousValue)} ${operatorSymbols[operator]} ${expressionValue}`.trim();
    } else {
        expressionDisplay.textContent = lastExpression;
    }
}

function inputNumber(number) {
    if (currentValue === "Error" || waitingForNewNumber) {
        currentValue = number;
        waitingForNewNumber = false;
    } else if (currentValue === "0") {
        currentValue = number;
    } else if (currentValue.length < MAX_INPUT_LENGTH) {
        currentValue += number;
    }

    currentValue = currentValue.slice(0, MAX_INPUT_LENGTH);
    lastExpression = "";
    updateDisplay();
}

function inputDecimal() {
    if (currentValue === "Error" || waitingForNewNumber) {
        currentValue = "0.";
        waitingForNewNumber = false;
    } else if (!currentValue.includes(".") && currentValue.length < MAX_INPUT_LENGTH) {
        currentValue += ".";
    }

    currentValue = currentValue.slice(0, MAX_INPUT_LENGTH);
    lastExpression = "";
    updateDisplay();
}

function calculate(firstNumber, secondNumber, selectedOperator) {
    if (selectedOperator === "+") return firstNumber + secondNumber;
    if (selectedOperator === "-") return firstNumber - secondNumber;
    if (selectedOperator === "*") return firstNumber * secondNumber;

    if (selectedOperator === "/") {
        if (secondNumber === 0) return null;
        return firstNumber / secondNumber;
    }
}

function chooseOperator(nextOperator) {
    const inputValue = Number(currentValue);

    if (currentValue === "Error") return;

    if (operator === null && previousValue === null && waitingForNewNumber) {
        lastOperator = null;
        lastOperand = null;
    }

    if (operator && waitingForNewNumber) {
        operator = nextOperator;
        updateDisplay();
        return;
    }

    if (previousValue === null) {
        previousValue = inputValue;
    } else if (operator) {
        const result = calculate(previousValue, inputValue, operator);

        if (result === null || !Number.isFinite(result)) {
            currentValue = "Error";
            previousValue = null;
            operator = null;
            lastExpression = "Calculation error";
            updateDisplay();
            return;
        }

        previousValue = result;
        currentValue = formatNumber(result).slice(0, MAX_INPUT_LENGTH);
    }

    operator = nextOperator;
    waitingForNewNumber = true;
    lastExpression = "";
    updateDisplay();
}

function showResult() {
    if (!operator && previousValue === null && waitingForNewNumber && lastOperator !== null && lastOperand !== null) {
        const firstNumber = Number(currentValue);
        const result = calculate(firstNumber, lastOperand, lastOperator);
        const expression = `${formatNumber(firstNumber)} ${operatorSymbols[lastOperator]} ${formatNumber(lastOperand)} =`;

        if (result === null || !Number.isFinite(result)) {
            currentValue = "Error";
            lastExpression = expression;
            lastOperator = null;
            lastOperand = null;
        } else {
            currentValue = formatNumber(result).slice(0, MAX_INPUT_LENGTH);
            lastExpression = expression;
        }

        updateDisplay();
        return;
    }

    if (!operator || waitingForNewNumber || previousValue === null) return;

    const firstNumber = previousValue;
    const secondNumber = Number(currentValue);
    const selectedOperator = operator;
    const result = calculate(firstNumber, secondNumber, selectedOperator);
    const expression = `${formatNumber(firstNumber)} ${operatorSymbols[selectedOperator]} ${formatNumber(secondNumber)} =`;

    if (result === null || !Number.isFinite(result)) {
        currentValue = "Error";
        lastExpression = expression;
        lastOperator = null;
        lastOperand = null;
    } else {
        currentValue = formatNumber(result).slice(0, MAX_INPUT_LENGTH);
        lastExpression = expression;
        lastOperator = selectedOperator;
        lastOperand = secondNumber;
    }

    previousValue = null;
    operator = null;
    waitingForNewNumber = true;

    updateDisplay();
}

function formatNumber(number) {
    return Number(number.toFixed(10)).toString();
}

function clearCalculator() {
    currentValue = "0";
    previousValue = null;
    operator = null;
    waitingForNewNumber = false;
    lastExpression = "";
    lastOperator = null;
    lastOperand = null;

    updateDisplay();
}

function deleteLastCharacter() {
    if (currentValue === "Error" || waitingForNewNumber) {
        currentValue = "0";
        waitingForNewNumber = false;
    } else {
        currentValue = currentValue.length > 1
            ? currentValue.slice(0, -1)
            : "0";
    }

    lastExpression = "";
    updateDisplay();
}

function handleInput(value) {
    if (/^\d$/.test(value)) {
        inputNumber(value);
    } else if (value === ".") {
        inputDecimal();
    } else if (["+", "-", "*", "/"].includes(value)) {
        chooseOperator(value);
    } else if (value === "=" || value === "Enter") {
        showResult();
    } else if (value === "Backspace") {
        deleteLastCharacter();
    } else if (value === "Escape") {
        clearCalculator();
    }
}

function flashKey(value) {
    const key = [...keys].find((button) => button.dataset.value === value);
    if (!key) return;

    key.classList.add("keyboard-active");
    window.setTimeout(() => key.classList.remove("keyboard-active"), 120);
}

keys.forEach((key) => {
    key.addEventListener("click", () => {
        const { value, action } = key.dataset;

        if (action === "clear") {
            clearCalculator();
        } else if (action === "delete") {
            deleteLastCharacter();
        } else if (action === "calculate") {
            showResult();
        } else {
            handleInput(value);
        }
    });
});

document.addEventListener("keydown", (event) => {
    const allowedKeys = [
        "0", "1", "2", "3", "4",
        "5", "6", "7", "8", "9",
        ".", "+", "-", "*", "/",
        "Enter", "Backspace", "Escape"
    ];

    if (!allowedKeys.includes(event.key)) return;

    event.preventDefault();
    handleInput(event.key);

    if (/^\d$/.test(event.key) || [".", "+", "-", "*", "/"].includes(event.key)) {
        flashKey(event.key);
    } else if (event.key === "Enter") {
        flashKey("=");
    } else if (event.key === "Backspace") {
        const key = document.querySelector('[data-action="delete"]');
        key?.classList.add("keyboard-active");
        window.setTimeout(() => key?.classList.remove("keyboard-active"), 120);
    } else if (event.key === "Escape") {
        const key = document.querySelector('[data-action="clear"]');
        key?.classList.add("keyboard-active");
        window.setTimeout(() => key?.classList.remove("keyboard-active"), 120);
    }
});

updateDisplay();
