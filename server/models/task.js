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
        labelId: { type: 'integer' },
      },
    };
  }

  static get relationMappings() {
    return {
      author: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'user'),
        join: {
          from: 'tasks.author_id',
          to: 'users.id',
        },
      },
      performer: {
        relation: Model.BelongsToOneRelation,
        modelClass: path.join(__dirname, 'user'),
        join: {
          from: 'tasks.porformer_id',
          to: 'users.id',
        },
      },
    };
  }
}
