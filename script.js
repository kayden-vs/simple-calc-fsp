const previousOperandEl = document.getElementById("previous-operand");
const currentOperandEl = document.getElementById("current-operand");
const keyContainer = document.querySelector(".keys");

const MAX_DIGITS = 14;

const state = {
  currentOperand: "0",
  previousOperand: null,
  operation: null,
  overwrite: false,
};

function formatNumber(value) {
  if (!Number.isFinite(value)) {
    return "Error";
  }

  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 8,
  }).format(value);
}

function updateDisplay() {
  currentOperandEl.textContent = state.currentOperand;

  if (state.operation && state.previousOperand !== null) {
    previousOperandEl.textContent = `${state.previousOperand} ${state.operation}`;
    return;
  }

  previousOperandEl.innerHTML = "&nbsp;";
}

function clearAll() {
  state.currentOperand = "0";
  state.previousOperand = null;
  state.operation = null;
  state.overwrite = false;
  updateDisplay();
}

function inputDigit(digit) {
  if (state.overwrite) {
    state.currentOperand = digit;
    state.overwrite = false;
    updateDisplay();
    return;
  }

  if (state.currentOperand === "0") {
    state.currentOperand = digit;
    updateDisplay();
    return;
  }

  if (state.currentOperand.replace("-", "").replace(".", "").length >= MAX_DIGITS) {
    return;
  }

  state.currentOperand += digit;
  updateDisplay();
}

function inputDecimal() {
  if (state.overwrite) {
    state.currentOperand = "0.";
    state.overwrite = false;
    updateDisplay();
    return;
  }

  if (!state.currentOperand.includes(".")) {
    state.currentOperand += ".";
    updateDisplay();
  }
}

function applyPercent() {
  const value = Number(state.currentOperand);
  state.currentOperand = formatNumber(value / 100);
  updateDisplay();
}

function toggleSign() {
  if (state.currentOperand === "0") {
    return;
  }

  if (state.currentOperand.startsWith("-")) {
    state.currentOperand = state.currentOperand.slice(1);
  } else {
    state.currentOperand = `-${state.currentOperand}`;
  }

  updateDisplay();
}

function deleteDigit() {
  if (state.overwrite) {
    state.currentOperand = "0";
    state.overwrite = false;
    updateDisplay();
    return;
  }

  if (state.currentOperand.length <= 1 || state.currentOperand === "-0") {
    state.currentOperand = "0";
  } else {
    state.currentOperand = state.currentOperand.slice(0, -1);
  }

  updateDisplay();
}

function calculate() {
  if (state.previousOperand === null || !state.operation) {
    return;
  }

  const prev = Number(state.previousOperand.replace(/,/g, ""));
  const curr = Number(state.currentOperand.replace(/,/g, ""));
  let result;

  switch (state.operation) {
    case "+":
      result = prev + curr;
      break;
    case "-":
      result = prev - curr;
      break;
    case "*":
      result = prev * curr;
      break;
    case "/":
      result = curr === 0 ? Number.NaN : prev / curr;
      break;
    default:
      return;
  }

  state.currentOperand = formatNumber(result);
  state.previousOperand = null;
  state.operation = null;
  state.overwrite = true;
  updateDisplay();
}

function chooseOperation(operation) {
  if (state.currentOperand === "Error") {
    clearAll();
    return;
  }

  if (state.previousOperand !== null && !state.overwrite) {
    calculate();
  }

  state.operation = operation;
  state.previousOperand = state.currentOperand;
  state.overwrite = true;
  updateDisplay();
}

keyContainer.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) {
    return;
  }

  const action = button.dataset.action;

  switch (action) {
    case "digit":
      inputDigit(button.dataset.value);
      break;
    case "decimal":
      inputDecimal();
      break;
    case "operation":
      chooseOperation(button.dataset.value);
      break;
    case "equals":
      calculate();
      break;
    case "clear":
      clearAll();
      break;
    case "delete":
      deleteDigit();
      break;
    case "percent":
      applyPercent();
      break;
    case "toggle-sign":
      toggleSign();
      break;
    default:
      break;
  }
});

document.addEventListener("keydown", (event) => {
  const { key } = event;

  if (/^\d$/.test(key)) {
    inputDigit(key);
    return;
  }

  if (key === ".") {
    inputDecimal();
    return;
  }

  if (["+", "-", "*", "/"].includes(key)) {
    chooseOperation(key);
    return;
  }

  if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
    return;
  }

  if (key === "Backspace") {
    deleteDigit();
    return;
  }

  if (key === "Escape") {
    clearAll();
  }
});

updateDisplay();
