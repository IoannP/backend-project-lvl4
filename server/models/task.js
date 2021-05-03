// @ts-check

import path from 'path';
import { Model, AjvValidator } from 'objection';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({ fields: ['name'] });

export default class Task extends unique(Model) {
  static get tableName() {
    return 'tasks';
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
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'user'),
        join: {
          from: 'tasks.creator_id',
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
      performer: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'user'),
        join: {
          from: 'tasks.performer_id',
          to: 'users.id',
        },
      },
    };
  }
}
