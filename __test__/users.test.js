import { describe } from '@jest/globals';
import _ from 'lodash';
import getApp from '../server/index.js';
import { generateUser, insertUser } from './helpers.js';

describe('test users', () => {
  let app;
  let knex;
  let models;
  let testuser;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
    testuser = generateUser();
    app.addHook('preHandler', (req, reply, done) => {
      req.user = { id: 1 };
      done();
    });
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await insertUser(app, testuser);
  });

  describe('positive case', () => {
    test('index', async () => {
      const { statusCode } = await app.inject({
        method: 'GET',
        url: app.reverse('users'),
      });

      expect(statusCode).toBe(200);
    });

    test('new', async () => {
      const { statusCode } = await app.inject({
        method: 'GET',
        url: app.reverse('usersNew'),
      });

      expect(statusCode).toBe(200);
    });

    test('create', async () => {
      const newUser = generateUser();
      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('users'),
        payload: {
          data: newUser,
        },
      });

      expect(statusCode).toBe(302);

      const user = await models.user.query().findOne({ email: newUser.email });
      const passwordValid = await user.verifyPassword(newUser.password);

      expect(passwordValid).toBeTruthy();
      expect(user).toMatchObject(_.omit(newUser, 'password'));
    });

    test('update', async () => {
      const user = await models.user.query().findOne({ email: testuser.email });
      const updateForm = {
        firstname: testuser.firstname,
        lastname: testuser.lastname,
        email: 'test@mail.com',
        password: testuser.password,
      };

      const { statusCode } = await app.inject({
        method: 'PATCH',
        url: `/users/${user.id}`,
        payload: {
          data: updateForm,
        },
      });

      expect(statusCode).toBe(302);

      const updatedUser = await models.user.query().findOne({ email: updateForm.email });
      expect(updatedUser).toMatchObject(_.omit(updateForm, 'password'));
    });

    test('delete', async () => {
      const { id } = await models.user.query().findOne({ email: testuser.email });

      const { statusCode } = await app.inject({
        method: 'DELETE',
        url: `/users/${id}`,
      });

      expect(statusCode).toBe(302);

      const user = await models.user.query().findById(id);
      expect(user).toBeUndefined();
    });
  });

  describe('negative case', () => {
    test('create', async () => {
      const newUser = generateUser();
      newUser.firstname = '';

      await app.inject({
        method: 'POST',
        url: app.reverse('users'),
        payload: {
          data: newUser,
        },
      });
      const user = await models.user.query().findOne({ email: newUser.email });
      await expect(user).toBeUndefined();
    });

    test('update', async () => {
      const user = await models.user.query().findOne({ email: testuser.email });
      const updateForm = {
        firstname: testuser.firstname,
        lastname: testuser.lastname,
        email: 'test@mail.com',
      };

      const { statusCode } = await app.inject({
        method: 'PATCH',
        url: `/users/${user.id}`,
        payload: {
          data: updateForm,
        },
      });

      expect(statusCode).toBe(200);
      const updatedUser = await models.user.query().findOne({ email: updateForm.email });
      expect(updatedUser).toBeUndefined();
    });

    test('delete', async () => {
      const newUser = generateUser();
      const response = await app.inject({
        method: 'POST',
        url: app.reverse('users'),
        payload: {
          data: newUser,
        },
      });

      expect(response.statusCode).toBe(302);

      const { id } = await models.user.query().findOne({ email: newUser.email });
      const { statusCode } = await app.inject({
        method: 'DELETE',
        url: `/users/${id}`,
      });

      expect(statusCode).toBe(302);

      const user = await models.user.query().findById(id);
      expect(user).toMatchObject(_.omit(newUser, 'password'));
    });
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
