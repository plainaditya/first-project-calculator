const display = document.getElementById("display");
const expressionDisplay = document.getElementById("expression");
const keys = document.querySelectorAll(".key");
const themeToggle = document.getElementById("themeToggle");
const themeThumb = themeToggle?.querySelector(".theme-thumb");
const root = document.documentElement;
const themeMeta = document.getElementById("themeColor");
const basicMode = document.getElementById("basicMode");
const scientificMode = document.getElementById("scientificMode");
const historyToggle = document.getElementById("historyToggle");
const historyPanel = document.getElementById("historyPanel");
const historyList = document.getElementById("historyList");
const historyCount = document.getElementById("historyCount");
const clearHistoryButton = document.getElementById("clearHistory");
const copyResult = document.getElementById("copyResult");
const toast = document.getElementById("toast");

const MAX_INPUT_LENGTH = 16;
const THEME_KEY = "calculator-theme";
const HISTORY_KEY = "calculator-history";
const ANGLE_KEY = "calculator-angle";

let expression = "";
let lastExpression = "";
let repeatExpression = null;
let justCalculated = false;
let memory = 0;
let angleMode = "DEG";
let toastTimer = null;

function applyTheme(theme, persist = false) {
    const isLight = theme === "light";
    root.dataset.theme = isLight ? "light" : "dark";
    themeToggle?.setAttribute("aria-checked", String(isLight));
    themeToggle?.setAttribute("aria-label", isLight ? "Switch to dark mode" : "Switch to light mode");
    if (themeThumb) themeThumb.textContent = isLight ? "☀" : "☾";
    themeMeta?.setAttribute("content", isLight ? "#edf3f8" : "#070b12");
    if (persist) localStorage.setItem(THEME_KEY, isLight ? "light" : "dark");
}
function initializeTheme() {
    let saved = null;
    try { saved = localStorage.getItem(THEME_KEY); } catch {}
    if (saved !== "light" && saved !== "dark") saved = window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
    applyTheme(saved);
}
function toggleTheme() { applyTheme(root.dataset.theme === "light" ? "dark" : "light", true); }

