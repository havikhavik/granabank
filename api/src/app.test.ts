// Tests de integración: usan la base de datos del .env (correr antes migraciones y seed).
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import app from './app.js';
import { sequelize } from './db.js';

afterAll(() => sequelize.close());

async function login(email: string, password: string) {
  const res = await request(app).post('/auth/login').send({ email, password });
  return res.body.token as string;
}

describe('API', () => {
  it('GET /health responde 200 sin cachear', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
    expect(res.headers['cache-control']).toBe('no-store');
  });

  it('login correcto devuelve token y usuario', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'soygranate@clublanus.com', password: 'GRANATE1@' });

    expect(res.status).toBe(200);
    expect(res.body.token).toEqual(expect.any(String));
    expect(res.body.user).toEqual({ id: expect.any(Number), name: 'Granate' });
  });

  it('sin token responde 401', async () => {
    const res = await request(app).get('/me');

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('un movimiento de otro usuario responde 404', async () => {
    const otherToken = await login('otro@clublanus.com', 'OTRO1234@');
    const otherMovements = await request(app).get('/movements').set('Authorization', `Bearer ${otherToken}`);
    const foreignId = otherMovements.body.items[0].id;

    const token = await login('soygranate@clublanus.com', 'GRANATE1@');
    const res = await request(app).get(`/movements/${foreignId}`).set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('MOVEMENT_NOT_FOUND');
  });
});
