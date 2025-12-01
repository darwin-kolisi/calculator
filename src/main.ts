const display = document.getElementById('display-main') as HTMLOutputElement;
const historyList = document.getElementById('history-list');
const buttons = document.querySelectorAll('.btn');
const modeIndicator = document.getElementById('angle-mode-indicator');
const clearHistoryBtn = document.getElementById('clear-history-btn');

let input = '0';
let lastAnswer = '0';
let angleMode: 'RAD' | 'DEG' = 'RAD';

function render() {
  if (display) display.value = input;
  if (modeIndicator) modeIndicator.textContent = angleMode;
}

function toRadians(x: number): number {
  return angleMode === 'DEG' ? (x * Math.PI) / 180 : x;
}

function clearZero() {
  if (input === '0') input = '';
}

function processToken(token: string): number {
  if (token === 'π') return Math.PI;
  if (token === 'e') return Math.E;
  if (token === 'Ans') return parseFloat(lastAnswer);

  const sqrtMatch = token.match(/sqrt\(([^)]+)\)/);
  if (sqrtMatch) {
    const inner = calculate(sqrtMatch[1]);
    return Math.sqrt(parseFloat(inner));
  }

  const sinMatch = token.match(/sin\(([^)]+)\)/);
  if (sinMatch) {
    const inner = calculate(sinMatch[1]);
    return Math.sin(toRadians(parseFloat(inner)));
  }

  const cosMatch = token.match(/cos\(([^)]+)\)/);
  if (cosMatch) {
    const inner = calculate(cosMatch[1]);
    return Math.cos(toRadians(parseFloat(inner)));
  }

  const tanMatch = token.match(/tan\(([^)]+)\)/);
  if (tanMatch) {
    const inner = calculate(tanMatch[1]);
    return Math.tan(toRadians(parseFloat(inner)));
  }

  const logMatch = token.match(/log\(([^)]+)\)/);
  if (logMatch) {
    const inner = calculate(logMatch[1]);
    return Math.log10(parseFloat(inner));
  }

  const lnMatch = token.match(/ln\(([^)]+)\)/);
  if (lnMatch) {
    const inner = calculate(lnMatch[1]);
    return Math.log(parseFloat(inner));
  }

  return parseFloat(token);
}

function calculate(expr: string): string {
  const parts = expr.split(/([+\-×÷^])/);
  let result = processToken(parts[0]);

  const operate = (a: number, operator: string, b: number) => {
    switch (operator) {
      case '+':
        return a + b;
      case '-':
        return a - b;
      case '×':
        return a * b;
      case '÷':
        return b === 0 ? NaN : a / b;
      case '^':
        return Math.pow(a, b);
      default:
        return 0;
    }
  };

  for (let i = 1; i < parts.length; i += 2) {
    const op = parts[i];
    const next = processToken(parts[i + 1]);
    if (isNaN(next)) return 'Error';
    result = operate(result, op, next);
  }

  return result.toString();
}

function addToHistory(expression: string, result: string) {
  if (!historyList || result === 'Error') return;

  const item = document.createElement('li');
  item.className = 'hist-item';

  item.innerHTML = `
    <span class="hist-eq">${expression} =</span>
    <span class="hist-res">${result}</span>
  `;

  historyList.prepend(item);
}

if (clearHistoryBtn) {
  clearHistoryBtn.addEventListener('click', () => {
    if (historyList) {
      historyList.innerHTML = '';
    }
  });
}

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const value = btn.textContent?.trim();
    if (!value) return;

    if (value === 'SHIFT') {
      angleMode = angleMode === 'RAD' ? 'DEG' : 'RAD';
      render();
      return;
    }

    if (value === 'ALPHA' || value === 'ON') return;

    if (value === 'AC') {
      input = '0';
    } else if (value === 'DEL') {
      input = input.length > 1 ? input.slice(0, -1) : '0';
    } else if (value === '=') {
      const oldInput = input;
      const result = calculate(input);
      lastAnswer = result;
      addToHistory(oldInput, result);
      input = result;
    } else {
      const ops = ['+', '-', '×', '÷', '^'];

      if (value === 'x²') {
        input += '^2';
      } else if (value === '√') {
        clearZero();
        input += 'sqrt(';
      } else if (value === 'xⁿ') {
        input += '^';
      } else if (['sin', 'cos', 'tan', 'log', 'ln'].includes(value)) {
        clearZero();
        input += `${value}(`;
      } else if (value === 'EXP') {
        clearZero();
        input += '×10^';
      } else if (value === 'Ans') {
        clearZero();
        input += 'Ans';
      } else if (value === 'π' || value === 'e') {
        clearZero();
        input += value;
      } else if (ops.includes(value)) {
        input += value;
      } else {
        if (value === '.') {
          input += value;
        } else {
          clearZero();
          input += value;
        }
      }
    }

    render();
  });
});