function setMode(mode) {
    const scientific = mode === "scientific";
    root.dataset.mode = scientific ? "scientific" : "basic";
    basicMode?.classList.toggle("active", !scientific);
    scientificMode?.classList.toggle("active", scientific);
    document.getElementById("scientificTools")?.setAttribute("aria-hidden", String(!scientific));
    document.getElementById("scientificKeys")?.setAttribute("aria-hidden", String(!scientific));
}
function loadAngleMode() {
    try { angleMode = localStorage.getItem(ANGLE_KEY) === "RAD" ? "RAD" : "DEG"; } catch { angleMode = "DEG"; }
    document.querySelectorAll(".angle-button").forEach(button => button.classList.toggle("active", button.dataset.angle === angleMode));
}
function setAngleMode(mode) {
    angleMode = mode === "RAD" ? "RAD" : "DEG";
    try { localStorage.setItem(ANGLE_KEY, angleMode); } catch {}
    document.querySelectorAll(".angle-button").forEach(button => button.classList.toggle("active", button.dataset.angle === angleMode));
}
function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 1400);
}
function formatNumber(number) {
    if (!Number.isFinite(number)) return "Error";
    return Number(number.toPrecision(12)).toString();
}
function fitDisplayText() {
    if (!display) return;
    const value = display.textContent || "0";
    const width = display.clientWidth || 420;
    const canvas = fitDisplayText.canvas || (fitDisplayText.canvas = document.createElement("canvas"));
    const context = canvas.getContext("2d");
    if (!context) return;
    const styles = getComputedStyle(display);
    let size = Math.min(48, Math.max(26, 48 - Math.max(0, value.length - 8) * 1.2));
    context.font = `${styles.fontWeight} ${size}px ${styles.fontFamily}`;
    const measured = context.measureText(value).width;
    if (measured > width - 8) size *= (width - 8) / measured;
    else if (value.length >= 10) size = Math.min(48, size * Math.min(1.2, (width - 8) / measured));
    display.style.fontSize = `${Math.max(24, Math.min(48, size))}px`;
}
function updateDisplay() {
    display.textContent = expression || "0";
    expressionDisplay.textContent = lastExpression;
    fitDisplayText();
}
function currentNumberToken() {
    const match = expression.match(/(?:^|[+\-*/^(])(-?\d*\.?\d*)$/);
    return match ? match[1] : null;
}
function currentDigitCount() {
    const token = currentNumberToken();
    return token === null ? 0 : token.replace(".", "").replace("-", "").length;
}
function appendNumber(value) {
    if (justCalculated) { expression = ""; lastExpression = ""; justCalculated = false; }
    if (expression === "Error") expression = "";
    if (currentDigitCount() >= MAX_INPUT_LENGTH) { showToast("16-digit limit reached"); return; }
    if (expression === "0") expression = "";
    expression += value;
    repeatExpression = null;
    lastExpression = "";
    updateDisplay();
}
function appendDecimal() {
    if (justCalculated) { expression = ""; lastExpression = ""; justCalculated = false; }
    const token = currentNumberToken();
    if (token === null || token.includes(".")) return;
    if (currentDigitCount() >= MAX_INPUT_LENGTH) return;
    expression += token === "" || token === "-" ? "0." : ".";
    repeatExpression = null;
    updateDisplay();
}
function appendOperator(op) {
    if (justCalculated) { justCalculated = false; }
    if (!expression || expression === "Error") return;
    if (/[+\-*/^]$/.test(expression)) expression = expression.slice(0, -1) + op;
    else expression += op;
    lastExpression = "";
    repeatExpression = null;
    updateDisplay();
}
function appendParenthesis(value) {
    if (justCalculated) { expression = ""; lastExpression = ""; justCalculated = false; }
    if (value === "(") {
        if (expression && /[\d)πe]$/.test(expression)) expression += "*";
        expression += "(";
    } else {
        const opens = (expression.match(/\(/g) || []).length;
        const closes = (expression.match(/\)/g) || []).length;
        if (opens <= closes || /[+\-*/^(]$/.test(expression)) return;
        expression += ")";
    }
    repeatExpression = null;
    updateDisplay();
}
function appendFunction(fn) {
    if (justCalculated) { expression = ""; lastExpression = ""; justCalculated = false; }
    if (expression && /[\d)πe]$/.test(expression)) expression += "*";
    expression += fn;
    repeatExpression = null;
    updateDisplay();
}
function appendConstant(value) {
    if (justCalculated) { expression = ""; lastExpression = ""; justCalculated = false; }
    if (expression && /[\d)πe]$/.test(expression)) expression += "*";
    expression += value;
    repeatExpression = null;
    updateDisplay();
}
function factorial(n) {
    if (!Number.isInteger(n) || n < 0 || n > 170) throw new Error("Factorial is limited to 0–170");
    let result = 1;
    for (let i = 2; i <= n; i++) result *= i;
    return result;
}

function tokenize(input) {
    const tokens = [];
    let i = 0;
    while (i < input.length) {
        const c = input[i];
        if (/\s/.test(c)) { i++; continue; }
        if (/[0-9.]/.test(c)) {
            const start = i;
            while (i < input.length && /[0-9.]/.test(input[i])) i++;
            const raw = input.slice(start, i);
            if ((raw.match(/\./g) || []).length > 1 || raw === ".") throw new Error("Invalid number");
            tokens.push({ type: "number", value: Number(raw) });
            continue;
        }
        if (/[a-zA-Zπ]/.test(c)) {
            const start = i;
            while (i < input.length && /[a-zA-Zπ]/.test(input[i])) i++;
            tokens.push({ type: "name", value: input.slice(start, i) });
            continue;
        }
        if ("+-*/^()!".includes(c)) { tokens.push({ type: c, value: c }); i++; continue; }
        throw new Error("Unknown character");
    }
    return tokens;
}

