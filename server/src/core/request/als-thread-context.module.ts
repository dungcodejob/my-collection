import { Global, Module } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { AlsThreadContext } from './als-thread-context';

@Global()
@Module({
  providers: [AsyncLocalStorage, AlsThreadContext],
  exports: [AlsThreadContext],
})
export class AlsThreadContextModule {}
