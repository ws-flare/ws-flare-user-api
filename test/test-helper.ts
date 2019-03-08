import {UnicronUserApiApplication} from '..';
import {
  createRestAppClient,
  givenHttpServerConfig,
  Client,
} from '@loopback/testlab';
import {UserRepository} from '../src/repositories';
import {TestDataSource} from '../src/datasources';

export async function setupApplication(): Promise<AppWithClient> {
  const app = new UnicronUserApiApplication({
    rest: givenHttpServerConfig(),
  });

  await app.boot();
  await app.start();

  const client = createRestAppClient(app);

  return {app, client};
}

export interface AppWithClient {
  app: UnicronUserApiApplication;
  client: Client;
}

export async function givenEmptyDatabase() {
  await new UserRepository(new TestDataSource()).deleteAll();
}
