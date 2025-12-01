const display = document.getElementById('display-main') as HTMLOutputElement;
const historyList = document.getElementById('history-list');
const buttons = document.querySelectorAll('.btn');

let input = '0';

function render() {
  if (display) display.value = input;
}

function processToken(token: string): number {
  if (token === 'π') return Math.PI;
  if (token === 'e') return Math.E;

  const sqrtMatch = token.match(/sqrt\(([^)]+)\)/);
  if (sqrtMatch) {
    const inner = parseFloat(sqrtMatch[1]);
    return Math.sqrt(inner);
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

buttons.forEach((btn) => {
  btn.addEventListener('click', () => {
    const value = btn.textContent?.trim();
    if (!value) return;

    if (value === 'AC') {
      input = '0';
    } else if (value === 'DEL') {
      input = input.length > 1 ? input.slice(0, -1) : '0';
    } else if (value === '=') {
      const oldInput = input;
      const result = calculate(input);

      addToHistory(oldInput, result);
      input = result;
    } else {
      const ops = ['+', '-', '×', '÷', '^'];

      if (value === 'x²') {
        input += '^2';
      } else if (value === '√') {
        if (input === '0') input = 'sqrt(';
        else input += 'sqrt(';
      } else if (value === 'xⁿ') {
        input += '^';
      } else if (value === 'π') {
        if (input === '0') input = 'π';
        else input += 'π';
      } else if (value === 'e') {
        if (input === '0') input = 'e';
        else input += 'e';
      } else {
        if (input === '0' && !ops.includes(value)) {
          input = value;
        } else {
          input += value;
        }
      }
    }

    render();
  });
});
