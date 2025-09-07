import { MikroORM } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import {
  HealthIndicatorResult,
  HealthIndicatorService,
} from '@nestjs/terminus';

@Injectable()
export class MikroOrmHealthIndicator {
  constructor(
    private readonly orm: MikroORM,
    private readonly healthIndicatorService: HealthIndicatorService,
  ) {}

  async isHealthy(key = 'database'): Promise<HealthIndicatorResult> {
    const indicator = this.healthIndicatorService.check(key);
    try {
      await this.orm.em.getConnection().execute('SELECT 1');
      return indicator.up();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return indicator.down('Unable to connect to database');
    }
  }
}
