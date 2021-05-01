import { afterEach, describe } from '@jest/globals';
import getApp from '../server/index.js';
import { generateUser, insertUser } from './helpers.js';

describe('test sessions', () => {
  let app;
  let knex;
  let testuser;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    testuser = generateUser();
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await insertUser(app, testuser);
  });

  describe('positive case', () => {
    test('sign in / sign out', async () => {
      const response = await app.inject({
        method: 'GET',
        url: app.reverse('newSession'),
      });

      expect(response.statusCode).toBe(200);
      const { email, password } = testuser;
      const { statusCode, cookies } = await app.inject({
        method: 'POST',
        url: app.reverse('session'),
        payload: {
          data: { email, password },
        },
      });

      expect(statusCode).toBe(302);

      const [sessionCookie] = cookies;
      const { name, value } = sessionCookie;
      const cookie = { [name]: value };

      const responseSignOut = await app.inject({
        method: 'DELETE',
        url: app.reverse('session'),
        cookies: cookie,
      });

      expect(responseSignOut.statusCode).toBe(302);
    });
  });

  describe('negative case', () => {
    test('sign in', async () => {
      const { email } = testuser;
      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('session'),
        payload: {
          data: { email },
        },
      });

      expect(statusCode).toBe(200);
    });
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
