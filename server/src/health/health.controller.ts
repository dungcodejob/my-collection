import {
  FEATURE_KEY,
  MEMORY_HEAP_LIMIT,
  MEMORY_RSS_LIMIT,
} from '@app/constants';
import { ApiOkResponseSingle, Public } from '@app/decorators';
import { ResponseBuilder } from '@app/models';
import { Controller, Get, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
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
    private readonly health: HealthCheckService,
    private readonly mikroOrmHealthIndicator: MikroOrmHealthIndicator,
    private readonly memoryHealthIndicator: MemoryHealthIndicator,
    private readonly diskHealthIndicator: DiskHealthIndicator,
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
      () => this.mikroOrmHealthIndicator.pingCheck('database'),
    ]);

    return ResponseBuilder.toSingle(
      {
        data: result,
      },
      {
        message: 'Database connection is healthy and responding',
      },
    );
  }

  @ApiOperation({
    summary: 'Health Check',
    description: 'Check if the memory heap is healthy and responding.',
  })
  @ApiOkResponseSingle({
    description: 'Memory heap is healthy and responding',
  })
  @HealthCheck()
  @Get('/memory-heap')
  async checkMemoryHeap() {
    const result = await this.health.check([
      () =>
        this.memoryHealthIndicator.checkHeap('memory_heap', MEMORY_HEAP_LIMIT),
    ]);

    return ResponseBuilder.toSingle(
      {
        data: result,
      },
      {
        message: 'Memory heap is healthy and responding',
      },
    );
  }

  @ApiOperation({
    summary: 'Health Check',
    description: 'Check if the memory rss is healthy and responding.',
  })
  @ApiOkResponseSingle({
    description: 'Memory rss is healthy and responding',
  })
  @HealthCheck()
  @Get('/memory-rss')
  async checkMemoryRss() {
    const result = await this.health.check([
      () => this.memoryHealthIndicator.checkRSS('memory_rss', MEMORY_RSS_LIMIT),
    ]);

    return ResponseBuilder.toSingle(
      {
        data: result,
      },
      {
        message: 'Memory rss is healthy and responding',
      },
    );
  }

  @ApiOperation({
    summary: 'Health Check',
    description: 'Check if the storage is healthy and responding.',
  })
  @ApiOkResponseSingle({
    description: 'Storage is healthy and responding',
  })
  @HealthCheck()
  @Get('/storage')
  async checkStorage() {
    const result = await this.health.check([
      () =>
        this.diskHealthIndicator.checkStorage('diskHealth', {
          thresholdPercent: 0.75,
          path: '/',
        }),
    ]);

    return ResponseBuilder.toSingle(
      {
        data: result,
      },
      {
        message: 'Storage is healthy and responding',
      },
    );
  }
}
