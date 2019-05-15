import { Entity, model, property } from '@loopback/repository';
import * as uuid from 'uuid/v4';

/**
 * Describes the attributes of a user
 */
@model()
export class User extends Entity {
    @property({
        type: 'string',
        id: true,
        default: () => uuid()
    })
    id: string;

    @property({
        type: 'string',
        required: true,
    })
    username: string;

    @property({
        type: 'string',
        required: true,
    })
    email: string;

    @property({
        type: 'string',
        required: true,
    })
    password: string;

    constructor(data?: Partial<User>) {
        super(data);
    }
}
