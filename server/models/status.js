// @ts-check

import path from 'path';
import { Model } from 'objection';
import objectionUnique from 'objection-unique';

const unique = objectionUnique({ fields: ['name'] });

export default class Status extends unique(Model) {
  static get tableName() {
    return 'statuses';
  }

  async $beforeUpdate() {
    this.updatedAt = new Date().toLocaleString();
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['name'],
      properties: {
        creatorId: { type: 'integer' },
        name: { type: 'string', minLength: 1, maxLength: 255 },
        createdAt: { type: 'string' },
        updatedAt: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      owner: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'user'),
        join: {
          from: 'statuses.creator_id',
          to: 'users.id',
        },
      },
      task: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'task'),
        join: {
          from: 'status.id',
          to: 'task.status_id',
        },
      },
    };
  }
}
