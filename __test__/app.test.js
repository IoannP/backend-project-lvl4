import getApp from '../server/index.js';

describe('requests', () => {
  let app;

  beforeAll(async () => {
    app = await getApp();
  });

  it('GET 200', async () => {
    const res = await app.inject({
      method: 'GET',
      url: app.reverse('root'),
    });
    expect(res.statusCode).toBe(200);
  });

  it('GET 404', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/wrong-path',
    });
    expect(res.statusCode).toBe(404);
  });

  it('DELETE 302', async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/session',
    });
    expect(res.statusCode).toBe(302);
  });

  afterAll(() => {
    app.close();
  });
});