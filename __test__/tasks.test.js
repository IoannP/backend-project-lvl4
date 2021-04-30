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
  let testtaskData;
  let testlabelsData;
  let testuser;
  let teststatus;
  let testtask;
  let testlabels;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
    testuserData = generateUser();
    teststatusData = generateStatus();
    testtaskData = generateTask();
    testlabelsData = [generateLabel(), generateLabel()];

    app.addHook('preHandler', (req, reply, done) => {
      req.user = { id: 1 };
      done();
    });
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    testuser = await insertUser(app, testuserData);
    teststatus = await insertStatus(testuser, teststatusData);
    testtaskData.statusId = teststatus.id;
    testtask = await insertTask(testuser, testtaskData);
    testlabels = await insertLabel(testuser, testlabelsData);
  });

  it('tasks', async () => {
    const { statusCode } = await app.inject({
      method: 'GET',
      url: app.reverse('tasks'),
    });

    expect(statusCode).toBe(200);
  });

  it('new', async () => {
    const { statusCode } = await app.inject({
      method: 'GET',
      url: app.reverse('newTask'),
    });

    expect(statusCode).toBe(200);
  });

  it('create', async () => {
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

  it('update', async () => {
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

  it('delete', async () => {
    const { id } = testtask;
    await models.task.query().deleteById(id);
    const { statusCode } = await app.inject({
      method: 'DELETE',
      url: `/statuses/${id}`,
    });

    expect(statusCode).toBe(302);

    const status = await models.status.query().findById(id);
    expect(status).toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
