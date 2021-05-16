import i18next from 'i18next';
import { ForeignKeyViolationError } from 'objection';

export default (app) => app
  .get('/statuses', { name: 'statuses' }, async (req, reply) => {
    const statuses = await app.objection.models.status.query().orderBy('id');
    reply.render('statuses/list', { statuses });
    return reply;
  })
  .get('/statuses/new', { name: 'newStatus' }, (req, reply) => {
    reply.render('statuses/new');
    return reply;
  })
  .post('/statuses', async (req, reply) => {
    try {
      const { models } = app.objection;

      const status = await models.status.fromJson(req.body.data);

      await models.status.query().insert(status);

      req.flash('info', i18next.t('flash.statuses.create.success'));
      reply.redirect(app.reverse('statuses'));

      return reply;
    } catch (error) {
      req.flash('error', i18next.t('flash.statuses.create.error'));
      reply.render('statuses/new', { user: req.body.data, errors: error.data });
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
      const { models } = app.objection;

      const patchForm = await models.status.fromJson(req.body.data);
      const status = await models.status.query().findById(id);

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
    try {
      await app.objection.models.status.query().deleteById(id);
      req.flash('info', i18next.t('flash.statuses.delete.success'));
    } catch (error) {
      if (error instanceof ForeignKeyViolationError) req.flash('error', i18next.t('flash.statuses.delete.error'));
      else throw error;
    }

    reply.redirect(app.reverse('statuses'));
    return reply;
  });
