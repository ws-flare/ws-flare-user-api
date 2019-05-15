import { BootMixin } from '@loopback/boot';
import { ApplicationConfig } from '@loopback/core';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication } from '@loopback/rest';
import { ServiceMixin } from '@loopback/service-proxy';
import {
    AuthenticationComponent,
    AuthenticationBindings,
} from '@loopback/authentication';
import { MySequence } from './sequence';
import { AuthStrategyProvider } from './providers/auth-strategy.provider';

const {JWT_SECRET} = process.env;

/**
 * Bootstraps the application and sets up dependency injection
 */
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

        this.bind('mysql.host').to(options.mysqlHost);
        this.bind('mysql.port').to(options.mysqlPort);
        this.bind('mysql.username').to(options.mysqlUsername);
        this.bind('mysql.password').to(options.mysqlPassword);

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
