import { Global, Module } from '@nestjs/common';
import { AlsThreadContext } from './als-thread-context';

@Global()
@Module({
  providers: [AlsThreadContext],
  exports: [AlsThreadContext],
})
export class AlsThreadContextModule {}
