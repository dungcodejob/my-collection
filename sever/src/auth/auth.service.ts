import { AccountService } from '@app/account';
import { SLUG_REGEX } from '@app/constants';
import { AccountEntity, Role, SessionEntity } from '@app/entities';
import { Errors } from '@app/errors';
import { SessionService } from '@app/session';
import { UserMapper, UserService } from '@app/user';
import { formatName, generatePointSlug } from '@app/utils';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { isEmail } from 'class-validator';
import {
  AuthResultDto,
  LoginDto,
  RefreshToken,
  RegisterDto,
  SessionInfo,
  TokenTypeEnum,
} from './models';
import { BacklistService, BcryptService, JwtTokenService } from './services';
@Injectable()
export class AuthService {
  constructor(
    private readonly _accountService: AccountService,
    private readonly _userService: UserService,
    private readonly _bcryptService: BcryptService,
    private readonly _jwtTokenService: JwtTokenService,
    private readonly _backlistService: BacklistService,
    private readonly _sessionService: SessionService,
    private readonly _userMapper: UserMapper,
    private readonly _em: EntityManager,
  ) {}

  async login(
    dto: LoginDto,
    sessionInfo: SessionInfo,
    origin?: string,
  ): Promise<AuthResultDto> {
    const { emailOrUsername, password } = dto;

    const account = await this.getAccountByEmailOrUsername(emailOrUsername);

    if (!account) {
      throw Errors.Authentication.InvalidCredentials;
    }

    const isMatchPassword = await this._bcryptService.verify(
      password,
      account.passwordHash,
    );

    if (!isMatchPassword) {
      throw Errors.Authentication.InvalidCredentials;
    }

    const session = await this._sessionService.create({
      ...sessionInfo,
      lastAccessedAt: new Date(),
      account,
      user: account.user,
    });

    await this._em.flush();

    const accessToken = await this._jwtTokenService.generateAccessToken(
      session,
      account,
      origin,
    );
    const refreshToken = await this._jwtTokenService.generateRefreshToken(
      session,
      account,
      origin,
    );

    await this.updateSessionToken(session, refreshToken, false);

    return {
      accessToken,
      refreshToken,
      user: this._userMapper.toUserInfo(account.user),
    };
  }

  async register(dto: RegisterDto) {
    const { email, password, name } = dto;
    const isEmailExists = await this.checkEmailExists(email);

    if (isEmailExists) {
      throw Errors.Authentication.EmailAlreadyExists;
    }

    const formattedName = formatName(name);
    const passwordHash = await this._bcryptService.hash(password);
    const username = await this.generateUsername(formattedName);

    const user = this._userService.create({
      name,
      role: Role.USER,
    });

    this._accountService.create({
      email,
      passwordHash,
      username,
      user,
    });

    await this._em.flush();
  }

  async refreshToken(
    refreshToken: string,
    origin: string,
  ): Promise<AuthResultDto> {
    const tokenPayload = await this._jwtTokenService.verifyToken(
      refreshToken,
      TokenTypeEnum.REFRESH,
    );
    await this.validateToken(tokenPayload.id, tokenPayload.tokenId);

    const session = (await this._sessionService.findOneById(
      tokenPayload.id,
    )) as SessionEntity;
    await this.validateSession(session, refreshToken);

    const account = await this._accountService.findOneByCredentials(
      session.account.id,
      tokenPayload.version,
    );
    await this.validateAccount(account, tokenPayload);

    const authResult = await this.createAuthResult(session, account, origin);

    await this.revokeRefreshToken(session, tokenPayload);
    await this.updateSessionToken(session, authResult.refreshToken, true);

    return authResult;
  }

  async logout(refreshToken: string) {
    const tokenPayload = await this._jwtTokenService.verifyToken(
      refreshToken,
      TokenTypeEnum.REFRESH,
    );
    await this.validateToken(tokenPayload.id, tokenPayload.tokenId);
    const session = (await this._sessionService.findOneById(
      tokenPayload.id,
    )) as SessionEntity;
    await this.validateSession(session, refreshToken);

    const account = await this._accountService.findOneByCredentials(
      session.account.id,
      tokenPayload.version,
    );
    await this.validateAccount(account, tokenPayload);
    await this.revokeRefreshToken(session, tokenPayload);
  }

  private async createAuthResult(
    session: SessionEntity,
    account: AccountEntity,
    origin: string,
  ) {
    const accessToken = await this._jwtTokenService.generateAccessToken(
      session,
      account,
      origin,
    );
    const refreshToken = await this._jwtTokenService.generateRefreshToken(
      session,
      account,
      origin,
    );
    return {
      accessToken,
      refreshToken,
      user: this._userMapper.toUserInfo(account.user),
    };
  }

  private async revokeRefreshToken(
    session: SessionEntity,
    tokenPayload: RefreshToken,
  ) {
    session.isActive = false;
    await this._em.flush();

    await this._backlistService.addTokenBlacklist(
      tokenPayload.id,
      tokenPayload.tokenId,
      tokenPayload.exp,
    );
  }

  private async validateToken(sessionId: string, tokenId: string) {
    const isBlacklisted = await this._backlistService.checkIfTokenIsBlacklisted(
      sessionId,
      tokenId,
    );

    if (isBlacklisted) {
      throw Errors.Authentication.InvalidToken;
    }

    return;
  }

  private async validateSession(
    session: SessionEntity | null,
    token: string,
  ): Promise<boolean> {
    if (!session || !session.isActive) {
      throw Errors.Authentication.InvalidToken;
    }

    const isMatch = await this._bcryptService.verify(
      token,
      session.refreshTokenHash || '',
    );

    if (!isMatch) {
      throw Errors.Authentication.InvalidToken;
    }

    return true;
  }

  private async validateAccount(
    account: AccountEntity,
    tokenPayload: RefreshToken,
  ) {
    if (!account) {
      throw Errors.Authentication.InvalidCredentials;
    }

    if (account.version !== tokenPayload.version) {
      throw Errors.Authentication.InvalidCredentials;
    }
  }

  private async updateSessionToken(
    session: SessionEntity,
    token: string,
    isRefreshToken: boolean,
  ) {
    session.refreshTokenHash = await this._bcryptService.hash(token);
    session.lastAccessedAt = new Date();
    session.isActive = true;
    session.expiresAt = new Date(
      Date.now() + this._jwtTokenService.getRefreshTokenExpirationMs(),
    );
    if (isRefreshToken) {
      session.refreshCount++;
    }
    await this._em.flush();
  }

  private async getAccountByEmailOrUsername(emailOrUsername: string) {
    if (emailOrUsername.includes('@')) {
      if (!isEmail(emailOrUsername)) {
        throw Errors.Authentication.InvalidEmailOrUsername;
      }
      return this._accountService.findOneByEmail(emailOrUsername);
    }

    if (
      emailOrUsername.length < 3 ||
      emailOrUsername.length > 106 ||
      !SLUG_REGEX.test(emailOrUsername)
    ) {
      throw Errors.Authentication.InvalidEmailOrUsername;
    }

    return this._accountService.findOneByUsername(emailOrUsername);
  }

  private async checkEmailExists(email: string) {
    const count = await this._accountService.count({
      email,
    });

    return count > 0;
  }

  private async generateUsername(name: string): Promise<string> {
    const pointSlug = generatePointSlug(name);
    const count = await this._accountService.count({
      username: {
        $like: `${pointSlug}%`,
      },
    });

    if (count > 0) {
      return `${pointSlug}${count}`;
    }

    return pointSlug;
  }
}
