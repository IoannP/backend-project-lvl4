import i18next from 'i18next';

export default (app) => app
  .get('/statuses', { name: 'statuses' }, async (req, reply) => {
    const statuses = await app.objection.models.status.query();
    reply.render('statuses/list', { statuses });
    return reply;
  })
  .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
    reply.render('statuses/new');
    return reply;
  })
  .post('/statuses', async (req, reply) => {
    try {
      const { id } = req.user;
      const status = await app.objection.models.status.fromJson(req.body.data);
      const user = await app.objection.models.user.query().findById(id);

      await user.$relatedQuery('status').insert(status);

      req.flash('info', i18next.t('flash.statuses.create.success'));
      reply.redirect(app.reverse('statuses'));
      return reply;
    } catch ({ data }) {
      req.flash('error', i18next.t('flash.statuses.create.error'));
      reply.render('statuses/new', { user: req.body.data, errors: data });
      return reply;
    }
  })
  .get('/statuses/:id/edit', async (req, reply) => {
    const { id } = req.params;
    const status = await app.objection.models.status.query().findById(id);
    reply.render('statuses/edit', { status });
    return reply;
  })
  .patch('/statuses/:id', async (req, reply) => {
    const { id } = req.params;
    try {
      const patchForm = await app.objection.models.status.fromJson(req.body.data);
      const status = await app.objection.models.status.query().findById(id);

      await status.$query().update(patchForm);

      req.flash('info', i18next.t('flash.statuses.edit.success'));
      reply.redirect(app.reverse('statuses'));
      return reply;
    } catch ({ data }) {
      req.body.data.id = id;
      req.flash('error', i18next.t('flash.statuses.edit.error'));
      reply.render('statuses/edit', { status: req.body.data, errors: data });
      return reply;
    }
  })
  .delete('/statuses/:id', async (req, reply) => {
    const { id } = req.params;
    await app.objection.models.status.query().deleteById(id);
    req.flash('info', i18next.t('flash.statuses.delete.success'));
    reply.redirect(app.reverse('statuses'));
    return reply;
  });
