export class JwtPayload {
  constructor(
    public readonly sub: string,
    public readonly email: string,
    public readonly username: string,
  ) {}
}
