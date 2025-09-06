// Генератор задач для числового тренажёра

export type Operation = '+' | '-' | '*' | '/';
export type LawsMode = 'none' | 'five' | 'ten' | 'both';

export interface GeneratorSettings {
  numbersCount: number;
  numberRange: number; // максимум
  numberRangeMin?: number; // минимум, по умолчанию 1
  operations: Operation[];
  lawsMode?: LawsMode;
  // Разрядности для умножения/деления (количество цифр)
  multiplyDigits1?: number;
  multiplyDigits2?: number;
  divisionDividendDigits?: number;
  divisionDivisorDigits?: number;
}

export interface Problem {
  numbers: number[];
  operation: Operation;
  correctAnswer: number;
}

function randomIntInclusive(max: number, min = 1): number {
  const span = max - min + 1;
  return Math.floor(Math.random() * span) + min;
}

export function generateProblemFactory(settings: GeneratorSettings) {
  const cfg = {
    numberRangeMin: 1,
    lawsMode: 'none' as LawsMode,
    ...settings,
  };

  return function generate(): Problem {
    const minValue = cfg.numberRangeMin ?? 1;
    const maxValue = cfg.numberRange;

    const numbers: number[] = [];
    const useLaws = (cfg.lawsMode && cfg.lawsMode !== 'none') && (cfg.operations.includes('+') || cfg.operations.includes('-'));

    if (useLaws && cfg.numbersCount >= 2 && maxValue <= 100) {
      const baseMin = 1;
      const baseMax = Math.min(9, maxValue);
      const d1 = randomIntInclusive(baseMax, baseMin);
      let d2 = randomIntInclusive(baseMax, baseMin);

      if (cfg.lawsMode === 'five' || cfg.lawsMode === 'both') {
        // Обеспечиваем, чтобы сумма последних цифр была кратна 5
        let needed = (5 - (d1 % 10) + 10) % 10; // 0..9
        if (needed === 0) needed = 5; // напр. 5+5
        d2 = Math.min(Math.max(needed, baseMin), baseMax);
      } else if (cfg.lawsMode === 'ten') {
        // Обеспечиваем, чтобы сумма последних цифр была кратна 10
        let needed = (10 - (d1 % 10) + 10) % 10; // 0..9
        if (needed === 0) needed = 10;
        d2 = Math.min(Math.max(needed, baseMin), baseMax);
      }

      numbers.push(d1, d2);
      for (let i = 2; i < cfg.numbersCount; i++) {
        numbers.push(randomIntInclusive(maxValue, minValue));
      }
    } else {
      for (let i = 0; i < cfg.numbersCount; i++) {
        numbers.push(randomIntInclusive(maxValue, minValue));
      }
    }

    const operation = cfg.operations[Math.floor(Math.random() * cfg.operations.length)];

    let correctAnswer: number;
    switch (operation) {
      case '+':
        correctAnswer = numbers.reduce((s, n) => s + n, 0);
        break;
      case '-':
        correctAnswer = numbers.reduce((d, n, idx) => (idx === 0 ? n : d - n));
        break;
      case '*':
        if (cfg.multiplyDigits1 || cfg.multiplyDigits2) {
          const d1 = cfg.multiplyDigits1 ? randomIntInclusive(Math.pow(10, cfg.multiplyDigits1) - 1, Math.pow(10, cfg.multiplyDigits1 - 1)) : randomIntInclusive(maxValue, minValue);
          const d2 = cfg.multiplyDigits2 ? randomIntInclusive(Math.pow(10, cfg.multiplyDigits2) - 1, Math.pow(10, cfg.multiplyDigits2 - 1)) : randomIntInclusive(maxValue, minValue);
          numbers.splice(0, numbers.length, d1, d2);
        }
        correctAnswer = numbers.reduce((p, n) => p * n, 1);
        break;
      case '/':
        // Обеспечиваем целочисленный ответ. Поддержка цепочки из numbersCount делений.
        if ((cfg.numbersCount || 2) > 2) {
          const divisors: number[] = [];
          for (let i = 0; i < (cfg.numbersCount - 1); i++) {
            const d = cfg.divisionDivisorDigits
              ? randomIntInclusive(Math.pow(10, cfg.divisionDivisorDigits) - 1, Math.pow(10, cfg.divisionDivisorDigits - 1))
              : randomIntInclusive(Math.min(cfg.numberRange, 100), 1);
            divisors.push(Math.max(1, d));
          }
          let quotient = randomIntInclusive(99, 1);
          const product = divisors.reduce((p, n) => p * n, 1);
          if (cfg.divisionDividendDigits) {
            const minDividend = Math.pow(10, cfg.divisionDividendDigits - 1);
            const maxDividend = Math.pow(10, cfg.divisionDividendDigits) - 1;
            const minQ = Math.ceil(minDividend / product);
            const maxQ = Math.floor(maxDividend / product);
            if (minQ <= maxQ) quotient = randomIntInclusive(maxQ, Math.max(1, minQ));
          }
          const dividend = product * quotient;
          return { numbers: [dividend, ...divisors], operation: '/', correctAnswer: quotient };
        }
        // Базовый случай из 2 чисел
        if (cfg.divisionDividendDigits || cfg.divisionDivisorDigits) {
          const divisor = cfg.divisionDivisorDigits
            ? randomIntInclusive(Math.pow(10, cfg.divisionDivisorDigits) - 1, Math.pow(10, cfg.divisionDivisorDigits - 1))
            : randomIntInclusive(Math.min(cfg.numberRange, 100));
          let quotient = randomIntInclusive(99, 1);
          if (cfg.divisionDividendDigits) {
            const minDividend = Math.pow(10, cfg.divisionDividendDigits - 1);
            const maxDividend = Math.pow(10, cfg.divisionDividendDigits) - 1;
            const minQ = Math.ceil(minDividend / divisor);
            const maxQ = Math.floor(maxDividend / divisor);
            if (minQ <= maxQ) quotient = randomIntInclusive(maxQ, Math.max(1, minQ));
          }
          const dividend = divisor * quotient;
          return { numbers: [dividend, divisor], operation: '/', correctAnswer: quotient };
        }
        {
          const quotient = randomIntInclusive(Math.min(cfg.numberRange, 100));
          const divisor = randomIntInclusive(Math.min(cfg.numberRange, 100));
          const dividend = quotient * divisor;
          return { numbers: [dividend, divisor], operation: '/', correctAnswer: quotient };
        }
      default:
        correctAnswer = numbers.reduce((s, n) => s + n, 0);
    }

    return { numbers, operation, correctAnswer };
  };
}


