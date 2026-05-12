// Runs before any module is loaded in the test environment.
// Must set USE_MEMORY_DB before store.ts is imported so that
// the Object.assign(exports, mem) override activates.
process.env.USE_MEMORY_DB = "true";
process.env.JWT_SECRET = "test-jwt-secret";
