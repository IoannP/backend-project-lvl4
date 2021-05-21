#! /usr/bin/env node

import getApp from '../index.js';

const port = process.env.PORT || 5000;
const address = '0.0.0.0';

const runApp = async () => {
  const app = await getApp();

  await app.objection.knex.migrate.latest();
  return app.listen(port, address)
    .then((adrs) => console.log(`Server started listening on ${adrs}`))
    .catch((error) => {
      console.log('Error starting server:', error);
      process.exit(1);
    });
};

runApp();
