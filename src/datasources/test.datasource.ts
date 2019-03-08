import {inject} from '@loopback/core';
import {juggler} from '@loopback/repository';
import * as config from './test.datasource.json';

export class TestDataSource extends juggler.DataSource {
  static dataSourceName = 'test';

  constructor(
    @inject('datasources.config.test', {optional: true})
    dsConfig: object = config,
  ) {
    super(dsConfig);
  }
}
