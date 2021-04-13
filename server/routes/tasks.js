import i18next from 'i18next';
import _ from 'lodash';

export default (app) => app
  .get('/tasks', { name: 'tasks' }, async (req, reply) => {
    const tks = await app.objection.models.task.query();
    const formatedTasks = tks.map(req.getTaskData);
    const tasks = await Promise.all(formatedTasks);

    reply.render('tasks/list', { tasks });
    return reply;
  })
  .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
    const { models } = app.objection;
    const task = reply.entity('task') || new app.objection.models.task();
    const performers = await models.user.query();
    const statuses = await models.status.query();
    const labels = [];
    const errors = reply.errors();

    reply.render('tasks/new', {
      task,
      performers,
      statuses,
      labels,
      errors,
    });
    return reply;
  })
  .post('/tasks', async (req, reply) => {
    try {
      const { id } = req.user;
      const { models } = app.objection;
      const data = _.omitBy(req.body.data, (value) => value.length === 0);

      if (_.has(data, 'statusId')) _.update(data, 'statusId', _.toNumber);
      if (_.has(data, 'performerId')) _.update(data, 'performerId', _.toNumber);

      const task = await models.task.fromJson(data);
      const user = await models.user.query().findById(id);

      await user.$relatedQuery('author').insert(task);

      req.flash('info', i18next.t('flash.tasks.create.success'));
      reply.redirect(app.reverse('tasks'));
      return reply;
    } catch (error) {
      req.flash('error', i18next.t('flash.tasks.create.error'));
      req.errors(error.data);
      req.entity('task', req.body.data);
      reply.redirect(app.reverse('newTask'));
      return reply;
    }
  })
  .get('/tasks/:id', async (req, reply) => {
    const { id } = req.params;
    const task = await app.objection.models.task.query().findById(id);

    const taskData = await req.getTaskData(task);
    reply.render('tasks/view', { task: taskData });
    return reply;
  })
  .get('/tasks/:id/edit', async (req, reply) => {
    const { id } = req.params;
    const { models } = app.objection;
    const task = await models.task.query().findById(id);
    const performers = await models.user.query();
    const statuses = await models.status.query();
    const labels = [];
    const errors = reply.errors();

    reply.render('tasks/edit', {
      task,
      performers,
      statuses,
      labels,
      errors,
    });
    return reply;
  })
  .patch('/tasks/:id', async (req, reply) => {
    const { id } = req.params;
    try {
      const { models } = app.objection;
      const patchForm = _.omitBy(req.body.data, (value) => value.length === 0);

      if (_.has(patchForm, 'statusId')) _.update(patchForm, 'statusId', _.toNumber);
      if (_.has(patchForm, 'performerId')) _.update(patchForm, 'performerId', _.toNumber);

      const task = await models.task.query().findById(id);

      await task.$query().update(patchForm);

      req.flash('info', i18next.t('flash.tasks.edit.success'));
      reply.redirect(app.reverse('tasks'));

      return reply;
    } catch (error) {
      req.flash('error', i18next.t('flash.tasks.edit.error'));
      req.errors(error.data);
      req.entity('task', req.body.data);
      reply.redirect(`/tasks/${id}/edit`);
      return reply;
    }
  })
  .delete('/tasks/:id', async (req, reply) => {
    const { id } = req.params;
    await app.objection.models.task.query().deleteById(id);
    req.flash('info', i18next.t('flash.tasks.delete.success'));
    reply.redirect(app.reverse('tasks'));
    return reply;
  });
