import faker from 'faker';

export const getRandomUser = () => ({
  firstname: faker.name.firstName(),
  lastname: faker.name.lastName(),
  email: faker.internet.email(),
  password: faker.internet.password(),
});

export const insertUser = async (app, user) => {
  await app.objection.models.user.query().insert(user);
};
