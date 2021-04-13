exports.up = (knex) => knex.schema.createTable('users', (table) => {
  table.increments('id').primary();
  table.string('firstname').notNullable();
  table.string('lastname').notNullable();
  table.string('email').notNullable();
  table.string('password').notNullable();
  table.timestamp('created_at').defaultTo(knex.fn.now());
  table.timestamp('updated_at').defaultTo(knex.fn.now());
  table.unique('email');
})
  .createTable('statuses', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.string('user_id').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.unique('name');
    table.foreign('user_id').references('users.id');
  })
  .createTable('tasks', (table) => {
    table.increments('id').primary();
    table.string('name').notNullable();
    table.integer('status_id');
    table.integer('author_id');
    table.integer('performer_id');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.unique('name');
    table.foreign('status_id').references('status.id');
    table.foreign('author_id').references('user.id');
    table.foreign('performer_id').references('user.id');
  });

exports.down = (knex) => knex
  .schema
  .dropTable('users')
  .dropTable('statuses')
  .dropTable('tasks');
