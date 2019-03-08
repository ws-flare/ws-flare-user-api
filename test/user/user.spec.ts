import {Client, expect} from '@loopback/testlab';
import {UnicronUserApiApplication} from '../..';
import {setupApplication, givenEmptyDatabase} from '../test-helper';
import {UserRepository} from '../../src/repositories';
import {TestDataSource} from '../../src/datasources';
import {UserController} from '../../src/controllers';
import {User} from '../../src/models';
import {UserProfile} from '@loopback/authentication';
import { verify } from 'jsonwebtoken';

describe('UserController', () => {
    let app: UnicronUserApiApplication;
    let client: Client;

    before(givenEmptyDatabase);
    before('setupApplication', async () => {
        ({app, client} = await setupApplication());
    });

    after(async () => {
        await app.stop();
    });

    describe('authentication', () => {
        it('should not be authenticated', async () => {
            await client.get('/whoami').expect(401);
        });
    });

    it('should be able to create a new user', async () => {
        const userRepo = new UserRepository(new TestDataSource());
        const userController = new UserController({} as UserProfile, userRepo);
        const userModel = new User({
            username: 'testUser',
            password: 'abc123',
            email: 'test@test.com',
        });

        expect(await userController.create(userModel)).to.match({
            id: '1',
            username: 'testUser',
            password: 'abc123',
            email: 'test@test.com',
        });
    });

    it('should be able to find a user by id', async () => {
        const userRepo = new UserRepository(new TestDataSource());
        const userController = new UserController({} as UserProfile, userRepo);
        const userModel = new User({
            username: 'testUser',
            password: 'abc123',
            email: 'test@test.com',
        });

        const user = await userController.create(userModel);

        expect((await userController.findById(user.id)).id).to.match('1');
    });

    it('should be able to login', async () => {
        await client.post('/login').set('Authorization', 'Basic dGVzdFVzZXI6YWJjMTIz').expect(401);

        await client.post('/users').send({
            username: 'testUser',
            password: 'abc123',
            email: 'test@test.com',
        }).expect(200);

        const response = await client.post('/login').set('Authorization', 'Basic dGVzdFVzZXI6YWJjMTIz');

        expect(response.status).to.eql(200);
        expect(response.body.userId).to.eql('1');
        expect(response.body.token).not.to.be.undefined();

        expect(verify(response.body.token, 'test')).to.containEql({userId: '1', username: 'testUser'});
    });

    it('should be able to get who am I information', async () => {
        await client.get('/whoami').set('Authorization', 'Bearer dGVzdFVzZXI6YWJjMTIz').expect(401);

        await client.post('/users').send({
            username: 'testUser',
            password: 'abc123',
            email: 'test@test.com',
        }).expect(200);

        const {body: {token}} = await client.post('/login').set('Authorization', 'Basic dGVzdFVzZXI6YWJjMTIz').expect(200);

        await client.get('/whoami').set('Authorization', `Bearer ${token}`).expect(200);
    })
});
