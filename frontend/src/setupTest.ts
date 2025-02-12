import '@testing-library/jest-dom';

// Configuration supplémentaire si nécessaire
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Configuration des mocks globaux pour les tests
global.console = {
  ...console,
  // Gardez les logs d'erreur pour le débogage mais mockez les autres
  log: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
};

// Mock pour TextEncoder/TextDecoder si nécessaire
if (typeof TextEncoder === 'undefined') {
  global.TextEncoder = jest.fn().mockImplementation(() => ({
    encode: jest.fn(text => Buffer.from(text)),
  }));
}

if (typeof TextDecoder === 'undefined') {
  global.TextDecoder = jest.fn().mockImplementation(() => ({
    decode: jest.fn(buffer => buffer.toString()),
  }));
}