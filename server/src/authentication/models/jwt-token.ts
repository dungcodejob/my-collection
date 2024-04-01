export class JwtToken {
  constructor(
    public readonly access: string,
    public readonly refresh: string,
  ) {}
}
