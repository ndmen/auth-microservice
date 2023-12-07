import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ValidatePasswordResponse, User } from './interfaces/user.interface';
import { User as UserEntity } from './entities/user.entity';
import { CreateUserRequestDto } from './dto/create-user-request.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<User>,
  ) {}

  public async create(createUserDto: CreateUserRequestDto): Promise<User> {
    this.logger.debug(`UserService:create`);
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { first_name, last_name, email, password } = createUserDto;

    const user = await this.userRepository.findOne({ where: { email } });

    if (user) {
      throw new BadRequestException('User alredy exist');
    }

    const salt = await bcrypt.genSalt();
    const hashPassword = await bcrypt.hash(password, salt);

    return this.userRepository.save({
      first_name,
      last_name,
      email,
      password: hashPassword,
    });
  }

  public async findOne(id: number): Promise<User> {
    this.logger.debug(`UserService:findOne`);
    return this.userRepository.findOne({ where: { id } });
  }

  public async findOneByEmail(email: string): Promise<User> {
    this.logger.debug(`UserService:findOneByEmail`);
    return this.userRepository.findOne({ where: { email } });
  }

  public async validatePassword(
    userId: number,
    password: string,
  ): Promise<ValidatePasswordResponse> {
    this.logger.debug(`UserService:validatePassword`);
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return { isValid: false };
    }
    return { isValid: true };
  }
}
