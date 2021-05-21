exports.up = (knex) => knex.schema.createTable('users', (table) => {
  table.increments('id').primary();
  table.string('firstName').notNullable();
  table.string('lastName').notNullable();
  table.string('email').notNullable();
  table.string('password').notNullable();
  table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
  table.timestamp('updated_at', { useTz: true }).defaultTo();
  table.unique('email');
})
  .createTable('statuses', (table) => {
    table.increments('id').unsigned().primary();
    table.string('name').notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true });
    table.unique('name');
  })
  .createTable('tasks', (table) => {
    table.increments('id').unsigned().primary();
    table.string('name').notNullable();
    table.string('description');
    table.integer('creator_id');
    table.integer('executor_id');
    table.integer('status_id').notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true });
    table.unique('name');
    table.foreign('status_id').references('id').inTable('statuses');
    table.foreign('creator_id').references('id').inTable('users');
    table.foreign('executor_id').references('id').inTable('users');
  })
  .createTable('labels', (table) => {
    table.increments('id').unsigned().primary();
    table.string('name').notNullable();
    table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true });
    table.unique('name');
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
