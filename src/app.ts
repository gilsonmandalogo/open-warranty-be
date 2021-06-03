import { ApolloServer } from 'apollo-server-express';
import { host, port } from 'consts';
import express from 'express';
import { graphqlUploadExpress } from 'graphql-upload';
import 'reflect-metadata';
import { InvoiceResolver } from 'resolvers/InvoiceResolver';
import { buildSchema } from 'type-graphql';
import { createConnection } from 'typeorm';

async function startServer() {
  await createConnection();
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
    console.log(`🚀 Server ready at ${host}${apollo.graphqlPath}`);
  }).on('error', error => {
    console.error(error);
  });
}

startServer();