function evaluate(input) {
    const tokens = tokenize(input);
    let position = 0;
    const peek = () => tokens[position];
    const consume = () => tokens[position++];
    function parseExpression() {
        let value = parseTerm();
        while (peek() && (peek().type === "+" || peek().type === "-")) { const op = consume().type; const right = parseTerm(); value = op === "+" ? value + right : value - right; }
        return value;
    }
    function parseTerm() {
        let value = parsePower();
        while (peek() && (peek().type === "*" || peek().type === "/")) { const op = consume().type; const right = parsePower(); if (op === "/" && right === 0) throw new Error("Cannot divide by zero"); value = op === "*" ? value * right : value / right; }
        return value;
    }
    function parsePower() { let value = parseUnary(); if (peek()?.type === "^") { consume(); value = Math.pow(value, parsePower()); } return value; }
    function parseUnary() { if (peek()?.type === "+") { consume(); return parseUnary(); } if (peek()?.type === "-") { consume(); return -parseUnary(); } return parsePostfix(); }
    function parsePostfix() { let value = parsePrimary(); while (peek()?.type === "!") { consume(); value = factorial(value); } return value; }
    function parsePrimary() {
        const token = consume();
        if (!token) throw new Error("Incomplete expression");
        if (token.type === "number") return token.value;
        if (token.type === "(") { const value = parseExpression(); if (consume()?.type !== ")") throw new Error("Missing closing parenthesis"); return value; }
        if (token.type === "name") {
            if (token.value === "π" || token.value === "pi") return Math.PI;
            if (token.value === "e") return Math.E;
            const functions = ["sin", "cos", "tan", "ln", "log", "sqrt", "abs"];
            if (!functions.includes(token.value)) throw new Error("Unknown function");
            if (consume()?.type !== "(") throw new Error("Function needs parentheses");
            const arg = parseExpression();
            if (consume()?.type !== ")") throw new Error("Missing closing parenthesis");
            return applyFunction(token.value, arg);
        }
        throw new Error("Invalid expression");
    }
    const result = parseExpression();
    if (position < tokens.length) throw new Error("Incomplete expression");
    if (!Number.isFinite(result)) throw new Error("Result is outside the supported range");
    return result;
}
function applyFunction(name, value) {
    const angle = angleMode === "DEG" ? value * Math.PI / 180 : value;
    if (name === "sin") return Math.sin(angle);
    if (name === "cos") return Math.cos(angle);
    if (name === "tan") return Math.tan(angle);
    if (name === "ln") { if (value <= 0) throw new Error("ln requires a positive value"); return Math.log(value); }
    if (name === "log") { if (value <= 0) throw new Error("log requires a positive value"); return Math.log10(value); }
    if (name === "sqrt") { if (value < 0) throw new Error("√ requires a non-negative value"); return Math.sqrt(value); }
    if (name === "abs") return Math.abs(value);
    throw new Error("Unknown function");
}

function getHistory() { try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"); } catch { return []; } }
function saveHistory(history) { try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 30))); } catch {} }
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c])); }
function renderHistory() {
    const history = getHistory();
    historyCount.textContent = history.length;
    historyList.innerHTML = history.length ? history.map((item, index) => `<button class="history-item" type="button" data-history-index="${index}"><span class="history-expression">${escapeHtml(item.expression)}</span><span class="history-result">${escapeHtml(item.result)}</span></button>`).join("") : '<p class="history-empty">Your calculations will appear here.</p>';
}
function addHistory(expressionText, result) { const history = getHistory(); history.unshift({ expression: expressionText, result, time: Date.now() }); saveHistory(history); renderHistory(); }

