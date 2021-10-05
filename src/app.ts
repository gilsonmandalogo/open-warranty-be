import { ApolloServer } from 'apollo-server-express';
import { entities, maxFiles, maxFileSize, port } from 'config';
import express from 'express';
import { graphqlUploadExpress } from 'graphql-upload';
import 'reflect-metadata';
import { InvoiceResolver } from 'resolvers/InvoiceResolver';
import { buildSchema } from 'type-graphql';
import { createConnection, getConnectionOptions } from 'typeorm';

process.title = 'Open-Warranty';
process.on('uncaughtException', e => console.error('uncaughtException:', e));
process.on('unhandledRejection', e => console.error('unhandledRejection:', e));

async function startServer() {
  console.log('Starting server...');

  const connectionOptions = await getConnectionOptions();
  const connection = await createConnection({
    ...connectionOptions,
    entities,
    synchronize: true,
  });
  const schema = await buildSchema({
    resolvers: [
      InvoiceResolver,
    ],
  });
  const apollo = new ApolloServer({ schema });
  await apollo.start();
  const app = express();
  app.use(express.static('public'));
  app.use(graphqlUploadExpress({ maxFileSize, maxFiles }));
  apollo.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}\nApollo server ready at http://localhost:${port}${apollo.graphqlPath}`);
  }).on('error', error => {
    console.error(error);
  });

  const signals: Array<NodeJS.Signals> = ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT', 'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'];

  for (const signal of signals) {
    process.on(signal, async () => {
      console.log(`Received ${signal} — Stopping server...`);
      await apollo.stop();
      await connection.close();
      console.log('Server stopped');
      process.exit(0);
    });
  }
}

startServer();
