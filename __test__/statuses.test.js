import getApp from '../server/index.js';
import {
  getRandomUserData,
  getRandomStatusData,
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
    testuser = getRandomUserData();
    teststatus = getRandomStatusData();

    app.addHook('preHandler', (req, reply, done) => {
      req.user = { id: 1 };
      done();
    });
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    const user = await insertUser(app, testuser);
    await insertStatus(user, teststatus);
  });

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
    const newStatus = getRandomStatusData();
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
    const status = await models.status.query().findOne({ name: teststatus.name });
    const updateForm = { name: 'newStatusName' };

    await status.$query().patch(updateForm);
    const { statusCode } = await app.inject({
      method: 'PATCH',
      url: `/statuses/${status.id}`,
      payload: {
        data: updateForm,
      },
    });

    expect(statusCode).toBe(302);

    const updatedUser = await models.status.query().findOne({ name: updateForm.name });
    expect(updatedUser).toMatchObject(updateForm);
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

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
