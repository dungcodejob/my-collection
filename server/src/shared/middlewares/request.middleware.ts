import { REQUEST_KEY } from '@app/constants';
import { DatabaseDefaultUUID } from '@app/entities';
import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Response } from 'express';

@Injectable()
export class RequestMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    const uuid: string = DatabaseDefaultUUID();

    req[REQUEST_KEY.REQUEST_ID] = uuid;
    next();
  }
}
