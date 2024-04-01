export class CreateUserCommand {
  constructor(
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly username: string,
    public readonly passwordHash: string,
    public readonly email?: string,
  ) {}
}
