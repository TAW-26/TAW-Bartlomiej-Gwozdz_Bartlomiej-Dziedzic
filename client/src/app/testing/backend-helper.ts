/**
 * Check if the backend is available before running integration tests.
 *
 * Usage in test:
 *   beforeAll(async () => {
 *     await skipIfBackendOffline();
 *   });
 */
export async function skipIfBackendOffline(): Promise<void> {
  const backendUrl = 'http://localhost:3000/health';

  try {
    const response = await fetch(backendUrl, { timeout: 2000 });
    if (!response.ok) {
      throw new Error(`Backend health check failed: ${response.status}`);
    }
    console.log('✓ Backend is online');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`⚠ Backend offline: ${message}`);
    console.warn('Integration tests will be skipped or will fail.');
    throw new Error('BACKEND_OFFLINE');
  }
}

/**
 * Helper to mark a test as pending if backend is offline.
 */
export function describeIfBackendOnline(
  name: string,
  fn: (describe: typeof describe) => void,
): void {
  describe(name, () => {
    beforeAll((done) => {
      skipIfBackendOffline()
        .then(() => done())
        .catch(() => {
          // Backend offline — all tests in this suite are skipped
          done();
        });
    });

    fn(describe);
  });
}
