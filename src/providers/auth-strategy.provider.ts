import {Provider, inject, ValueOrPromise} from '@loopback/context';
import {
    AuthenticationBindings,
    AuthenticationMetadata,
    UserProfile,
} from '@loopback/authentication';
import {UserRepository} from '../repositories';
import {BasicStrategy} from 'passport-http';
import {repository} from '@loopback/repository';
import {ExtractJwt, Strategy, StrategyOptions} from 'passport-jwt';
import {User} from '../models';

export class AuthStrategyProvider implements Provider<Strategy | undefined> {

    private JWTOpts: StrategyOptions;

    constructor(
        @inject(AuthenticationBindings.METADATA)
        private metadata: AuthenticationMetadata,
        @inject('jwt.secret')
        private jwtSecret: string,
        @repository(UserRepository) public userRepository: UserRepository,
    ) {
        this.JWTOpts = {
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: this.jwtSecret
        };
    }

    value(): ValueOrPromise<Strategy | undefined> {
        if (!this.metadata) {
            return undefined;
        }

        const name = this.metadata.strategy;

        if (name === 'JwtStrategy') {
            return new Strategy(this.JWTOpts, (jwt_payload, cb) =>
                this.verifyJWT(jwt_payload, cb),
            );
        } else if (name === 'BasicStrategy') {
            return new BasicStrategy((username, password, cb) =>
                this.verifyBasic(username, password, cb),
            );
        } else {
            return Promise.reject(`The strategy ${name} is not available.`);
        }
    }

    async verifyBasic(
        username: string,
        password: string,
        cb: (err: Error | null, user?: UserProfile | false) => void,
    ) {
        try {
            const user = await this.userRepository.findOne({
                where: {username: username, password: password},
            });

            if (!user) {
                cb(null, false);
                return;
            }
            cb(null, {id: user.id, name: user.username, email: user.email});
        } catch (err) {
            cb(err, false);
        }
    }

    async verifyJWT(
        jwt_payload: User,
        cb: (err: Error | null, user?: UserProfile | false) => void,
    ) {
        try {
            const user = await this.userRepository.findOne({
                where: {id: jwt_payload.id},
            });

            if (!user) {
                cb(null, false);
                return;
            }

            cb(null, {id: user.id, name: user.username, email: user.email});
        } catch (err) {
            cb(err, false);
        }
    }
}
