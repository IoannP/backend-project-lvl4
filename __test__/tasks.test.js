import { describe } from '@jest/globals';
import getApp from '../server/index.js';
import {
  generateUser,
  generateStatus,
  generateTask,
  generateLabel,
  insertUser,
  insertStatus,
  insertTask,
  insertLabel,
} from './helpers.js';

describe('test tasks', () => {
  let app;
  let knex;
  let models;
  let testuserData;
  let teststatusData;
  let testtaskDataWithLabel;
  let testtaskData;
  let testlabelsData;
  let testuser;
  let teststatus;
  let testtaskWithLabel;
  let testtask;
  let testlabels;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
    testuserData = generateUser();
    teststatusData = generateStatus();
    testtaskDataWithLabel = generateTask();
    testtaskData = generateTask();
    testlabelsData = [generateLabel(), generateLabel()];

    app.addHook('preHandler', async (req) => {
      const user = await models.user.query().findOne({ email: testuser.email });
      req.user = user;
    });
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    testuser = await insertUser(app, testuserData);
    teststatus = await insertStatus(testuser, teststatusData);
    testlabels = testlabelsData.map(async (labelData) => {
      const label = await insertLabel(testuser, labelData);
      return label;
    });

    testlabels = await Promise.all(testlabels);

    testtaskDataWithLabel.statusId = teststatus.id;
    testtaskDataWithLabel.labels = testlabels.map((label) => ({ id: label.id }));
    testtaskData.statusId = teststatus.id;

    testtaskWithLabel = await insertTask(testuser, testtaskDataWithLabel, knex);
    testtask = await insertTask(testuser, testtaskData, knex);
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
      const newTask = generateTask();
      newTask.statusId = teststatus.id;
      newTask.labels = testlabels.map((label) => label.id);

      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('tasks'),
        payload: {
          data: newTask,
        },
      });

      expect(statusCode).toBe(302);

      const task = await models.task.query().findOne({ name: newTask.name }).withGraphFetched('labels');
      const labels = await models.label.query().whereIn('id', task.labels.map((label) => label.id));
      delete newTask.labels;

      expect(task.labels).toMatchObject(labels);
      expect(task).toMatchObject(newTask);
    });

    test('update', async () => {
      const [label] = testlabels;
      const form = {
        name: 'newTaskName',
        statusId: teststatus.id,
        labels: label.id,
      };

      const { statusCode } = await app.inject({
        method: 'PATCH',
        url: `/tasks/${testtask.id}`,
        payload: {
          data: form,
        },
      });

      expect(statusCode).toBe(302);

      const task = await models.task.query().findOne({ name: form.name }).withGraphFetched('labels');
      const tasklabel = await models.label.query().whereIn('id', task.labels.map((lb) => lb.id));

      expect(task.labels).toMatchObject(tasklabel);
      delete form.labels;

      expect(task).toMatchObject(form);
    });

    test('delete', async () => {
      const { id } = testtask;
      const { statusCode } = await app.inject({
        method: 'DELETE',
        url: `/tasks/${id}`,
      });

      expect(statusCode).toBe(302);

      const task = await models.task.query().findById(id);
      expect(task).toBeUndefined();
    });
  });

  describe('negative case', () => {
    test('create', async () => {
      const newTask = generateTask();

      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('tasks'),
        payload: {
          data: newTask,
        },
      });

      expect(statusCode).toBe(302);

      const task = await models.task.query().findOne({ name: newTask.name });
      expect(task).toBeUndefined();
    });

    test('update', async () => {
      const form = {
        name: 'newTaskName',
        statusId: '',
      };

      const { statusCode } = await app.inject({
        method: 'PATCH',
        url: `/tasks/${testtask.id}`,
        payload: {
          data: form,
        },
      });

      expect(statusCode).toBe(302);

      const task = await models.task.query().findOne({ name: form.name });

      expect(task).toBeUndefined();
    });

    test('delete', async () => {
      const { id } = testtaskWithLabel;
      const { statusCode } = await app.inject({
        method: 'DELETE',
        url: `/tasks/${id}`,
      });

      expect(statusCode).toBe(302);

      const task = await models.task.query().findById(id);
      expect(task).not.toBeUndefined();
    });
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
