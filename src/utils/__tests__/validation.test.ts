import {validateEmail, validatePassword, validateTitle} from '../validation';

describe('validateEmail', () => {
  it('accepts a normal address', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });
  it('rejects an empty value', () => {
    expect(validateEmail('  ')).toMatch(/required/i);
  });
  it('rejects a malformed address', () => {
    expect(validateEmail('user@')).toMatch(/valid/i);
  });
});

describe('validatePassword', () => {
  it('accepts six or more characters', () => {
    expect(validatePassword('secret')).toBeNull();
  });
  it('rejects fewer than six', () => {
    expect(validatePassword('abc')).toMatch(/6/);
  });
});

describe('validateTitle', () => {
  it('accepts a normal title', () => {
    expect(validateTitle('Buy groceries')).toBeNull();
  });
  it('rejects whitespace only', () => {
    expect(validateTitle('   ')).toMatch(/required/i);
  });
  it('rejects titles over 120 characters', () => {
    expect(validateTitle('x'.repeat(121))).toMatch(/120/);
  });
});
