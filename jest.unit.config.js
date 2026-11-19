/**
 * Testes das funções puras (utils), sem o preset jest-expo: rodam em Node,
 * rápidos e sem depender dos módulos nativos.
 */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/utils/**/__tests__/**/*.test.ts'],
  transform: { '^.+\\.[jt]sx?$': 'babel-jest' },
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/$1' },
};
