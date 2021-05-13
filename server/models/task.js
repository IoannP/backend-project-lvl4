import path from 'path';
import { Model, AjvValidator } from 'objection';
// import objectionUnique from 'objection-unique';

// const unique = objectionUnique({ fields: ['name'] });

export default class Task extends Model {
  static get tableName() {
    return 'tasks';
  }

  static get modifiers() {
    return {
      byStatus(query, stutusid) {
        if (stutusid) query.where('statusId', stutusid);
      },
      byExecutor(query, executorId) {
        if (executorId) query.where('executorId', executorId);
      },
      byLabel(query, labelId, knex) {
        if (labelId) query.whereExists(knex('task_labels').whereRaw('label_id = ?', labelId).whereRaw('task_labels.task_id = tasks.id'));
      },
      byCreator(query, isCreatorUser, userId) {
        if (isCreatorUser) query.where('creatorId', userId);
      },
    };
  }

  static createValidator() {
    return new AjvValidator({
      onCreateAjv: (avj) => avj,
      options: {
        allErrors: true,
        validateSchema: true,
        ownProperties: true,
        coerceTypes: 'array',
        nullable: true,
      },
    });
  }

  async $beforeUpdate() {
    this.updatedAt = new Date().toLocaleString();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name', 'statusId'],
      properties: {
        name: { type: 'string', minLength: 1, maxLength: 255 },
        creatorId: { type: 'integer' },
        description: { type: 'string' },
        performerId: { type: 'integer' },
        statusId: { type: 'integer', minimum: 1, default: null },
        labels: { type: 'array', default: [] },
      },
    };
  }

  static get relationMappings() {
    return {
      creator: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'user'),
        join: {
          from: 'tasks.creator_id',
          to: 'users.id',
        },
      },
      executor: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'user'),
        join: {
          from: 'tasks.executor_id',
          to: 'users.id',
        },
      },
      labels: {
        relation: Model.ManyToManyRelation,
        modelClass: path.join(__dirname, 'label'),
        join: {
          from: 'tasks.id',
          through: {
            from: 'task_labels.task_id',
            to: 'task_labels.label_id',
          },
          to: 'labels.id',
        },
      },
      status: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'status'),
        join: {
          from: 'tasks.status_id',
          to: 'statuses.id',
        },
      },
    };
  }
}
