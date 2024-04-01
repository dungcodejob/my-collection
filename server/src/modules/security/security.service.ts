import { BcryptService } from '@authentication/services';
import { UserEntity } from '@common/entities';
import { UserService } from '@modules/user';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SecurityService {
  constructor(
    private readonly _userService: UserService,
    private readonly _bcryptService: BcryptService,
  ) {}

  async checkUserExisted(username: string): Promise<boolean> {
    const userExists = await this._userService.findByUsername(username);
    if (userExists) {
      return true;
    }

    return false;
  }

  async getUserIfMatch(
    username: string,
    password: string,
  ): Promise<UserEntity | null> {
    const userExists = await this._userService.findByUsername(username);

    if (!userExists) return null;

    const isMatched = await this._bcryptService.verify(
      password,
      userExists.passwordHash,
    );

    if (!isMatched) return null;

    return userExists;
  }
}
