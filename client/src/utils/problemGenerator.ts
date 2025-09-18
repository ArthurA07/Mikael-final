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

  function makeWithUnits(max: number, units: number, min = 1): number {
    // Подбираем число с заданной единичной цифрой, не превышая max
    if (max < units) return Math.min(max, units);
    const maxTens = Math.floor((max - units) / 10);
    const tens = maxTens > 0 ? randomIntInclusive(maxTens, 0) : 0;
    const candidate = tens * 10 + units;
    return Math.max(min, candidate);
  }

  function ensureNonNegativePair(a: number, b: number): [number, number] {
    if (a < b) return [b, a];
    return [a, b];
  }

  function generateLawPairFive(op: Operation, max: number, min = 1): [number, number] {
    // Пары для тренировки «через 5»
    if (op === '+') {
      // Сложение: (1..4,1..4) или (5,1..4)
      const pick = Math.random() < 0.5 ? 'pair14' : 'five_plus';
      if (pick === 'pair14') {
        const u1 = randomIntInclusive(4, 1);
        const u2 = randomIntInclusive(4, 1);
        let a = makeWithUnits(max, u1, min);
        let b = makeWithUnits(max, u2, min);
        if (Math.random() < 0.5) [a, b] = [b, a];
        return [a, b];
      } else {
        const u1 = 5;
        const u2 = randomIntInclusive(4, 1);
        let a = makeWithUnits(max, u1, min);
        let b = makeWithUnits(max, u2, min);
        if (Math.random() < 0.5) [a, b] = [b, a];
        return [a, b];
      }
    } else {
      // Вычитание: обеспечиваем заём через 5 — единицы уменьшаемого < единиц вычитаемого
      const pick = Math.random() < 0.5 ? 'u_lt' : 'five_minus';
      let uA = 0, uB = 0;
      if (pick === 'u_lt') {
        uA = randomIntInclusive(4, 0); // 0..4
        uB = randomIntInclusive(4, Math.max(1, uA + 1)); // 1..4 и > uA
      } else {
        uA = 5;
        uB = randomIntInclusive(4, 1); // 1..4
      }
      const maxTens = Math.floor((max - Math.max(uA, uB)) / 10);
      let tB = randomIntInclusive(maxTens, 0);
      let tA = randomIntInclusive(maxTens, tB); // tA >= tB, чтобы a >= b
      let a = tA * 10 + uA;
      let b = tB * 10 + uB;
      if (a < b) a = (tB + 1) * 10 + uA; // страховка
      a = Math.min(a, max);
      b = Math.min(b, Math.min(a, max));
      a = Math.max(a, min);
      b = Math.max(b, min);
      return [a, b];
    }
  }

  function generateLawPairTen(op: Operation, max: number, min = 1): [number, number] {
    // Пары-комплементы до 10
    if (op === '+') {
      const u1 = randomIntInclusive(9, 1);
      const units2 = (10 - (u1 % 10)) % 10;
      const u2 = units2 === 0 ? 0 : units2;
      let a = makeWithUnits(max, u1 === 10 ? 0 : u1, min);
      let b = makeWithUnits(max, u2, min);
      if (Math.random() < 0.5) [a, b] = [b, a];
      return [a, b];
    } else {
      // Для вычитания: обеспечиваем a_units < b_units
      const uA = randomIntInclusive(8, 0); // 0..8
      const uB = randomIntInclusive(9, uA + 1); // 1..9 и > uA
      const maxTens = Math.floor((max - Math.max(uA, uB)) / 10);
      let tB = randomIntInclusive(maxTens, 0);
      let tA = randomIntInclusive(maxTens, tB); // tA >= tB
      let a = tA * 10 + uA;
      let b = tB * 10 + uB;
      if (a < b) a = (tB + 1) * 10 + uA;
      a = Math.min(a, max);
      b = Math.min(b, Math.min(a, max));
      a = Math.max(a, min);
      b = Math.max(b, min);
      return [a, b];
    }
  }

  return function generate(): Problem {
    const minValue = cfg.numberRangeMin ?? 1;
    const maxValue = cfg.numberRange;

    const numbers: number[] = [];
    const lawsOn = cfg.lawsMode && cfg.lawsMode !== 'none';
    // Выбираем операцию; если законы активны — принудительно '+/-'
    let operation: Operation = cfg.operations[Math.floor(Math.random() * cfg.operations.length)];
    if (lawsOn && (operation === '*' || operation === '/')) {
      operation = Math.random() < 0.5 ? '+' : '-';
    }

    if (lawsOn && cfg.numbersCount >= 2 && maxValue >= 1) {
      // Генерируем базовую пару под законы, остальные числа — случайные в диапазоне
      const pair = (cfg.lawsMode === 'ten')
        ? generateLawPairTen(operation, maxValue, minValue)
        : (cfg.lawsMode === 'five')
          ? generateLawPairFive(operation, maxValue, minValue)
          : (Math.random() < 0.5
              ? generateLawPairFive(operation, maxValue, minValue)
              : generateLawPairTen(operation, maxValue, minValue));
      numbers.push(pair[0], pair[1]);
      for (let i = 2; i < cfg.numbersCount; i++) {
        numbers.push(randomIntInclusive(maxValue, minValue));
      }
    } else {
      for (let i = 0; i < cfg.numbersCount; i++) {
        numbers.push(randomIntInclusive(maxValue, minValue));
      }
    }

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


