const path = require('path');

const migrations = {
  directory: path.join(__dirname, 'server', 'migrations'),
};

module.exports = () => ({
  production: {
    client: process.env.PROD_DB_TYPE,
    connection: {
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB_NAME,
      host: process.env.PROD_DB_HOST,
      port: process.env.PROD_DB_PORT,
      database_url: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    },
    useNullAsDefault: true,
    migrations,
  },
  development: {
    client: process.env.DEV_DB_TYPE,
    connection: {
      user: process.env.DEV_DB_USER,
      password: process.env.DEV_DB_PASSWORD,
      database: process.env.DEV_DB_NAME,
      host: process.env.DEV_DB_HOST,
      port: process.env.DEV_DB_PORT,
    },
    useNullAsDefault: true,
    migrations,
  },
  test: {
    client: process.env.TEST_DB_TYPE,
    connection: {
      filename: process.env.TEST_DB,
    },
    useNullAsDefault: true,
    migrations,
  },
});
