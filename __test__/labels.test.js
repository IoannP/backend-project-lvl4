import { describe, test } from '@jest/globals';
import getApp from '../server/index.js';
import { generateEntities, insertEntities } from './helpers.js';

describe('test labels', () => {
  let app;
  let knex;
  let models;

  let label;
  const labeldata = generateEntities('label');

  beforeAll(async () => {
    app = await getApp();
    knex = app.objection.knex;
    models = app.objection.models;
  });

  beforeEach(async () => {
    await knex.migrate.latest();
    label = await insertEntities.label(models, labeldata);
  });

  describe('positive case', () => {
    test('labels', async () => {
      const { statusCode } = await app.inject({
        method: 'GET',
        url: app.reverse('labels'),
      });

      expect(statusCode).toBe(200);
    });

    test('new', async () => {
      const { statusCode } = await app.inject({
        method: 'GET',
        url: app.reverse('newLabel'),
      });

      expect(statusCode).toBe(200);
    });

    test('create', async () => {
      const newLabel = generateEntities('label');
      const { statusCode } = await app.inject({
        method: 'POST',
        url: app.reverse('labels'),
        payload: {
          data: newLabel,
        },
      });

      expect(statusCode).toBe(302);

      const createdLabel = await models.label.query().findOne({ name: newLabel.name });

      expect(createdLabel).toMatchObject(newLabel);
    });

    test('update', async () => {
      const form = { name: 'newLabelName' };
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

    test('delete', async () => {
      const { id } = label;
      const { statusCode } = await app.inject({
        method: 'DELETE',
        url: `/labels/${id}`,
      });

      expect(statusCode).toBe(302);

      const deletedLabel = await models.label.query().findById(id);
      expect(deletedLabel).toBeUndefined();
    });
  });

  describe('negative case', () => {
    test('create', async () => {
      const { name } = label;
      const newLabelOne = { name: '' };
      const newLabelTwo = { name };

      const responseOne = await app.inject({
        method: 'POST',
        url: app.reverse('labels'),
        payload: {
          data: newLabelOne,
        },
      });

      const responseTwo = await app.inject({
        method: 'POST',
        url: app.reverse('labels'),
        payload: {
          data: newLabelTwo,
        },
      });

      expect(responseOne.statusCode).toBe(200);
      expect(responseTwo.statusCode).toBe(200);

      const abortedLabelOne = await models.label.query().findOne({ name: newLabelOne.name });
      const labelsWithSameName = await models.label.query().where('name', name);

      expect(abortedLabelOne).toBeUndefined();
      expect(labelsWithSameName).toHaveLength(1);
    });

    test('update', async () => {
      const form = { name: '' };

      const { statusCode } = await app.inject({
        method: 'PATCH',
        url: `/labels/${label.id}`,
        payload: {
          data: form,
        },
      });

      expect(statusCode).toBe(200);

      const updatedLabel = await models.label.query().findOne({ name: form.name });
      expect(updatedLabel).toBeUndefined();
    });
  });

  afterEach(async () => {
    await knex.migrate.rollback();
  });

  afterAll(() => {
    app.close();
  });
});
