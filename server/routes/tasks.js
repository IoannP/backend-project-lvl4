import { UniqueViolationError } from 'objection';
import i18next from 'i18next';
import _ from 'lodash';

export default (app) => app
  .get('/tasks', { name: 'tasks' }, async (req, reply) => {
    const { models } = app.objection;
    const { knex } = app.objection;
    const { id } = req.user;

    const executors = await models.user.query();
    const statuses = await models.status.query();
    const lbs = await models.label.query();
    const task = reply.request.query || new models.task();

    const {
      executor,
      status,
      label,
      isCreatorUser,
    } = task;
    const tsks = await models.task.query()
      .modify('byStatus', status)
      .modify('byExecutor', executor)
      .modify('byLabel', label, knex)
      .modify('byCreator', isCreatorUser, id)
      .orderBy('id');

    const formatedTasks = tsks.map(req.getTaskData);
    const tasks = await Promise.all(formatedTasks);

    reply.render('tasks/list', {
      task,
      tasks,
      executors,
      statuses,
      labels: lbs,
    });
    return reply;
  })
  .get('/tasks/new', { name: 'newTask' }, async (req, reply) => {
    const { models } = app.objection;
    const task = reply.entity('task') || new app.objection.models.task();
    const executors = await models.user.query();
    const statuses = await models.status.query();
    const labels = await models.label.query();
    const errors = reply.errors();

    reply.render('tasks/new', {
      task,
      executors,
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
      if (error instanceof UniqueViolationError) {
        error.data = { name: [{ message: 'name already in use' }] };
      }

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

    const executors = await models.user.query();
    const statuses = await models.status.query();
    const labels = await models.label.query();
    const errors = reply.errors();

    reply.render('tasks/edit', {
      task,
      executors,
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
    const { creatorId } = await models.task.query().findById(id);
    const userId = req.user.id;

    if (userId === creatorId) {
      await models.task.query().upsertGraph({
        id,
        labels: [],
      }, {
        unrelate: true,
      });
      await models.task.query().deleteById(id);
      req.flash('info', i18next.t('flash.tasks.delete.success'));
    } else {
      req.flash('error', i18next.t('flash.tasks.delete.error.authError'));
    }

    reply.redirect(app.reverse('tasks'));
  });
