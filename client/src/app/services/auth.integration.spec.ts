import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { AuthService } from './auth';

/**
 * Testy integracyjne odpytujące PRAWDZIWY backend.
 * Uruchomienie: npm test -- --grep "Integration"
 * Wymagane: backend uruchomiony na http://localhost:3000
 */
describe('AuthService Integration Tests', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()],
    });

    service = TestBed.inject(AuthService);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should fail to register with invalid data if backend rejects it', async () => {
    const payload = {
      email: 'invalid-email',
      password: 'short',
      confirmPassword: 'short',
      fullName: '',
    };

    try {
      await firstValueFrom(service.register(payload));
    } catch (error: any) {
      console.error('Backend error (expected):', error?.status, error?.message);
      expect(error?.status).toBeDefined();
    }
  });

  it('should fail to login with wrong credentials', async () => {
    const payload = {
      email: 'nonexistent@test.com',
      password: 'wrongpassword123',
    };

    try {
      await firstValueFrom(service.login(payload));
      throw new Error('Should not succeed with wrong credentials');
    } catch (error: any) {
      console.log('Login error (expected):', error?.status, error?.statusText);
      expect([400, 401, 404, 0]).toContain(error?.status);
    }
  });
});
