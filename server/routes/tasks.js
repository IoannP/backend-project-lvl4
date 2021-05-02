import i18next from 'i18next';
import _ from 'lodash';

export default (app) => app
  .get('/tasks', { name: 'tasks' }, async (req, reply) => {
    const { models } = app.objection;
    const { knex } = app.objection;
    const { id } = req.user;

    const performers = await models.user.query();
    const statuses = await models.status.query();
    const lbs = await models.label.query();
    const task = reply.request.query || new models.task();

    const {
      performerId,
      statusId,
      labels,
      isCreatorUser,
    } = task;
    let tsks = models.task.query();
    if (performerId) tsks = tsks.where('performerId', performerId);
    if (statusId) tsks = tsks.where('statusId', statusId);
    if (labels) {
      tsks = tsks.whereExists(knex('task_labels').whereRaw('label_id = ?', labels).whereRaw('task_labels.task_id = tasks.id'));
    }
    if (isCreatorUser) tsks = tsks.where('authorId', id);
    tsks = await tsks.orderBy('id');

    const formatedTasks = tsks.map(req.getTaskData);
    const tasks = await Promise.all(formatedTasks);

    reply.render('tasks/list', {
      task,
      tasks,
      performers,
      statuses,
      labels: lbs,
    });
    return reply;
  })
  .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
    const { models } = app.objection;
    const task = reply.entity('task') || new app.objection.models.task();
    const performers = await models.user.query();
    const statuses = await models.status.query();
    const labels = await models.label.query();
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
      const { knex } = app.objection;

      const task = await models.task.fromJson(req.body.data);
      const user = await models.user.query().findById(id);
      const labels = task.labels.map((value) => ({ id: value }));
      task.labels = labels;

      await knex.transaction(async (trx) => {
        await user.$relatedQuery('task', trx).insertGraph(task, { relate: ['labels'] });
      });

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
    const task = await models.task.query().findById(id).withGraphFetched('labels');
    _.update(task, 'labels', (labels) => labels.map((label) => label.id));

    const performers = await models.user.query();
    const statuses = await models.status.query();
    const labels = await models.label.query();
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
      const { knex } = app.objection;

      const task = await models.task.query().findById(id);
      const updateData = await models.task.fromJson(req.body.data);
      updateData.labels = updateData.labels.map((value) => ({ id: value }));
      updateData.id = task.id;

      await knex.transaction(async (trx) => {
        await models.task.query(trx).upsertGraph(updateData, {
          relate: true,
          update: true,
          unrelate: true,
        });
      });

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
    const { models } = app.objection;
    const { authorId, labels } = await models.task.query().findById(id).withGraphFetched('labels');

    if (labels.length > 0) {
      req.flash('error', i18next.t('flash.tasks.delete.error.dependency'));
    }
    if (req.user.id !== authorId) {
      req.flash('error', i18next.t('flash.tasks.delete.error.authError'));
    }
    if (req.user.id === authorId && labels.length === 0) {
      await models.task.query().deleteById(id);
      req.flash('info', i18next.t('flash.tasks.delete.success'));
    }

    reply.redirect(app.reverse('tasks'));
    return reply;
  });
