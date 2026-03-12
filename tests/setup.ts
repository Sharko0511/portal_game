import "@testing-library/jest-dom";

// Reset all mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

// Suppress noisy console output during tests
beforeAll(() => {
  vi.spyOn(console, "warn").mockImplementation(() => {});
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
  vi.restoreAllMocks();
});
