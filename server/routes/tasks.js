// ts-check

import i18next from 'i18next';
import _ from 'lodash';

export default (app) => app
  .get('/tasks', { name: 'tasks' }, async (req, reply) => {
    const { models } = app.objection;
    const { id } = req.user;
    console.log('----------------------------------------------------------------------------------------------------------------');

    console.log(reply.request.query);
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
      tsks = tsks.whereExists(function () {
        this.select('*').from('task_labels').whereRaw('label_id = ?', labels).whereRaw('task_labels.task_id = tasks.id');
      });
    }
    if (isCreatorUser) tsks = tsks.where('authorId', id);
    tsks = await tsks;

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
      const { data } = req.body;

      let { labels } = data;
      labels = labels ? [labels].map((value) => ({ id: value })) : [];
      data.labels = labels;
      data.id = task.id;

      await knex.transaction(async (trx) => {
        await models.task.query(trx).upsertGraph(data, {
          relate: true,
          update: true,
          unrelate: true,
        });
      });

      req.flash('info', i18next.t('flash.tasks.edit.success'));
      reply.redirect(app.reverse('tasks'));

      return reply;
    } catch (error) {
      console.log(error);
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
    const { authorId } = await models.task.query().findById(id);

    if (req.user.id !== authorId) {
      req.flash('error', i18next.t('flash.tasks.delete.error'));
    } else {
      await app.objection.models.task.query().deleteById(id);
      req.flash('info', i18next.t('flash.tasks.delete.success'));
    }

    reply.redirect(app.reverse('tasks'));
    return reply;
  });
