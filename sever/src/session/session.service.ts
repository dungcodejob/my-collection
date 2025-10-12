import { SessionEntity } from '@app/entities';
import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { FindOneOptions, RequiredEntityData } from '@mikro-orm/core';
import { Inject, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

export type SessionFindOptions = FindOneOptions<
  SessionEntity,
  'user' | 'account' | 'tenant',
  '*',
  never
>;

export type SessionCreateInput = Omit<
  RequiredEntityData<SessionEntity>,
  'deviceId' | 'refreshCount' | 'isActive'
>;

@Injectable()
export class SessionService {
  constructor(@Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork) {}

  getUserSessions(userId: string) {
    return this.getActiveSessionsForUser(userId);
  }

  async findOneById(id: string, options?: SessionFindOptions) {
    return this._unitOfWork.session.findOne(
      {
        id,
      },
      options,
    );
  }

  async create(session: SessionCreateInput) {
    return this._unitOfWork.session.create({
      ...session,
      refreshCount: 0,
      isActive: true,
      lastAccessedAt: new Date(),
      deviceId: await this.createDeviceId(
        session.userAgent || 'unknown',
        session.ipAddress || 'unknown',
      ),
    });
  }

  private async createDeviceId(userAgent: string, ip: string): Promise<string> {
    return crypto
      .createHash('md5')
      .update(userAgent + ip)
      .digest('hex');
  }

  private async getActiveSessionsForUser(userId: string) {
    return this._unitOfWork.session.find({
      account: {
        user: {
          id: userId,
        },
      },
      deleteFlag: false,
      isActive: true,
      expiresAt: {
        $gt: new Date(),
      },
    });
  }
  save(): Promise<void> {
    return this._unitOfWork.save();
  }
}
