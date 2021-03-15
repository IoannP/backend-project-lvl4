export default (app) => app
  .get('/users', (req, reply) => {
    const users = app.objection.models.user.query();
    reply.render('users', { users });
  });
