import { ApolloServer } from 'apollo-server-express';
import { host, port } from 'consts';
import express from 'express';
import { graphqlUploadExpress } from 'graphql-upload';
import 'reflect-metadata';
import { InvoiceResolver } from 'resolvers/InvoiceResolver';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';

process.title = 'Warranty';
process.on('uncaughtException', e => console.error('uncaughtException:', e));
process.on('unhandledRejection', e => console.error('unhandledRejection:', e));

async function startServer() {
  const connection = await createConnection();
  const schema = await buildSchema({
    resolvers: [
      InvoiceResolver,
    ],
  });
  const apollo = new ApolloServer({
    schema,
    uploads: false,
  });
  await apollo.start();
  const app = express();
  app.use(express.static('public'));
  app.use(graphqlUploadExpress({ maxFileSize: 20000000, maxFiles: 1 }));
  apollo.applyMiddleware({ app });

  app.listen(port, () => {
    console.log(`🚀 Server ready at ${host}\nApollo server ready at ${host}${apollo.graphqlPath}`);
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
