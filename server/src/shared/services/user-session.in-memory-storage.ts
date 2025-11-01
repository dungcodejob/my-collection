import { SessionEntity } from '@app/entities';
import { Injectable } from '@nestjs/common';
import { SessionId, UserSessionStorage } from './user-session';

@Injectable()
export class UserSessionInMemoryStorage implements UserSessionStorage {
  private readonly value: Map<SessionId, SessionEntity> = new Map();

  async get(sessionId: SessionId) {
    const userSession = this.value.get(sessionId);

    return userSession;
  }

  async set(userSession: SessionEntity) {
    const sessionId = Math.random().toString();
    this.value.set(sessionId, userSession);

    return sessionId;
  }
}
