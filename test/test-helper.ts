import { UnicronUserApiApplication } from '..';
import {
    createRestAppClient,
    givenHttpServerConfig,
    Client,
} from '@loopback/testlab';
import { UserRepository } from '../src/repositories';
import { TestDataSource } from '../src/datasources';
import * as mysql from 'mysql';
import { retry } from 'async';

let getRandomPort = require('random-port-as-promised');
let {Docker} = require('node-docker-api');

export async function setupApplication(mysqlPort: number): Promise<AppWithClient> {
    const app = new UnicronUserApiApplication({
        mysqlPort,
        mysqlUsername: 'test',
        mysqlPassword: 'test',
        rest: givenHttpServerConfig(),
    });

    await app.boot();
    await app.migrateSchema();
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

export async function startMysqlContainer(): Promise<{ container: any, port: number }> {
    const docker = new Docker({socketPath: '/var/run/docker.sock'});
    const port = await getRandomPort();

    const container = await docker.container.create({
        Image: 'mysql:5',
        host: '127.0.0.1',
        port: port,
        Env: ['MYSQL_ROOT_PASSWORD=1', 'MYSQL_USER=test', 'MYSQL_PASSWORD=test', 'MYSQL_DATABASE=wsFlareUserApi'],
        HostConfig: {
            PortBindings: {
                '3306/tcp': [
                    {
                        HostPort: `${port}`,
                    },
                ],
            },
        },
    });

    await container.start();

    await new Promise((resolve) => {
        retry({times: 20, interval: 2000}, done => {
            console.log('Trying to connect to mysql');
            const connection = mysql.createConnection({
                host: 'localhost',
                port: port,
                user: 'test',
                password: 'test',
                database: 'wsFlareUserApi'
            });

            connection.connect();

            connection.query('SHOW TABLES', error => {
                done(error);
                connection.end();
            });

        }, () => resolve());
    });

    console.log('Mysql is up and running');

    return {container, port};
}
