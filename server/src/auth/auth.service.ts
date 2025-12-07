import { SLUG_REGEX } from '@app/constants';
import {
  AccountEntity,
  Role,
  SessionEntity,
  TenantEntity,
} from '@app/entities';
import { Errors } from '@app/errors';
import { BcryptService } from '@app/services';
import { TenantService } from '@app/tenant';
import { UserMapper, UserService } from '@app/user';
import { formatName, generatePointSlug } from '@app/utils';
import { EntityManager } from '@mikro-orm/postgresql';
import { Injectable } from '@nestjs/common';
import { isEmail } from 'class-validator';
import slugify from 'slugify';
import { AccountService } from 'src/modules/account';
import { SessionService } from 'src/modules/session';
import {
  AuthResultDto,
  LoginDto,
  RefreshToken,
  RegisterDto,
  SessionInfo,
  TokenTypeEnum,
} from './models';
import { BacklistService, JwtTokenService } from './services';
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
    private readonly _tenantService: TenantService,
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

    const tenant = await this._tenantService.findById(account.tenant.id);

    if (!tenant) {
      throw Errors.Authentication.InvalidCredentials;
    }

    const hasAccess = tenant.canAccessTenant();
    if (!hasAccess) {
      throw Errors.Authentication.AccessDenied;
    }

    const session = await this._sessionService.create({
      ...sessionInfo,
      lastAccessedAt: new Date(),
      account,
      user: account.user,
      tenant,
    });

    await this._em.flush();

    const accessToken = await this._jwtTokenService.generateAccessToken(
      session,
      account,
      tenant,
      origin,
    );
    const refreshToken = await this._jwtTokenService.generateRefreshToken(
      session,
      account,
      tenant,
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

    const tenant = this._tenantService.create({
      name: formattedName,
      slug: await this.generateTenantSlug(formattedName),
      description: `${formattedName}'s workspace`,
    });

    const user = this._userService.create({
      name,
      tenant,
      role: Role.USER,
    });

    this._accountService.create({
      email,
      passwordHash,
      username,
      user,
      tenant,
    });

    await this._em.flush();
  }

  /**
   * Generate random unique name for user or tenant
   * @param type - 'user' or 'tenant' to differentiate name generation
   * @returns Promise<string> - unique generated name
   */
  async generateName(type: 'user' | 'tenant'): Promise<string> {
    const adjectives = [
      'Amazing',
      'Brilliant',
      'Creative',
      'Dynamic',
      'Elegant',
      'Fantastic',
      'Graceful',
      'Harmonious',
      'Innovative',
      'Joyful',
      'Kinetic',
      'Luminous',
      'Magnificent',
      'Noble',
      'Outstanding',
      'Peaceful',
      'Quantum',
      'Radiant',
      'Spectacular',
      'Triumphant',
      'Ultimate',
      'Vibrant',
      'Wonderful',
      'Xenial',
      'Youthful',
      'Zealous',
    ];

    const userNouns = [
      'Explorer',
      'Creator',
      'Builder',
      'Dreamer',
      'Innovator',
      'Pioneer',
      'Visionary',
      'Artist',
      'Craftsman',
      'Designer',
      'Maker',
      'Thinker',
      'Leader',
      'Champion',
      'Hero',
      'Master',
      'Expert',
      'Genius',
      'Wizard',
      'Guardian',
      'Warrior',
      'Scholar',
      'Sage',
      'Mentor',
      'Guide',
    ];

    const tenantNouns = [
      'Workspace',
      'Studio',
      'Lab',
      'Hub',
      'Center',
      'Base',
      'Zone',
      'Space',
      'Realm',
      'Domain',
      'Territory',
      'Kingdom',
      'Empire',
      'Haven',
      'Sanctuary',
      'Forge',
      'Workshop',
      'Academy',
      'Institute',
      'Foundation',
      'Collective',
      'Alliance',
      'Guild',
      'Society',
      'Community',
    ];

    const nouns = type === 'user' ? userNouns : tenantNouns;

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];

    return `${adjective} ${noun}`;
  }

  /**
   * Create URL-friendly slug from tenant name with Unicode support
   * Ensures uniqueness by checking database and adding suffix if needed
   * @param name - tenant name to convert to slug
   * @returns Promise<string> - unique slug
   */
  async generateTenantSlug(name: string): Promise<string> {
    // Normalize and clean the input name
    const cleanName = name
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s\u00C0-\u024F\u1E00-\u1EFF]/g, '') // Keep alphanumeric, spaces, and Vietnamese characters
      .toLowerCase();

    // Generate base slug using slugify with Unicode support
    const baseSlug = slugify(cleanName, {
      lower: true,
      strict: false, // Allow Unicode characters
      locale: 'vi', // Vietnamese locale support
      replacement: '-',
      remove: /[*+~.()'"!:@]/g, // Remove special characters
    });

    // Ensure slug is not empty
    if (!baseSlug || baseSlug.length === 0) {
      const timestamp = Date.now();
      return `tenant-${timestamp}`;
    }

    // Check for uniqueness
    let uniqueSlug = baseSlug;
    let suffix = 0;
    let isUnique = false;

    while (!isUnique) {
      const existingTenant = await this._tenantService.count({
        slug: uniqueSlug,
      });

      if (existingTenant === 0) {
        isUnique = true;
      } else {
        suffix++;
        uniqueSlug = `${baseSlug}-${suffix}`;
      }

      // Prevent infinite loop
      if (suffix > 1000) {
        const timestamp = Date.now();
        uniqueSlug = `${baseSlug}-${timestamp}`;
        break;
      }
    }

    return uniqueSlug;
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

    const tenant = await this._tenantService.findById(account.tenant.id);

    if (!tenant) {
      throw Errors.Authentication.InvalidCredentials;
    }

    const authResult = await this.createAuthResult(
      session,
      account,
      tenant,
      origin,
    );

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
    tenant: TenantEntity,
    origin: string,
  ) {
    const accessToken = await this._jwtTokenService.generateAccessToken(
      session,
      account,
      tenant,
      origin,
    );
    const refreshToken = await this._jwtTokenService.generateRefreshToken(
      session,
      account,
      tenant,
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

  /**
   * Generate name based on user input with cleaning and formatting
   * @param input - user provided name input
   * @param type - 'user' or 'tenant' to differentiate name generation (for fallback only)
   * @returns Promise<string> - processed and formatted name
   */
  async generateNameFromInput(
    input: string,
    type: 'user' | 'tenant',
  ): Promise<string> {
    // Clean and normalize input
    const cleanedInput = this._cleanAndNormalizeInput(input);

    // If input is empty or invalid after cleaning, use random generation
    if (!cleanedInput || cleanedInput.trim().length === 0) {
      return this.generateName(type);
    }

    // Format the cleaned input and return directly
    return formatName(cleanedInput);
  }

  /**
   * Clean and normalize user input
   * @param input - raw user input
   * @returns string - cleaned and normalized input
   */
  private _cleanAndNormalizeInput(input: string): string {
    if (!input || typeof input !== 'string') {
      return '';
    }

    // Remove leading/trailing whitespace
    let cleaned = input.trim();

    // Replace multiple whitespaces with single space
    cleaned = cleaned.replace(/\s+/g, ' ');

    // Remove special characters but keep Unicode letters, numbers, spaces, and common punctuation
    cleaned = cleaned.replace(/[^\p{L}\p{N}\s\-_.()]/gu, '');

    // Limit length to reasonable size (100 characters)
    if (cleaned.length > 100) {
      cleaned = cleaned.substring(0, 100).trim();
    }

    // Remove leading/trailing special characters
    cleaned = cleaned.replace(/^[\-_.()]+|[\-_.()]+$/g, '');

    return cleaned;
  }
}
