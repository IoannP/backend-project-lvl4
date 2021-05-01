import { describe } from '@jest/globals';
import getApp from '../server/index.js';
import {
  generateUser,
  generateStatus,
  insertUser,
  insertStatus,
} from './helpers.js';

describe('test statuses', () => {
  let app;
  let knex;
  let models;
  let testuser;
  let teststatus;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
    testuser = generateUser();
    teststatus = generateStatus();

    app.addHook('preHandler', async (req, reply) => {
      const user = await models.user.query().findOne({ email: testuser.email });
      req.user = user;
    });
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    const user = await insertUser(app, testuser);
    await insertStatus(user, teststatus);
  });

  describe('positive case', () => {
    it('statuses', async () => {
      const { statusCode } = await app.inject({
        method: 'GET',
        url: app.reverse('statuses'),
      });

      expect(statusCode).toBe(200);
    });

    it('new', async () => {
      const { statusCode } = await app.inject({
        method: 'GET',
        url: app.reverse('newStatus'),
      });

      expect(statusCode).toBe(200);
    });

    it('create', async () => {
      const newStatus = generateStatus();
      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('statuses'),
        payload: {
          data: newStatus,
        },
      });

      expect(statusCode).toBe(302);

      const status = await models.status.query().findOne({ name: newStatus.name });

      expect(status).toMatchObject(newStatus);
    });

    it('update', async () => {
      const { id } = await models.status.query().findOne({ name: teststatus.name });
      const updateForm = { name: 'newStatusName' };

      const { statusCode } = await app.inject({
        method: 'PATCH',
        url: `/statuses/${id}`,
        payload: {
          data: updateForm,
        },
      });

      expect(statusCode).toBe(302);

      const updatedStatus = await models.status.query().findOne({ name: updateForm.name });
      expect(updatedStatus).toMatchObject(updateForm);
    });

    it('delete', async () => {
      const { id } = await models.status.query().findOne({ name: teststatus.name });
      await app.objection.models.status.query().deleteById(id);
      const { statusCode } = await app.inject({
        method: 'DELETE',
        url: `/statuses/${id}`,
      });

      expect(statusCode).toBe(302);

      const status = await models.status.query().findById(id);
      expect(status).toBeUndefined();
    });
  });

  describe('negative case', () => {
    it('create', async () => {
      const newStatus = { name: '' };
      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('statuses'),
        payload: {
          data: newStatus,
        },
      });

      expect(statusCode).toBe(200);

      const status = await models.status.query().findOne({ name: newStatus.name });

      expect(status).toBeUndefined();
    });

    it('update', async () => {
      const { id } = await models.status.query().findOne({ name: teststatus.name });
      const updateForm = { name: '' };

      const { statusCode } = await app.inject({
        method: 'PATCH',
        url: `/statuses/${id}`,
        payload: {
          data: updateForm,
        },
      });

      expect(statusCode).toBe(200);

      const updatedStatus = await models.status.query().findOne({ name: updateForm.name });
      expect(updatedStatus).toBeUndefined();
    });
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
