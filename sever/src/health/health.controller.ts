import { FEATURE_KEY } from '@app/constants';
import { ApiOkResponseSingle, Public } from '@app/decorators';
import { Result } from '@app/models';
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  MikroOrmHealthIndicator,
} from '@nestjs/terminus';

@ApiTags(FEATURE_KEY.HEALTH)
@Controller({
  path: FEATURE_KEY.HEALTH,
  version: VERSION_NEUTRAL,
})
@Public()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: MikroOrmHealthIndicator,
  ) {}

  @ApiOperation({
    summary: 'Health Check',
    description: 'Check if the database connection is healthy and responding.',
  })
  @ApiOkResponseSingle({
    description: 'Database connection is healthy and responding',
  })
  @HealthCheck()
  @Get('/database')
  async checkDatabase() {
    const result = await this.health.check([
      () => this.db.pingCheck('database'),
    ]);

    return Result.toSingle({
      data: result,
      message: 'Database connection is healthy and responding',
    });
  }
}
