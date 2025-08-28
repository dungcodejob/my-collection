import { SessionEntity } from '@app/entities';
import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { RequiredEntityData } from '@mikro-orm/core';
import { Inject, Injectable } from '@nestjs/common';

type SessionCreateInput = RequiredEntityData<SessionEntity>;
@Injectable()
export class SessionService {
  constructor(@Inject(UNIT_OF_WORK) private readonly _unitOfWork: UnitOfWork) {}

  getUserSessions(userId: string) {
    return this.getActiveSessionsForUser(userId);
  }

  async findOneById(id: string) {
    return this._unitOfWork.session.findOne({
      id,
    });
  }

  create(session: SessionCreateInput) {
    return this._unitOfWork.session.create(session);
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
