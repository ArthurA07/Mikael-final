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

  function numDigits(n: number): number {
    return Math.max(1, Math.floor(Math.log10(Math.max(1, n))) + 1);
  }

  function digitAtPlace(num: number, place: number): number {
    return Math.floor(Math.abs(num) / place) % 10;
  }

  function pickRandom<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  function getAvailablePlaces(max: number): number[] {
    const places: number[] = [1];
    let p = 10;
    while (p <= max) { places.push(p); p *= 10; }
    return places;
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
      // Пытаемся сгенерировать выражение так, чтобы доля формул удовлетворяла требованиям.
      const attempts = 30;
      for (let attempt = 0; attempt < attempts; attempt++) {
        numbers.length = 0;
        opsSequence = [];
        const opPool = cfg.operations.filter(o => o === '+' || o === '-');
        if (opPool.length === 0) opPool.push('+');
        opsSequence = Array.from({ length: effectiveNumbersCount - 1 }, () => pickRandom(opPool)) as Operation[];
        const totalSteps = opsSequence.length;
        const requiredFormulaSteps = totalSteps <= 2 ? totalSteps : Math.max(1, Math.floor(totalSteps * 0.6));
        let leftToMake = requiredFormulaSteps;

        let current = randomIntInclusive(maxValue, minValue);
        numbers.push(current);
        const places = getAvailablePlaces(maxValue);
        let formulaCount = 0;

        for (let i = 0; i < totalSteps; i++) {
          const op = opsSequence[i];
          const useLaw: 'five' | 'ten' = (cfg.lawsMode === 'both') ? (Math.random() < 0.5 ? 'five' : 'ten') : (cfg.lawsMode as 'five' | 'ten');
          let madeFormula = false;
          const shuffledPlaces = [...places].sort(() => Math.random() - 0.5);
          for (const place of shuffledPlaces) {
            const d = digitAtPlace(current, place);
            if (op === '+') {
              if (useLaw === 'five') {
                if (d <= 4) {
                  const aMin = Math.max(1, 5 - d);
                  if (aMin <= 4) {
                    const a = randomIntInclusive(4, aMin);
                    const n = a * place;
                    numbers.push(n);
                    current += n;
                    madeFormula = true;
                    break;
                  }
                }
              } else {
                const aMin = Math.max(1, 10 - d);
                if (aMin <= 9) {
                  const a = randomIntInclusive(9, aMin);
                  const n = a * place;
                  numbers.push(n);
                  current += n;
                  madeFormula = true;
                  break;
                }
              }
            } else {
              if (useLaw === 'five') {
                if (d >= 5) {
                  const bMin = Math.max(1, d - 4);
                  const bMax = Math.min(4, d);
                  if (bMin <= bMax && current - bMin * place >= 0) {
                    const b = randomIntInclusive(bMax, bMin);
                    const n = b * place;
                    numbers.push(n);
                    current -= n;
                    madeFormula = true;
                    break;
                  }
                }
              } else {
                const bMin = d + 1;
                if (bMin <= 9) {
                  const b = randomIntInclusive(9, bMin);
                  const n = b * place;
                  if (current - n >= 0) {
                    numbers.push(n);
                    current -= n;
                    madeFormula = true;
                    break;
                  }
                }
              }
            }
          }

          if (madeFormula) {
            formulaCount += 1;
            leftToMake = Math.max(0, leftToMake - 1);
            continue;
          }

          // Если формула обязательна (в варианте с 1-2 шагами), пробуем другой старт с нуля
          if (requiredFormulaSteps === totalSteps) {
            // прерываем и начинаем заново
            formulaCount = -1;
            break;
          }

          // Иначе — делаем нефомульный шаг (маленький, безопасный)
          const place = pickRandom(places);
          const a = randomIntInclusive(4, 1);
          const n = a * place;
          if (op === '+') {
            numbers.push(Math.min(n, maxValue));
            current += Math.min(n, maxValue);
          } else {
            const step = Math.min(n, current);
            numbers.push(step);
            current -= step;
          }
        }

        if (formulaCount === -1) continue; // перегенерация для строгого требования
        if (formulaCount >= requiredFormulaSteps) {
          break; // удачный вариант
        } else {
          // пробуем заново
          numbers.length = 0;
          opsSequence = [];
          continue;
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
        // Генерация деления (2 или 3 числа) через выбор делимого с требуемой разрядностью,
        // затем разложение на целочисленные делители и частное.
        {
          const MAX_DIVIDEND = 999999;
          const countDivs = Math.min(effectiveNumbersCount, 3) - 1; // 1 или 2 делителя

          // 1) Выбираем делимое в допустимых границах и с нужной разрядностью (если задана)
          let minDividend = 1;
          let maxDividend = Math.min(MAX_DIVIDEND, cfg.numberRange);
          if (cfg.divisionDividendDigits) {
            minDividend = Math.pow(10, cfg.divisionDividendDigits - 1);
            maxDividend = Math.min(maxDividend, Math.pow(10, cfg.divisionDividendDigits) - 1);
          }
          if (minDividend > maxDividend) {
            minDividend = Math.min(minDividend, MAX_DIVIDEND);
            maxDividend = minDividend;
          }
          let dividend: number;
          if (!cfg.divisionDividendDigits) {
            // Добавляем рандомизацию по количеству цифр, чтобы не всегда были 6-значные числа
            const minD = numDigits(minDividend);
            const maxD = Math.min(6, numDigits(maxDividend));
            const d = randomIntInclusive(maxD, minD);
            const low = Math.max(minDividend, Math.pow(10, d - 1));
            const high = Math.min(maxDividend, Math.pow(10, d) - 1);
            dividend = low <= high ? randomIntInclusive(high, low) : randomIntInclusive(maxDividend, minDividend);
          } else {
            dividend = randomIntInclusive(maxDividend, minDividend);
          }

          // Вспомогательные функции
          const inDigits = (n: number, d?: number) => d ? (n >= Math.pow(10, d - 1) && n <= Math.pow(10, d) - 1) : true;
          const withinRange = (n: number) => n >= 1 && n <= Math.max(1, cfg.numberRange);
          const factors = (n: number): number[] => {
            const res: number[] = [];
            const limit = Math.floor(Math.sqrt(n));
            for (let i = 1; i <= limit; i++) {
              if (n % i === 0) {
                res.push(i);
                const j = Math.floor(n / i);
                if (j !== i) res.push(j);
              }
            }
            return res.sort((a,b) => a-b);
          };

          if (countDivs <= 0) {
            // 2) Случай одного делителя
            const qCandidates = factors(dividend).filter(x => x >= 2); // стараемся q>=2
            const q = qCandidates.length ? qCandidates[Math.floor(Math.random() * qCandidates.length)] : 1;
            const divisor = Math.floor(dividend / q);
            return { numbers: [dividend, divisor], operation: '/', correctAnswer: q };
          }

          // 3) Случай двух делителей: dividend = d1 * d2 * q
          // Выбираем q как нетривиальный делитель, затем раскладываем P = dividend / q на пару (d1,d2)
          const qAll = factors(dividend).filter(x => x >= 2);
          const q = qAll.length ? qAll[Math.floor(Math.random() * qAll.length)] : 1;
          const P = Math.floor(dividend / q);
          const pFactors = factors(P);
          // Генерируем пары (a,b) такие, что a*b=P, и соблюдаем разрядности/диапазон
          const pairs: Array<[number, number]> = [];
          for (const a of pFactors) {
            const b = Math.floor(P / a);
            if (a*b !== P) continue;
            if (!withinRange(a) || !withinRange(b)) continue;
            if (!inDigits(a, cfg.divisionDivisorDigits)) continue;
            if (!inDigits(b, cfg.divisionSecondDivisorDigits || cfg.divisionDivisorDigits)) continue;
            pairs.push([a, b]);
          }
          if (pairs.length) {
            const [d1, d2] = pairs[Math.floor(Math.random() * pairs.length)];
            return { numbers: [dividend, d1, d2], operation: '/', correctAnswer: q };
          }
          // если подходящих пар нет — деградируем до одного делителя
          return { numbers: [dividend, P], operation: '/', correctAnswer: q };
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


