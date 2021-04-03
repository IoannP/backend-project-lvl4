import i18next from 'i18next';

export default (app) => app
  .get('/statuses', { name: 'statuses' }, async (req, reply) => {
    const statuses = await app.objection.models.status.query();
    reply.render('statuses/statuses', { statuses });
    return reply;
  })
  .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
    reply.render('statuses/new');
    return reply;
  })
  .post('/statuses', async (req, reply) => {
    const { id } = req.params;

    try {
      const status = await app.objection.models.status.fromJson(req.body.data);
      const user = await app.objection.models.user.query().findById(2);

      await user.$relatedQuery('status').insert(status);

      req.flash('info', i18next.t('flash.statuses.create.success'));
      reply.redirect(app.reverse('statuses'));
      return reply;
    } catch (error) {
      console.log(error)
      req.flash('error', i18next.t('flash.statuses.create.error'));
      reply.render('statuses/new', { user: req.body.data, errors: error.data });
      return reply;
    }
  });

// GET /statuses/:id/edit - страница редактирования статуса
// POST /statuses - создание нового статуса
// PATCH /statuses/:id - обновление статуса
// DELETE /statuses/:id - 