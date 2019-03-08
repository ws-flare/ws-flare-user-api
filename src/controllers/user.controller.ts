import {
    Count,
    CountSchema,
    Filter,
    repository,
    Where,
} from '@loopback/repository';
import {
    post,
    param,
    get,
    getFilterSchemaFor,
    getWhereSchemaFor,
    patch,
    del,
    requestBody,
} from '@loopback/rest';
import {
    authenticate,
    AuthenticationBindings,
    UserProfile,
} from '@loopback/authentication';
import {User} from '../models';
import {UserRepository} from '../repositories';
import {sign} from 'jsonwebtoken';
import {inject} from '@loopback/core';

export class UserController {

    @inject('jwt.secret')
    private jwtSecret: string;

    constructor(
        @inject(AuthenticationBindings.CURRENT_USER, {optional: true})
        private user: UserProfile,
        @repository(UserRepository) public userRepository: UserRepository,
    ) {
    }

    @authenticate('BasicStrategy')
    @post('/login', {
        responses: {
            '200': {
                description: 'User instance',
                content: {'application/json': {'x-ts-type': User}},
            },
        },
    })
    login(): object {
        return {
            userId: this.user.id,
            token: sign({userId: this.user.id, username: this.user.name}, this.jwtSecret, {
                expiresIn: 31536000,
            })
        }
    }

    @post('/users', {
        responses: {
            '200': {
                description: 'User model instance',
                content: {'application/json': {'x-ts-type': User}},
            },
        },
    })
    async create(@requestBody() user: User): Promise<User> {
        return await this.userRepository.create(user);
    }

    @authenticate('BasicStrategy')
    @get('/users/count', {
        responses: {
            '200': {
                description: 'User model count',
                content: {'application/json': {schema: CountSchema}},
            },
        },
    })
    async count(
        @param.query.object('where', getWhereSchemaFor(User)) where?: Where,
    ): Promise<Count> {
        return await this.userRepository.count(where);
    }

    @authenticate('BasicStrategy')
    @get('/users', {
        responses: {
            '200': {
                description: 'Array of User model instances',
                content: {
                    'application/json': {
                        schema: {type: 'array', items: {'x-ts-type': User}},
                    },
                },
            },
        },
    })
    async find(
        @param.query.object('filter', getFilterSchemaFor(User)) filter?: Filter,
    ): Promise<User[]> {
        return await this.userRepository.find(filter);
    }

    @patch('/users', {
        responses: {
            '200': {
                description: 'User PATCH success count',
                content: {'application/json': {schema: CountSchema}},
            },
        },
    })
    async updateAll(
        @requestBody() user: User,
        @param.query.object('where', getWhereSchemaFor(User)) where?: Where,
    ): Promise<Count> {
        return await this.userRepository.updateAll(user, where);
    }

    @authenticate('BasicStrategy')
    @get('/users/{id}', {
        responses: {
            '200': {
                description: 'User model instance',
                content: {'application/json': {'x-ts-type': User}},
            },
        },
    })
    async findById(@param.path.string('id') id: string): Promise<User> {
        return await this.userRepository.findById(id);
    }

    @authenticate('BasicStrategy')
    @patch('/users/{id}', {
        responses: {
            '204': {
                description: 'User PATCH success',
            },
        },
    })
    async updateById(
        @param.path.string('id') id: string,
        @requestBody() user: User,
    ): Promise<void> {
        await this.userRepository.updateById(id, user);
    }

    @authenticate('BasicStrategy')
    @del('/users/{id}', {
        responses: {
            '204': {
                description: 'User DELETE success',
            },
        },
    })
    async deleteById(@param.path.string('id') id: string): Promise<void> {
        await this.userRepository.deleteById(id);
    }
}
