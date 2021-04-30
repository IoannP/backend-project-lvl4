exports.up = (knex) => knex.schema.createTable('users', (table) => {
  table.increments('id').primary();
  table.string('firstname').notNullable();
  table.string('lastname').notNullable();
  table.string('email').notNullable();
  table.string('password').notNullable();
  table.timestamp('created_at').defaultTo(knex.fn.now());
  table.timestamp('updated_at').defaultTo();
  table.unique('email');
})
  .createTable('statuses', (table) => {
    table.increments('id').unsigned().primary();
    table.string('name').notNullable();
    table.integer('user_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.unique('name');
    table.foreign('user_id').references('id').inTable('users');
  })
  .createTable('tasks', (table) => {
    table.increments('id').unsigned().primary();
    table.string('name').notNullable();
    table.string('description');
    table.integer('author_id');
    table.integer('performer_id');
    table.integer('status_id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.unique('name');
    table.foreign('status_id').references('id').inTable('statuses');
    table.foreign('author_id').references('id').inTable('users');
    table.foreign('performer_id').references('id').inTable('users');
  })
  .createTable('labels', (table) => {
    table.increments('id').unsigned().primary();
    table.integer('author_id');
    table.string('name').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.unique('name');
    table.foreign('author_id').references('id').inTable('users');
  })
  .createTable('task_labels', (table) => {
    table.integer('task_id');
    table.integer('label_id');
    table.foreign('task_id').references('id').inTable('tasks');
    table.foreign('label_id').references('id').inTable('labels');
  });

exports.down = (knex) => knex
  .schema
  .dropTable('task_labels')
  .dropTable('labels')
  .dropTable('tasks')
  .dropTable('statuses')
  .dropTable('users');
