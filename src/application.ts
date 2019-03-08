import {BootMixin} from '@loopback/boot';
import {ApplicationConfig} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {ServiceMixin} from '@loopback/service-proxy';
import {
    AuthenticationComponent,
    AuthenticationBindings,
} from '@loopback/authentication';
import {MySequence} from './sequence';
import {AuthStrategyProvider} from './providers/auth-strategy.provider';

const {JWT_SECRET} = process.env;

export class UnicronUserApiApplication extends BootMixin(
    ServiceMixin(RepositoryMixin(RestApplication)),
) {
    constructor(options: ApplicationConfig = {}) {
        super(options);

        // Set up the custom sequence
        this.sequence(MySequence);

        this.projectRoot = __dirname;

        this.bind('jwt.secret').to(JWT_SECRET);

        this.component(AuthenticationComponent);
        this.bind(AuthenticationBindings.STRATEGY).toProvider(AuthStrategyProvider);

        // Customize @loopback/boot Booter Conventions here
        this.bootOptions = {
            controllers: {
                // Customize ControllerBooter Conventions here
                dirs: ['controllers'],
                extensions: ['.controller.js'],
                nested: true,
            },
        };
    }
}
