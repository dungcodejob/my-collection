import { SessionEntity } from '@app/entities';

export type SessionId = SessionEntity['id'];

export abstract class UserSessionStorage {
  abstract get(sessionId: SessionId): Promise<SessionEntity | undefined>;
  abstract set(userSession: SessionEntity): Promise<SessionId>;
}
