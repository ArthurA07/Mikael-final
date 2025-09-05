import { generateProblemFactory } from '../../../utils/problemGenerator';

describe('problem generator', () => {
  test('sum within range', () => {
    const gen = generateProblemFactory({ numbersCount: 3, numberRange: 10, operations: ['+'] });
    for (let i = 0; i < 50; i++) {
      const p = gen();
      expect(p.numbers.length).toBe(3);
      expect(Math.max(...p.numbers)).toBeLessThanOrEqual(10);
      expect(Math.min(...p.numbers)).toBeGreaterThanOrEqual(1);
      expect(p.correctAnswer).toBe(p.numbers.reduce((s, n) => s + n, 0));
    }
  });

  test('range with min=1000', () => {
    const gen = generateProblemFactory({ numbersCount: 2, numberRange: 1000000, numberRangeMin: 1000, operations: ['+'] });
    for (let i = 0; i < 20; i++) {
      const p = gen();
      expect(Math.min(...p.numbers)).toBeGreaterThanOrEqual(1000);
      expect(Math.max(...p.numbers)).toBeLessThanOrEqual(1000000);
    }
  });

  test('laws five constrain last digit sum to 5 when applicable', () => {
    const gen = generateProblemFactory({ numbersCount: 2, numberRange: 9, operations: ['+'], lawsMode: 'five' });
    for (let i = 0; i < 20; i++) {
      const p = gen();
      const s = (p.numbers[0] % 10) + (p.numbers[1] % 10);
      expect(s % 5).toBe(0);
      expect(p.correctAnswer).toBe(p.numbers[0] + p.numbers[1]);
    }
  });

  test('division returns integer quotient', () => {
    const gen = generateProblemFactory({ numbersCount: 2, numberRange: 100, operations: ['/'] });
    for (let i = 0; i < 20; i++) {
      const p = gen();
      expect(p.numbers[0] % p.numbers[1]).toBe(0);
    }
  });
});


