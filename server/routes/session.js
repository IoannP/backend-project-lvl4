import i18next from 'i18next';

export default (app) => app
  .get('/session/new', { name: 'newSession' }, (req, reply) => {
    reply.render('session/new');
  })
  .post('/session', { name: 'session' }, app.fp.authenticate('form', async (req, reply, err, user) => {
    if (err) {
      return app.httpErrors.internalServerError(err);
    }
    if (!user) {
      const signInForm = req.body.data;
      const errors = {
        email: [{ message: i18next.t('flash.session.create.error') }],
      };
      return reply.render('session/new', { signInForm, errors });
    }
    await req.logIn(user);
    req.flash('success', i18next.t('flash.session.create.success'));
    return reply.redirect(app.reverse('root'));
  }))
  .delete('/session', (req, reply) => {
    req.session.delete();
    reply.redirect(app.reverse('root'));
    return reply;
  });