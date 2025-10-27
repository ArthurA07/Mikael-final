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
  multiplyDigits3?: number;
  divisionDividendDigits?: number;
  divisionDivisorDigits?: number;
  divisionSecondDivisorDigits?: number;
}

export interface Problem {
  numbers: number[];
  operation: Operation; // базовая операция для обратной совместимости/сервера
  correctAnswer: number;
  // Необязательно: последовательность операций между числами (для смешанных + и -)
  ops?: Operation[]; // длина = numbers.length - 1; используются только '+' | '-'
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
    let opsSequence: Operation[] | undefined;
    const lawsOn = cfg.lawsMode && cfg.lawsMode !== 'none';
    // Выбираем операцию; если законы активны — принудительно '+/-'
    let operation: Operation = cfg.operations[Math.floor(Math.random() * cfg.operations.length)];
    if (lawsOn && (operation === '*' || operation === '/')) {
      operation = Math.random() < 0.5 ? '+' : '-';
    }

    const hasMulOrDiv = cfg.operations.includes('*') || cfg.operations.includes('/');
    const effectiveNumbersCount = hasMulOrDiv ? Math.min(cfg.numbersCount, 3) : cfg.numbersCount;

    if (lawsOn && effectiveNumbersCount >= 2 && maxValue >= 1) {
      const wantsMixedPlusMinus = effectiveNumbersCount >= 3 && cfg.operations.includes('+') && cfg.operations.includes('-');
      const pickLaw = (): 'five' | 'ten' => (cfg.lawsMode === 'both') ? (Math.random() < 0.5 ? 'five' : 'ten') : (cfg.lawsMode as 'five' | 'ten');

      if (wantsMixedPlusMinus) {
        // Смешанная последовательность под законы: генерируем знаки и числа пошагово
        const maxAttempts = 25;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          numbers.length = 0;
          // последовательность знаков
          opsSequence = Array.from({ length: effectiveNumbersCount - 1 }, () => (Math.random() < 0.5 ? '+' : '-')) as Operation[];
          if (!opsSequence.includes('+')) opsSequence[0] = '+';
          if (!opsSequence.includes('-')) opsSequence[opsSequence.length - 1] = '-';
          // стартовая пара
          const lawFirst = pickLaw();
          const pair = lawFirst === 'ten' ? generateLawPairTen(opsSequence[0], maxValue, minValue) : generateLawPairFive(opsSequence[0], maxValue, minValue);
          numbers.push(pair[0], pair[1]);
          let current = opsSequence[0] === '-' ? pair[0] - pair[1] : pair[0] + pair[1];
          // остальные шаги
          let ok = true;
          for (let i = 1; i < opsSequence.length; i++) {
            const op = opsSequence[i];
            const useLaw = pickLaw();
            if (op === '+') {
              if (useLaw === 'five') {
                const unitsNow = current % 10;
                const minU = Math.max(1, 6 - (unitsNow % 10));
                const u = minU > 4 ? 1 : randomIntInclusive(4, minU);
                const n = makeWithUnits(maxValue, u, minValue);
                numbers.push(n);
                current += n;
              } else {
                const unitsNow = current % 10;
                const u = (10 - (unitsNow % 10)) % 10 || 0;
                const n = makeWithUnits(maxValue, u === 0 ? 0 : u, minValue);
                numbers.push(n);
                current += n;
              }
            } else { // '-'
              if (useLaw === 'five') {
                const unitsNow = ((current % 10) + 10) % 10;
                let u = unitsNow >= 4 ? 4 : randomIntInclusive(4, Math.max(1, unitsNow + 1));
                if (u <= unitsNow) u = Math.min(4, unitsNow + 1);
                const n = makeWithUnits(maxValue, u, minValue);
                const candidate = current - n;
                if (candidate < 0) {
                  const smaller = makeWithUnits(Math.max(minValue, Math.floor(current / 10) * 10 + u), u, minValue);
                  const val = Math.min(smaller, current);
                  numbers.push(val);
                  current -= val;
                } else {
                  numbers.push(n);
                  current = candidate;
                }
              } else { // ten
                const unitsNow = ((current % 10) + 10) % 10;
                let u = unitsNow >= 9 ? 9 : randomIntInclusive(9, unitsNow + 1);
                const n = makeWithUnits(maxValue, u, minValue);
                const candidate = current - n;
                if (candidate < 0) {
                  const smaller = makeWithUnits(Math.max(minValue, Math.floor(current / 10) * 10 + u), u, minValue);
                  const val = Math.min(smaller, current);
                  numbers.push(val);
                  current -= val;
                } else {
                  numbers.push(n);
                  current = candidate;
                }
              }
            }
          }
          if (ok && current >= 0) break; // итог неотрицателен
          if (attempt === maxAttempts - 1 && current < 0) {
            const deficit = Math.abs(current);
            numbers[0] = Math.min(maxValue, numbers[0] + deficit);
          }
        }
      } else {
        // Старый путь: однотипные операции под выбранный закон
        const pair = (cfg.lawsMode === 'ten')
          ? generateLawPairTen(operation, maxValue, minValue)
          : (cfg.lawsMode === 'five')
            ? generateLawPairFive(operation, maxValue, minValue)
            : (Math.random() < 0.5
                ? generateLawPairFive(operation, maxValue, minValue)
                : generateLawPairTen(operation, maxValue, minValue));
        numbers.push(pair[0], pair[1]);
        let current = operation === '-' ? (pair[0] - pair[1]) : (pair[0] + pair[1]);
        for (let i = 2; i < cfg.numbersCount; i++) {
          if (operation === '+') {
            if (cfg.lawsMode === 'five' || cfg.lawsMode === 'both') {
              const unitsNow = current % 10;
              const minU = Math.max(1, 6 - (unitsNow % 10));
              const u = minU > 4 ? 1 : randomIntInclusive(4, minU);
              const n = makeWithUnits(maxValue, u, minValue);
              numbers.push(n);
              current += n;
            } else {
              const unitsNow = current % 10;
              const u = (10 - (unitsNow % 10)) % 10 || 0;
              const n = makeWithUnits(maxValue, u === 0 ? 0 : u, minValue);
              numbers.push(n);
              current += n;
            }
          } else {
            if (cfg.lawsMode === 'five' || cfg.lawsMode === 'both') {
              const unitsNow = ((current % 10) + 10) % 10;
              let u = unitsNow >= 4 ? 4 : randomIntInclusive(4, Math.max(1, unitsNow + 1));
              if (u <= unitsNow) u = Math.min(4, unitsNow + 1);
              const n = makeWithUnits(maxValue, u, minValue);
              const candidate = current - n;
              if (candidate < 0) {
                const smaller = makeWithUnits(Math.max(minValue, Math.floor(current / 10) * 10 + u), u, minValue);
                numbers.push(Math.min(smaller, current));
                current -= Math.min(smaller, current);
              } else {
                numbers.push(n);
                current = candidate;
              }
            } else {
              const unitsNow = ((current % 10) + 10) % 10;
              let u = unitsNow >= 9 ? 9 : randomIntInclusive(9, unitsNow + 1);
              const n = makeWithUnits(maxValue, u, minValue);
              const candidate = current - n;
              if (candidate < 0) {
                const smaller = makeWithUnits(Math.max(minValue, Math.floor(current / 10) * 10 + u), u, minValue);
                numbers.push(Math.min(smaller, current));
                current -= Math.min(smaller, current);
              } else {
                numbers.push(n);
                current = candidate;
              }
            }
          }
        }
      }
    } else {
      // Обычный режим (без законов). Поддержим смешанные операции для суммы/разности
      const wantsMixedPlusMinus = cfg.numbersCount >= 3 && cfg.operations.includes('+') && cfg.operations.includes('-');
      if (wantsMixedPlusMinus) {
        // Генерируем как минимум один '+' и один '-'
        const maxAttempts = 25;
        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          opsSequence = Array.from({ length: cfg.numbersCount - 1 }, () => (Math.random() < 0.5 ? '+' : '-')) as Operation[];
          if (!opsSequence.includes('+')) opsSequence[0] = '+';
          if (!opsSequence.includes('-')) opsSequence[opsSequence.length - 1] = '-';
          numbers.length = 0;
          for (let i = 0; i < effectiveNumbersCount; i++) numbers.push(randomIntInclusive(maxValue, minValue));
          // Проверяем неотрицательный итог
          let acc = numbers[0];
          for (let i = 1; i < numbers.length; i++) acc = (opsSequence[i-1] === '+') ? acc + numbers[i] : acc - numbers[i];
          if (acc >= 0) break; else if (attempt === maxAttempts - 1) {
            // в крайнем случае поднимем первый элемент
            const deficit = Math.abs(acc);
            numbers[0] = Math.min(maxValue, numbers[0] + deficit);
          }
        }
      } else {
        // Если выбрана только операция '-' и чисел >= 2 — гарантируем неотрицательный результат
        if (cfg.operations.length === 1 && cfg.operations[0] === '-' && effectiveNumbersCount >= 2) {
          const firstMin = Math.max(minValue, (cfg.numbersCount - 1) * minValue);
          const a0 = randomIntInclusive(maxValue, Math.min(firstMin, maxValue));
          numbers.push(a0);
          let remainder = a0;
          for (let i = 1; i < effectiveNumbersCount; i++) {
            const remaining = cfg.numbersCount - i;
            const minNeededForRest = (remaining - 1) * minValue;
            const maxForThis = Math.max(minValue, Math.min(maxValue, remainder - minNeededForRest));
            const pick = randomIntInclusive(maxForThis, minValue);
            numbers.push(pick);
            remainder -= pick;
          }
        } else {
          for (let i = 0; i < effectiveNumbersCount; i++) {
            numbers.push(randomIntInclusive(maxValue, minValue));
          }
        }
      }
    }

    let correctAnswer: number;
    switch (operation) {
      case '+':
        if (opsSequence && opsSequence.length === numbers.length - 1) {
          // Смешанная последовательность плюс/минус, базовая операция оставляем '+'
          let acc = numbers[0];
          for (let i = 1; i < numbers.length; i++) {
            const op = opsSequence[i - 1];
            acc = op === '+' ? acc + numbers[i] : acc - numbers[i];
          }
          correctAnswer = acc;
        } else {
          correctAnswer = numbers.reduce((s, n) => s + n, 0);
        }
        break;
      case '-':
        if (opsSequence && opsSequence.length === numbers.length - 1) {
          let acc = numbers[0];
          for (let i = 1; i < numbers.length; i++) {
            const op = opsSequence[i - 1];
            acc = op === '+' ? acc + numbers[i] : acc - numbers[i];
          }
          correctAnswer = acc;
        } else {
          correctAnswer = numbers.reduce((d, n, idx) => (idx === 0 ? n : d - n));
        }
        break;
      case '*':
        if (hasMulOrDiv) {
          // Ограничиваем количество множителей до 3 и уважаем разрядности
          const count = Math.min(effectiveNumbersCount, 3);
          const picks: number[] = [];
          const digitsForIndex = (idx: number | undefined) => {
            if (idx === 0 && cfg.multiplyDigits1) return cfg.multiplyDigits1;
            if (idx === 1 && cfg.multiplyDigits2) return cfg.multiplyDigits2;
            if (idx === 2 && cfg.multiplyDigits3) return cfg.multiplyDigits3;
            return undefined;
          };
          for (let i = 0; i < count; i++) {
            const d = digitsForIndex(i);
            const val = d
              ? randomIntInclusive(Math.pow(10, d) - 1, Math.pow(10, d - 1))
              : randomIntInclusive(maxValue, minValue);
            picks.push(Math.max(1, val));
          }
          numbers.splice(0, numbers.length, ...picks);
        }
        correctAnswer = numbers.reduce((p, n) => p * n, 1);
        break;
      case '/':
        // Унифицированная генерация деления (2 или 3 числа) с ограничением делимого ≤ 6 цифр
        {
          const MAX_DIVIDEND = 999999;
          const countDivs = Math.min(effectiveNumbersCount, 3) - 1; // 1 или 2 делителя

          // Границы делимого
          let minDividend = 1;
          let maxDividend = Math.min(MAX_DIVIDEND, cfg.numberRange);
          if (cfg.divisionDividendDigits) {
            minDividend = Math.pow(10, cfg.divisionDividendDigits - 1);
            maxDividend = Math.min(maxDividend, Math.pow(10, cfg.divisionDividendDigits) - 1);
          }
          if (minDividend > maxDividend) minDividend = Math.max(1, Math.min(minDividend, MAX_DIVIDEND));

          // Выбираем желаемое частное (стараемся не 1)
          const qUpperPref = Math.max(2, Math.min(20, Math.floor(maxDividend / 10)));
          let q = qUpperPref >= 2 ? randomIntInclusive(qUpperPref, 2) : 1;

          // Подбираем делители так, чтобы произведение не превышало maxDividend / q
          const divisors: number[] = [];
          let product = 1;
          const productMax = Math.max(1, Math.floor(maxDividend / Math.max(1, q)));
          for (let i = 0; i < countDivs; i++) {
            const useDigits = i === 0 ? cfg.divisionDivisorDigits : (cfg.divisionSecondDivisorDigits || cfg.divisionDivisorDigits);
            const digitsUpper = useDigits ? (Math.pow(10, useDigits) - 1) : Infinity;
            const digitsLower = useDigits ? Math.pow(10, useDigits - 1) : 1;
            let upper = Math.min(productMax / product | 0, cfg.numberRange, 999); // держим делители умеренными
            upper = Math.min(upper, digitsUpper);
            let lower = Math.max(1, Math.min(digitsLower, upper));
            if (upper < 1 || lower > upper) {
              divisors.push(1);
              continue;
            }
            const d = Math.max(1, randomIntInclusive(upper, lower));
            divisors.push(d);
            product *= d;
          }

          // Уточняем q так, чтобы dividend влезал в границы
          let minQ = Math.max(1, Math.ceil(minDividend / product));
          let maxQ = Math.max(1, Math.floor(maxDividend / product));
          if (maxQ < 1) {
            // продукт слишком большой — уменьшим последний делитель
            if (divisors.length > 0) {
              const lastIdx = divisors.length - 1;
              const reduceTo = Math.max(1, Math.floor((maxDividend / Math.max(1, Math.ceil(minDividend / Math.max(1, q)))) / (product / divisors[lastIdx])));
              if (reduceTo < divisors[lastIdx]) {
                product = (product / divisors[lastIdx]) * reduceTo;
                divisors[lastIdx] = reduceTo;
                minQ = Math.max(1, Math.ceil(minDividend / product));
                maxQ = Math.max(1, Math.floor(maxDividend / product));
              }
            }
          }

          if (minQ > maxQ) { minQ = 1; maxQ = 1; }
          // Пытаемся выбрать q ≥ 2, если это допустимо
          const pickMin = Math.min(Math.max(2, minQ), maxQ);
          q = pickMin <= maxQ ? randomIntInclusive(maxQ, pickMin) : maxQ; // если нельзя ≥2, берём допустимый

          const dividend = product * q;
          return { numbers: [dividend, ...divisors], operation: '/', correctAnswer: q };
        }
      default:
        correctAnswer = numbers.reduce((s, n) => s + n, 0);
    }

    // Если создали смешанную последовательность, всегда проставляем operation как '+' (UI/сервер совместим)
    if (opsSequence && opsSequence.length === numbers.length - 1) {
      return { numbers, operation: '+', correctAnswer, ops: opsSequence.map(op => (op === '+' || op === '-' ? op : '+')) };
    }

    return { numbers, operation, correctAnswer };
  };
}


