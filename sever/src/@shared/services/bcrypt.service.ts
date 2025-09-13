import { InjectJwtConfig, type JwtConfig } from '@app/configs';
import { Injectable } from '@nestjs/common';
import { compare, genSalt, hash } from 'bcrypt';

@Injectable()
export class BcryptService {
  constructor(@InjectJwtConfig() private readonly _jwtConfig: JwtConfig) {}

  async hash(value: string): Promise<string> {
    const salt = await genSalt(this._jwtConfig.jwtSalt);
    return await hash(value, salt);
  }

  async verify(data: string, encrypted: string): Promise<boolean> {
    return await compare(data, encrypted);
  }
}
