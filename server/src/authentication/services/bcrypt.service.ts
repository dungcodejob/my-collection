import { AuthConfig, InjectAuthConfig } from '@configs/auth.config';
import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class BcryptService {
  constructor(
    @InjectAuthConfig()
    private readonly _authConfig: AuthConfig,
  ) {}

  async hash(value: string): Promise<string> {
    const salt = await genSalt(this._authConfig.jwtSalt);
    return await hash(value, salt);
  }

  async verify(data: string, encrypted: string): Promise<boolean> {
    return await compare(data, encrypted);
  }
}
