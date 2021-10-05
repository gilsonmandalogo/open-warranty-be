import { entities } from 'config';
import { createConnection, getConnection } from "typeorm";

beforeAll(async () => {
  await createConnection({
    type: 'sqlite',
    database: ':memory:',
    entities,
  });
});

beforeEach(async () => {
  await getConnection().synchronize(true);
});

afterAll(async () => {
  await getConnection().close();
});
