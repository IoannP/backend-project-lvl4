import faker from 'faker';

export const generateUser = () => ({
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

export const generateStatus = () => ({ name: faker.random.word() });

export const generateTask = () => ({
  name: faker.random.word(),
  description: faker.random.word(),
});

export const generateLabel = () => ({ name: faker.random.word() });

export const insertUser = (app, form) => app.objection.models.user.query().insert(form);

export const insertStatus = (user, form) => user.$relatedQuery('status').insert(form);

export const insertTask = async (user, task, knex) => {
  let newtask;
  await knex.transaction(async (trx) => {
    newtask = await user.$relatedQuery('task', trx).insertGraph(task, { relate: ['labels'] });
  });
  return newtask;
}; // user.$relatedQuery('task').insert(form);

export const insertLabel = (user, form) => user.$relatedQuery('label').insert(form);
