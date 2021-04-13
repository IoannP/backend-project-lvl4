const path = require('path');

const migrations = {
  directory: path.join(__dirname, 'server', 'migrations'),
};

module.exports = {
  development: {
    client: 'pg',
    connection: {
      user: 'ioann',
      password: process.env.DEV_DB_PASSWORD,
      database: 'manager_test',
    },
    useNullAsDefault: true,
    migrations,
  },
  test: {
    client: 'pg',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations,
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB,
    },
    useNullAsDefault: true,
    migrations,
  },
};
