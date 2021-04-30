import getApp from '../server/index.js';
import {
  generateUser,
  generateLabel,
  insertUser,
  insertLabel,
} from './helpers.js';

describe('test labels', () => {
  let app;
  let knex;
  let models;
  let testuser;
  let testlabel;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
    testuser = generateUser();
    testlabel = generateLabel();

    app.addHook('preHandler', (req, reply, done) => {
      req.user = { id: 1 };
      done();
    });
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    const user = await insertUser(app, testuser);
    await insertLabel(user, testlabel);
  });

  it('statuses', async () => {
    const { statusCode } = await app.inject({
      method: 'GET',
      url: app.reverse('labels'),
    });

    expect(statusCode).toBe(200);
  });

  it('new', async () => {
    const { statusCode } = await app.inject({
      method: 'GET',
      url: app.reverse('newLabel'),
    });

    expect(statusCode).toBe(200);
  });

  it('create', async () => {
    const newLabel = generateLabel();
    const { statusCode } = await app.inject({
      method: 'POST',
      url: app.reverse('labels'),
      payload: {
        data: newLabel,
      },
    });

    expect(statusCode).toBe(302);

    const label = await models.label.query().findOne({ name: newLabel.name });

    expect(label).toMatchObject(newLabel);
  });

  it('update', async () => {
    const label = await models.label.query().findOne({ name: testlabel.name });
    const form = { name: 'newLabelName' };

    //await label.$query().patch(form);
    const { statusCode } = await app.inject({
      method: 'PATCH',
      url: `/labels/${label.id}`,
      payload: {
        data: form,
      },
    });

    expect(statusCode).toBe(302);

    const updatedLabel = await models.label.query().findOne({ name: form.name });
    expect(updatedLabel).toMatchObject(form);
  });

  it('delete', async () => {
    const { id } = await models.label.query().findOne({ name: testlabel.name });
    await models.label.query().deleteById(id);
    const { statusCode } = await app.inject({
      method: 'DELETE',
      url: `/labels/${id}`,
    });

    expect(statusCode).toBe(302);

    const label = await models.label.query().findById(id);
    expect(label).toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
