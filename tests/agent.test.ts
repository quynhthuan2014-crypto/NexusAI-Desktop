import { describe, expect, it } from 'vitest';
import { calculateExpression, mockAssistant } from '../src/renderer/src/agent';

describe('calculator', () => {
  it('calculates arithmetic expressions', () => expect(calculateExpression('12 * (8 + 2)')).toBe(120));
  it('rejects unsafe code', () => expect(calculateExpression('process.exit()')).toBeNull());
  it('handles unary operators', () => expect(calculateExpression('-(5 + 2)')).toBe(-7));
  it('rejects division by zero', () => expect(calculateExpression('1 / 0')).toBeNull());
});

describe('demo assistant', () => {
  it('routes arithmetic to calculator', () => expect(mockAssistant('24 / 3').tool).toBe('calculator'));
  it('returns a useful fallback', () => expect(mockAssistant('hello').content).toContain('Demo AI'));
});
