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
      database: 'manager',
    },
    useNullAsDefault: true,
    migrations,
  },
  test: {
    client: 'pg',
    connection: {
      user: 'ioann',
      password: process.env.DEV_DB_PASSWORD,
      database: 'test',
    },
    useNullAsDefault: true,
    migrations,
  },
  production: {
    client: 'pg',
    connection: {
      host: process.env.PROD_DB_HOST,
      port: process.env.PROD_DB_PORT,
      user: process.env.PROD_DB_USER,
      password: process.env.PROD_DB_PASSWORD,
      database: process.env.PROD_DB,
      databaseUrl: 'postgres://hbeeepvnlxgqnd:5ee9d49ae3ebb2cdda344d078fc2ca801112b34a2e92881ad616137a4bc4c71f@ec2-54-216-185-51.eu-west-1.compute.amazonaws.com:5432/ddt3ld9cics00d',
    },
    useNullAsDefault: true,
    migrations,
  },
};
