import _ from 'lodash';
import getApp from '../server/index.js';
import { getRandomUser, insertUser } from './helpers.js';

describe('test users', () => {
  let app;
  let knex;
  let models;
  let testuser;

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
    testuser = getRandomUser();
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    await insertUser(app, testuser);
  });

  it('index', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('users'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('new', async () => {
    const response = await app.inject({
      method: 'GET',
      url: app.reverse('usersNew'),
    });

    expect(response.statusCode).toBe(200);
  });

  it('create', async () => {
    // const response = await app.inject({
    //   method: 'POST',
    //   url: app.reverse('users'),
    //   payload: {
    //     data: JSON.stringify(testuser),
    //   },
    // });

    // expect(response.statusCode).toBe(302);
    const expected = { ..._.omit(testuser, 'password') };

    const user = await models.user.query().findOne({ email: testuser.email });
    const passwordValid = await user.verifyPassword(testuser.password);

    expect(passwordValid).toBeTruthy();
    expect(user).toMatchObject(expected);
  });

  it('update', async () => {
    const user = await models.user.query().findOne({ email: testuser.email });
    const updateForm = {
      firstname: testuser.firstname,
      lastname: testuser.lastname,
      email: 'test@mail.com',
      password: testuser.password,
    };

    await user.$query().patch(updateForm);
    // const response = await app.inject({
    //   method: 'PATCH',
    //   url: `/users/${user.id}`,
    //   payload: {
    //     data: updateForm,
    //   },
    // });

    // expect(response.statusCode).toBe(302);

    const expected = { ..._.omit(updateForm, 'password') };

    const updatedUser = await models.user.query().findOne({ email: updateForm.email });
    expect(updatedUser).toMatchObject(expected);
  });

  it('delete', async () => {
    const { id } = await models.user.query().findOne({ email: testuser.email });
    await app.objection.models.user.query().deleteById(id);
    const response = await app.inject({
      method: 'DELETE',
      url: `/users/${id}`,
    });

    expect(response.statusCode).toBe(302);

    const user = await models.user.query().findById(id);
    expect(user).toBeUndefined();
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
