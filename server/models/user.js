import path from 'path';
import { Model } from 'objection';
import objectionUnique from 'objection-unique';
import objectionPassword from 'objection-password';

const unique = objectionUnique({ fields: ['email'] });
const password = objectionPassword();

export default class User extends unique(password(Model)) {
  static get tableName() {
    return 'users';
  }

  getFullName() {
    return `${this.firstname} ${this.lastname}`;
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['firstname', 'lastname', 'email', 'password'],
      properties: {
        firstname: { type: 'string', minLength: 1, maxLength: 255 },
        lastname: { type: 'string', minLength: 1, maxLength: 255 },
        email: { type: 'string', minLength: 1, maxLength: 255 },
        password: { type: 'string', minLength: 7, maxLength: 255 },
        date_created: { type: 'string' },
        date_updated: { type: 'string' },
      },
    };
  }

  static get relationMappings() {
    return {
      status: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'status'),
        join: {
          from: 'users.id',
          to: 'statuses.user_id',
        },
      },
      author: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'task'),
        join: {
          from: 'users.id',
          to: 'tasks.author_id',
        },
      },
      performer: {
        relation: Model.HasManyRelation,
        modelClass: path.join(__dirname, 'task'),
        join: {
          from: 'users.id',
          to: 'tasks.performer_id',
        },
      },
    };
  }
}