function showResult() {
    if (justCalculated && repeatExpression) expression = repeatExpression;
    if (!expression || expression === "Error") return;
    const calculation = expression;
    try {
        const result = formatNumber(evaluate(calculation));
        lastExpression = `${calculation.replace(/\*/g, "×").replace(/\//g, "÷")} =`;
        repeatExpression = calculation;
        expression = result.slice(0, MAX_INPUT_LENGTH);
        justCalculated = true;
        updateDisplay();
        addHistory(lastExpression, result);
    } catch (error) {
        lastExpression = error.message;
        expression = "Error";
        repeatExpression = null;
        justCalculated = false;
        updateDisplay();
        showToast(error.message);
    }
}
function clearCalculator() { expression = ""; lastExpression = ""; repeatExpression = null; justCalculated = false; updateDisplay(); }
function deleteLastCharacter() { if (expression === "Error") return clearCalculator(); justCalculated = false; expression = expression.slice(0, -1); lastExpression = ""; repeatExpression = null; updateDisplay(); }
function toggleSign() { if (!expression || expression === "Error") return; justCalculated = false; expression = expression.startsWith("-") ? expression.slice(1) : `-(${expression})`; repeatExpression = null; updateDisplay(); }
function percentage() { const match = expression.match(/(\d*\.?\d+)$/); if (!match) return; justCalculated = false; expression = expression.slice(0, -match[1].length) + String(Number(match[1]) / 100); repeatExpression = null; updateDisplay(); }
function handleMemory(action) {
    if (action === "MC") memory = 0;
    if (action === "MR") { const value = formatNumber(memory); if (expression && /[\d)πe]$/.test(expression)) expression += "*"; expression += value; justCalculated = false; }
    if (action === "M+") { try { memory += evaluate(expression || "0"); } catch { showToast("Invalid memory value"); } }
    if (action === "M-") { try { memory -= evaluate(expression || "0"); } catch { showToast("Invalid memory value"); } }
    updateDisplay();
}
async function copyCurrentResult() { const value = display.textContent; if (!value || value === "Error") return; try { await navigator.clipboard.writeText(value); showToast("Result copied"); } catch { showToast("Copy unavailable"); } }
function flashKey(value) { const key = [...keys].find(button => button.dataset.value === value); if (!key) return; key.classList.add("keyboard-active"); setTimeout(() => key.classList.remove("keyboard-active"), 120); }

function handleKey(value) {
    if (/^\d$/.test(value)) appendNumber(value);
    else if (value === ".") appendDecimal();
    else if (["+","-","*","/","^"].includes(value)) appendOperator(value);
    else if (value === "(") appendParenthesis("(");
    else if (value === ")") appendParenthesis(")");
    else if (value === "Enter" || value === "=") showResult();
    else if (value === "Backspace") deleteLastCharacter();
    else if (value === "Escape") clearCalculator();
    else if (value === "%") percentage();
}

themeToggle?.addEventListener("click", toggleTheme);
basicMode?.addEventListener("click", () => setMode("basic"));
scientificMode?.addEventListener("click", () => setMode("scientific"));
copyResult?.addEventListener("click", copyCurrentResult);
historyToggle?.addEventListener("click", () => { const open = !historyPanel.classList.contains("open"); historyPanel.classList.toggle("open", open); historyPanel.setAttribute("aria-hidden", String(!open)); historyToggle.setAttribute("aria-expanded", String(open)); });
clearHistoryButton?.addEventListener("click", () => { saveHistory([]); renderHistory(); });
document.querySelectorAll(".angle-button").forEach(button => button.addEventListener("click", () => setAngleMode(button.dataset.angle)));
document.querySelectorAll(".memory-button").forEach(button => button.addEventListener("click", () => handleMemory(button.dataset.memory)));
historyList?.addEventListener("click", event => { const item = event.target.closest("[data-history-index]"); if (!item) return; const selected = getHistory()[Number(item.dataset.historyIndex)]; if (!selected) return; expression = selected.result.slice(0, MAX_INPUT_LENGTH); lastExpression = selected.expression; repeatExpression = null; justCalculated = false; updateDisplay(); });

keys.forEach(key => key.addEventListener("click", () => {
    const { value, action } = key.dataset;
    if (action === "clear") clearCalculator();
    else if (action === "delete") deleteLastCharacter();
    else if (action === "calculate") showResult();
    else if (action === "percent") percentage();
    else if (action === "sign") toggleSign();
    else if (/^\d$/.test(value)) appendNumber(value);
    else if (value === ".") appendDecimal();
    else if (["+","-","*","/","^"].includes(value)) appendOperator(value);
    else if (value === "(" || value === ")") appendParenthesis(value);
    else if (value === "pi" || value === "e") appendConstant(value);
    else if (value?.endsWith("(")) appendFunction(value);
    else if (value === "!") { if (expression && /[\d)]$/.test(expression)) expression += "!"; justCalculated = false; updateDisplay(); }
}));

document.addEventListener("keydown", event => {
    const supported = [..."0123456789.+-*/^()", "Enter", "Backspace", "Escape", "%"];
    if (!supported.includes(event.key)) return;
    event.preventDefault();
    handleKey(event.key);
    flashKey(event.key);
});

window.addEventListener("resize", fitDisplayText);
initializeTheme();
loadAngleMode();
setMode("basic");
renderHistory();
updateDisplay();
