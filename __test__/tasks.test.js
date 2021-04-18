import getApp from '../server/index.js';
import {
  generateUser,
  generateStatus,
  generateTask,
  generateLabels,
  insertUser,
  insertStatus,
  insertTask,
  insertLabels,
} from './helpers.js';

describe('test tasks', () => {
  let app;
  let knex;
  let models;
  let testuserData;
  let teststatusData;
  let testtaskData;
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
    testlabelsData = generateLabels();

    app.addHook('preHandler', (req, reply, done) => {
      req.user = { id: 1 };
      done();
    });
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    testuser = await insertUser(app, testuserData);
    teststatus = await insertStatus(testuser, teststatusData);
    testlabels = await insertLabels(testtask, testlabelsData);
    testtaskData.statusId = teststatus.id;
    testtaskData.labelIds = 
    testtask = await insertTask(testuser, testtaskData);
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

    const { statusCode } = await app.inject({
      method: 'POST',
      url: app.reverse('tasks'),
      payload: {
        data: newTask,
      },
    });

    expect(statusCode).toBe(302);

    const task = await models.task.query().findOne({ name: newTask.name });

    expect(task).toMatchObject(newTask);
  });

  it('update', async () => {
    const updateForm = { name: 'newTaskName', statusId: teststatus.id };

    const { statusCode } = await app.inject({
      method: 'PATCH',
      url: `/tasks/${testtask.id}`,
      payload: {
        data: updateForm,
      },
    });

    expect(statusCode).toBe(302);

    const updatedTask = await models.task.query().findOne({ name: updateForm.name });
    expect(updatedTask).toMatchObject(updateForm);
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
