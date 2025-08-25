import { UNIT_OF_WORK, type UnitOfWork } from '@app/repositories';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class SessionService {
  constructor(@Inject(UNIT_OF_WORK) private readonly unitOfWork: UnitOfWork) {}

  getUserSessions(userId: string) {
    return this.getActiveSessionsForUser(userId);
  }

  private async getActiveSessionsForUser(userId: string) {
    return this.unitOfWork.session.find({
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
}
