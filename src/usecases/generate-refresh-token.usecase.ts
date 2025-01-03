export class GenerateRefreshTokenUsecase {
  async execute(): Promise<string> {
    const refreshToken = `${await Bun.randomUUIDv7("base64url")}_${new Date().getTime().toString()}`;

    return refreshToken;
  }
}
