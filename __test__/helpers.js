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

export const generateLabels = () => [
  { name: faker.random.word() },
  { name: faker.random.word() },
];

export const insertUser = async (app, form) => {
  const user = await app.objection.models.user.query().insert(form);
  return user;
};

export const insertStatus = async (user, form) => {
  const status = await user.$relatedQuery('status').insert(form);
  return status;
};

export const insertTask = async (user, form) => {
  const task = await user.$relatedQuery('task').insert(form);
  return task;
};

export const insertLabels = async (user, form) => {
  const task = await user.$relatedQuery('task').insert(form);
  return task;
};
