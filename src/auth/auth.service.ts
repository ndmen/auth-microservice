import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { JwtService } from '@nestjs/jwt';
import { InjectRedis, Redis } from '@nestjs-modules/ioredis';
import { SignInResponse } from './interfaces/auth.interface';
import { SignInRequestDto } from './dto/sign-in-request.dto';

@Injectable()
export class AuthService {
  private readonly logger: Logger = new Logger(AuthService.name, {
    timestamp: true,
  });

  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  public async signIn(signInDto: SignInRequestDto): Promise<SignInResponse> {
    this.logger.debug(`AuthService:signIn`);
    const validatedUser = await this.validateUser(
      signInDto.email,
      signInDto.password,
    );

    if (!validatedUser) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const tokenKey = `access_token:${validatedUser.id}`;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    let access_token = await this.redis.get(tokenKey);

    if (!access_token) {
      const payload = { sub: validatedUser.id };
      access_token = await this.jwtService.signAsync(payload);
      // Expiration time 24h. In seconds 86400
      await this.redis.setex(tokenKey, 86_400, access_token);
    }

    return { access_token };
  }

  async validateUser(email: string, password: string): Promise<any> {
    this.logger.debug(`AuthService:validateUser`);
    const user = await this.userService.findOneByEmail(email);

    if (Object.keys(user).length === 0) {
      return null;
    }

    const { isValid } = await this.userService.validatePassword(
      user.id,
      password,
    );

    if (!isValid) {
      return null;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-shadow
    const { password: userDatabasePassword, ...result } = user;
    return result;
  }
}
