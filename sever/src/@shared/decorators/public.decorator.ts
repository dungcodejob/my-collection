import { METADATA_KEY } from '@app/constants';
import { SetMetadata } from '@nestjs/common';

export const Public = () => SetMetadata(METADATA_KEY.IS_PUBLIC, true);
