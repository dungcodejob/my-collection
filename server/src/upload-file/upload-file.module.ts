import { Module } from '@nestjs/common';
import { UploadFileController } from './upload-file.controller';
import { UploadFileService } from './upload-file.service';

/**
 * T117: Register FileUploadService in bookmark module
 */
@Module({
  controllers: [UploadFileController],
  providers: [UploadFileService],
  exports: [UploadFileService],
})
export class UploadFileModule {}
