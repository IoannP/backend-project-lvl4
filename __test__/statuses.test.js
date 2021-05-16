import { describe } from '@jest/globals';
import getApp from '../server/index.js';
import { generateEntities, insertEntities } from './helpers.js';

describe('test statuses', () => {
  let app;
  let knex;
  let models;

  const userdata = generateEntities('user');
  const statusdata = generateEntities('status');
  const taskdata = generateEntities('task');

  let user;
  let status;
  let task;

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
    status = await insertEntities.status(models, statusdata);
    taskdata.statusId = status.id;
    task = await insertEntities.task(user, taskdata, knex);
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
      const newStatus = generateEntities('status');
      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('statuses'),
        payload: {
          data: newStatus,
        },
      });

      expect(statusCode).toBe(302);

      const createdStatus = await models.status.query().findOne({ name: newStatus.name });

      expect(createdStatus).toMatchObject(newStatus);
    });

    it('update', async () => {
      const { id } = status;
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
      await task.$query().delete();
      const { id } = status;

      const { statusCode } = await app.inject({
        method: 'DELETE',
        url: `/statuses/${id}`,
      });

      expect(statusCode).toBe(302);

      const deletedStatus = await models.status.query().findById(id);
      expect(deletedStatus).toBeUndefined();
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

      const uncreatedStatus = await models.status.query().findOne({ name: newStatus.name });

      expect(uncreatedStatus).toBeUndefined();
    });

    it('update', async () => {
      const updateForm = { name: '' };
      const { statusCode } = await app.inject({
        method: 'PATCH',
        url: `/statuses/${status.id}`,
        payload: {
          data: updateForm,
        },
      });

      expect(statusCode).toBe(200);

      const unupdatedStatus = await models.status.query().findOne({ name: updateForm.name });
      expect(unupdatedStatus).toBeUndefined();
    });
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
