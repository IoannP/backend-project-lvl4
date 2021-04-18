// @ts-check

import path from 'path';
import { Model } from 'objection';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({ fields: ['name'] });

export default class Task extends unique(Model) {
  static get tableName() {
    return 'tasks';
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
        authorId: { type: 'integer' },
        description: { type: 'string' },
        performerId: { type: 'integer' },
        statusId: { type: 'integer', minimum: 1 },
        labelIds: { type: ['array', 'string'] },
      },
    };
  }

  static get relationMappings() {
    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'user'),
        join: {
          from: 'tasks.author_id',
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
    };
  }
}
