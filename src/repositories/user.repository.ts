import {DefaultCrudRepository} from '@loopback/repository';
import {User} from '../models';
import {TestDataSource} from '../datasources';
import {inject} from '@loopback/core';

/**
 * User repository ORM for MySQL database
 */
export class UserRepository extends DefaultCrudRepository<
  User,
  typeof User.prototype.id
> {
  constructor(@inject('datasources.mysql') dataSource: TestDataSource) {
    super(User, dataSource);
  }
}
