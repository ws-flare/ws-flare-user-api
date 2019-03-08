import {DefaultCrudRepository} from '@loopback/repository';
import {User} from '../models';
import {TestDataSource} from '../datasources';
import {inject} from '@loopback/core';

export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  constructor(@inject('datasources.test') dataSource: TestDataSource) {
    super(User, dataSource);
  }
}
