import faker from 'faker';

export const generateEntities = (type) => {
  switch (type) {
    case 'user':
      return {
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
      };
    case 'status':
      return { name: faker.random.word() };
    case 'label':
      return { name: faker.random.word() };
    case 'task':
      return {
        name: faker.random.word(),
        description: faker.random.word(),
      };
    default:
      throw new Error(`Unrecognizable entity type ${type}`);
  }
};

export const insertEntities = ({
  user: (models, form) => models.user.query().insert(form),
  status: (models, form) => models.status.query().insert(form),
  label: (models, form) => models.label.query().insert(form),
  task: async (user, task, knex) => {
    let newtask;
    await knex.transaction(async (trx) => {
      newtask = await user.$relatedQuery('task', trx).insertGraph(task, { relate: ['labels'] });
    });
    return newtask;
  },
});
