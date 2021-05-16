import { describe } from '@jest/globals';
import _ from 'lodash';
import getApp from '../server/index.js';
import { insertEntities, generateEntities } from './helpers.js';

describe('test users', () => {
  let app;
  let knex;
  let models;

  let user;
  let task;

  const userdata = generateEntities('user');
  const statusdata = generateEntities('status');
  const taskdata = generateEntities('task');

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;

    app.addHook('preHandler', async (req) => {
      req.user = await models.user.query().findOne({ email: user.email });
    });
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    user = await insertEntities.user(models, userdata);
    const { id } = await insertEntities.status(models, statusdata);
    taskdata.statusId = id;
    task = await insertEntities.task(user, taskdata, knex);
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
      const newUser = generateEntities('user');
      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('users'),
        payload: {
          data: newUser,
        },
      });

      expect(statusCode).toBe(302);

      const createdUser = await models.user.query().findOne({ email: newUser.email });
      const passwordValid = await createdUser.verifyPassword(newUser.password);

      expect(passwordValid).toBeTruthy();
      expect(createdUser).toMatchObject(_.omit(newUser, 'password'));
    });

    test('update', async () => {
      const updateForm = {
        firstName: user.firstName,
        lastName: user.lastName,
        email: 'test@mail.com',
        password: user.password,
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
      expect(updatedUser).toMatchObject(updateForm);
    });

    test('delete', async () => {
      const { id } = user;
      await task.$query().delete();
      const { statusCode } = await app.inject({
        method: 'DELETE',
        url: `/users/${id}`,
      });

      expect(statusCode).toBe(302);

      expect(await models.user.query().findById(id)).toBeUndefined();
    });
  });

  describe('negative case', () => {
    test('create', async () => {
      const newUser = generateEntities('user');
      newUser.firstName = '';

      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('users'),
        payload: {
          data: newUser,
        },
      });

      expect(statusCode).toBe(200);

      const uncreatedUser = await models.user.query().findOne({ email: newUser.email });
      expect(uncreatedUser).toBeUndefined();
    });

    test('update', async () => {
      const updateForm = {
        firstName: user.firstName,
        lastName: user.lastName,
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

      const unupdatedUser = await models.user.query().findOne({ email: updateForm.email });
      expect(unupdatedUser).toBeUndefined();
    });
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
