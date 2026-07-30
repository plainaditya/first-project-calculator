const display = document.getElementById("display");
const keys = document.querySelectorAll(".key");

let currentValue = "0";
let previousValue = null;
let operator = null;
let waitingForNewNumber = false;


function updateDisplay() {
    display.textContent = currentValue;
}


function inputNumber(number) {
    if (currentValue === "Error" || waitingForNewNumber) {
        currentValue = number;
        waitingForNewNumber = false;
    } else if (currentValue === "0") {
        currentValue = number;
    } else {
        currentValue += number;
    }

    updateDisplay();
}


function inputDecimal() {
    if (currentValue === "Error" || waitingForNewNumber) {
        currentValue = "0.";
        waitingForNewNumber = false;
    } else if (!currentValue.includes(".")) {
        currentValue += ".";
    }

    updateDisplay();
}


function calculate(firstNumber, secondNumber, selectedOperator) {
    if (selectedOperator === "+") return firstNumber + secondNumber;
    if (selectedOperator === "-") return firstNumber - secondNumber;
    if (selectedOperator === "*") return firstNumber * secondNumber;

    if (selectedOperator === "/") {
        if (secondNumber === 0) {
            return null;
        }

        return firstNumber / secondNumber;
    }
}


function chooseOperator(nextOperator) {
    const inputValue = Number(currentValue);

    if (currentValue === "Error") return;

    if (operator && waitingForNewNumber) {
        operator = nextOperator;
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
            updateDisplay();
            return;
        }

        previousValue = result;
        currentValue = formatNumber(result);
    }

    operator = nextOperator;
    waitingForNewNumber = true;
    updateDisplay();
}


function showResult() {
    if (!operator || waitingForNewNumber || previousValue === null) return;

    const result = calculate(previousValue, Number(currentValue), operator);

    if (result === null || !Number.isFinite(result)) {
        currentValue = "Error";
    } else {
        currentValue = formatNumber(result);
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

    if (allowedKeys.includes(event.key)) {
        event.preventDefault();
        handleInput(event.key);
    }
});


updateDisplay();
