import faker from 'faker';

export const getRandomUserData = () => ({
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

export const getRandomStatusData = () => ({ name: faker.random.word() });

export const insertUser = async (app, form) => {
  const user = await app.objection.models.user.query().insert(form);
  return user;
};

export const insertStatus = async (user, status) => {
  await user.$relatedQuery('status').insert(status);
};
