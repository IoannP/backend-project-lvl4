import { describe } from '@jest/globals';
import getApp from '../server/index.js';
import { generateEntities, insertEntities } from './helpers.js';

describe('test tasks', () => {
  let app;
  let knex;
  let models;

  const userData = generateEntities('user');
  const statusData = generateEntities('status');
  const taskData = generateEntities('task');
  const labelsData = [generateEntities('label'), generateEntities('label')];

  let user;
  let status;
  let task;
  let labels;

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
    user = await insertEntities.user(models, userData);
    status = await insertEntities.status(models, statusData);
    labels = labelsData.map(async (labelData) => {
      const label = await insertEntities.label(models, labelData);
      return label;
    });

    labels = await Promise.all(labels);
    taskData.statusId = status.id;
    task = await insertEntities.task(user, taskData, knex);
  });

  describe('positive case', () => {
    test('tasks', async () => {
      const { statusCode } = await app.inject({
        method: 'GET',
        url: app.reverse('tasks'),
      });

      expect(statusCode).toBe(200);
    });

    test('new', async () => {
      const { statusCode } = await app.inject({
        method: 'GET',
        url: app.reverse('newTask'),
      });

      expect(statusCode).toBe(200);
    });

    test('create', async () => {
      const newTask = generateEntities('task');
      newTask.statusId = status.id;
      newTask.labels = labels.map((label) => label.id);

      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('tasks'),
        payload: {
          data: newTask,
        },
      });

      expect(statusCode).toBe(302);

      const createdTask = await models.task.query().findOne({ name: newTask.name }).withGraphFetched('labels');
      const taskLabels = await models.label.query().whereIn('id', newTask.labels);
      newTask.labels = taskLabels;

      expect(createdTask.labels).toMatchObject(taskLabels);
      expect(createdTask).toMatchObject(newTask);
    });

    test('update', async () => {
      const [label] = labels;
      const form = {
        name: 'newTaskName',
        statusId: status.id,
        labels: label.id,
      };

      const { statusCode } = await app.inject({
        method: 'PATCH',
        url: `/tasks/${task.id}`,
        payload: {
          data: form,
        },
      });

      expect(statusCode).toBe(302);

      const updatedTask = await models.task.query().findOne({ name: form.name }).withGraphFetched('labels');
      const taskLabel = await models.label.query().where('id', form.labels);
      form.labels = taskLabel;

      expect(updatedTask.labels).toMatchObject(taskLabel);
      expect(updatedTask).toMatchObject(form);
    });

    test('delete', async () => {
      const { id } = task;
      const { statusCode } = await app.inject({
        method: 'DELETE',
        url: `/tasks/${id}`,
      });

      expect(statusCode).toBe(302);

      const deletedTask = await models.task.query().findById(id);
      expect(deletedTask).toBeUndefined();
    });
  });

  describe('negative case', () => {
    test('create', async () => {
      const newTask = generateEntities('task');

      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('tasks'),
        payload: {
          data: newTask,
        },
      });

      expect(statusCode).toBe(302);

      const uncreatedTask = await models.task.query().findOne({ name: newTask.name });
      expect(uncreatedTask).toBeUndefined();
    });

    test('update', async () => {
      const form = {
        name: 'newTaskName',
      };

      const { statusCode } = await app.inject({
        method: 'PATCH',
        url: `/tasks/${task.id}`,
        payload: {
          data: form,
        },
      });

      expect(statusCode).toBe(302);

      const unupdatedTask = await models.task.query().findOne({ name: form.name });

      expect(unupdatedTask).toBeUndefined();
    });
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
