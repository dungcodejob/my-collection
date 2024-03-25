import { UserEntity } from '@common/entities';
import { EntityManager } from '@mikro-orm/postgresql';

export interface UserRepository {
  findById(id: string): Promise<UserEntity>;
  findByUsername(username: string): Promise<UserEntity>;
  add(entity: UserEntity): UserEntity;
}

export class UserRepositoryImpl implements UserRepository {
  constructor(private readonly _em: EntityManager) {}

  findById(id: string): Promise<UserEntity> {
    return this._em.findOne(UserEntity, id);
  }

  findByUsername(username: string): Promise<UserEntity> {
    return this._em.findOne(UserEntity, { username });
  }
  add(entity: UserEntity): UserEntity {
    this._em.persist(entity);
    return entity;
  }
}
