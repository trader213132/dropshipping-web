import "@testing-library/jest-dom";

// Suppress pino logs during tests
process.env.LOG_LEVEL = "silent";
// NODE_ENV is managed by the test runner (vitest sets it to "test" automatically)

// Minimal env for env validation
process.env.DATABASE_URL = "postgresql://test:test@localhost:5432/test";
process.env.AUTH_SECRET = "test_secret_that_is_32_characters_long_xx";
process.env.DEMO_MODE = "true";
