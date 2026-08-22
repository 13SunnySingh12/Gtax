import { describe, expect, it } from 'vitest';
import { validatePassword, passwordStrength, passwordChecks } from '@/lib/passwordPolicy';

describe('passwordPolicy', () => {
  it('rejects short passwords', () => {
    expect(validatePassword('Ab1!')).toMatch(/must be at least 8/i);
  });

  it('rejects passwords missing a character class', () => {
    expect(validatePassword('alllowercase1!')).toMatch(/uppercase/i); // no uppercase
    expect(validatePassword('ALLUPPERCASE1!')).toMatch(/lowercase/i); // no lowercase
    expect(validatePassword('NoNumbers!!')).toMatch(/number/i); // no digit
    expect(validatePassword('NoSpecial123')).toMatch(/special/i); // no special char
  });

  it('rejects common passwords even if they look complex enough', () => {
    expect(validatePassword('password1')).toMatch(/too common/i);
    expect(validatePassword('qwerty123')).toMatch(/too common/i);
    expect(validatePassword('12345678')).toMatch(/too common/i);
  });

  it('accepts a strong password', () => {
    expect(validatePassword('Str0ng&Pass')).toBeNull();
    expect(validatePassword('MyG1g#Taxes24')).toBeNull();
  });

  it('grades strength weak → medium → strong', () => {
    expect(passwordStrength('')).toBeNull();
    expect(passwordStrength('password1')).toBe('weak'); // common
    expect(passwordStrength('abcdefgh')).toBe('weak'); // only lower + length
    expect(passwordStrength('Abcdefg1')).toBe('medium'); // upper+lower+num+len = 4
    expect(passwordStrength('Str0ng&Pass')).toBe('strong'); // all five
  });

  it('exposes individual checks for the meter', () => {
    const c = passwordChecks('Str0ng&Pass');
    expect(c.length && c.upper && c.lower && c.number && c.special && c.notCommon).toBe(true);
  });
});
