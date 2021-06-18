import { createConnection, getConnection } from "typeorm";

beforeAll(async () => {
  await createConnection({
    type: 'sqlite',
    database: ':memory:',
    entities: ['./src/models/*.ts'],
  });
});

beforeEach(async () => {
  await getConnection().synchronize(true);
});

afterAll(async () => {
  await getConnection().close();
});
