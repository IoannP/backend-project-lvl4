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
  });

exports.down = (knex) => knex
  .schema
  .dropTable('users')
  .dropTable('statuses');
