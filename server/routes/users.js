export default (app) => app
  .get('/users', async (req, reply) => {
    const users = await app.objection.models.user.query();
    reply.render('users/users', { users });
    return reply;
  })
  .get('/users/new', async (req, reply) => {
    reply.render('users/new');
    return reply;
  });
