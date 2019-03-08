import {inject} from '@loopback/context';
import {
  AuthenticationBindings,
  UserProfile,
  authenticate,
} from '@loopback/authentication';
import {get} from '@loopback/rest';
import {User} from '../models';

export class WhoAmIController {
  constructor(
    @inject(AuthenticationBindings.CURRENT_USER) private user: UserProfile,
  ) {}

  @authenticate('JwtStrategy')
  @get('/whoami', {
    responses: {
      '200': {
        description: 'User instance',
        content: {'application/json': {'x-ts-type': User}},
      },
    },
  })
  whoAmI(): UserProfile {
    return this.user;
  }
}
