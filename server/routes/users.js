import i18next from 'i18next';

export default (app) => app
  .get('/users', { name: 'users' }, async (req, reply) => {
    console.log('--------------------------')
    console.log(process.env.NODE_ENV)
    const users = await app.objection.models.user.query();
    reply.render('users/list', { users });
    return reply;
  })
  .get('/users/new', { name: 'usersNew' }, async (req, reply) => {
    const user = new app.objection.models.user();
    reply.render('users/new', { user });
    return reply;
  })
  .post('/users', async (req, reply) => {
    const { data } = req.body;
    try {
      const user = await app.objection.models.user.fromJson(data);
      await app.objection.models.user.query().insert(user);

      req.flash('info', i18next.t('flash.users.create.success'));
      reply.redirect(app.reverse('root'));
      return reply;
    } catch (error) {
      req.flash('error', i18next.t('flash.users.create.error'));
      reply.render('users/new', { user: data, errors: error.data });
      return reply;
    }
  })
  .get('/users/:id/edit', async (req, reply) => {
    const { id } = req.params;
    const { user } = req;

    if (!req.isAuthenticated()) {
      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('users'));
      return reply;
    }

    if (user.id !== Number(id)) {
      req.flash('error', i18next.t('flash.users.delete.authError'));
      reply.redirect(app.reverse('users'));
      return reply;
    }

    const usr = await app.objection.models.user.query().findById(id);
    reply.render('users/edit', { user: usr });
    return reply;
  })
  .patch('/users/:id', async (req, reply) => {
    const { id } = req.params;
    try {
      const patchForm = await app.objection.models.user.fromJson(req.body.data);
      const user = await app.objection.models.user.query().findById(id);

      await user.$query().patch(patchForm);

      req.flash('info', i18next.t('flash.users.edit.success'));
      reply.redirect('/users');
      return reply;
    } catch ({ data }) {
      req.flash('error', i18next.t('flash.users.edit.error'));
      req.body.data.id = id;
      reply.render('users/edit', { user: req.body.data, errors: data });
      return reply;
    }
  })
  .delete('/users/:id', async (req, reply) => {
    const { id } = req.params;
    const { user } = req;

    if (!req.isAuthenticated()) {
      req.flash('error', i18next.t('flash.authError'));
      reply.redirect(app.reverse('users'));
      return reply;
    }

    if (user.id !== Number(id)) {
      req.flash('error', i18next.t('flash.users.delete.authError'));
      reply.redirect(app.reverse('users'));
      return reply;
    }

    try {
      await app.objection.models.user.query().deleteById(id);
      req.flash('info', i18next.t('flash.users.delete.success'));
      reply.redirect(app.reverse('root'));
    } catch (error) {
      req.flash('error', i18next.t('flash.users.delete.error'));
      reply.redirect(app.reverse('users'));
    }

    return reply;
  });
