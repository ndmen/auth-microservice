import { Body, Controller, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { CreateUserRequestDto } from 'src/user/dto/create-user-request.dto';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { SignInRequestDto } from './dto/sign-in-request.dto';
import { CreateUserResponseDto } from '../user/dto/create-user-response.dto';
import { SignInResponseDto } from './dto/sign-in-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService,
  ) {}

  @Post('/signup')
  @ApiOperation({
    summary: 'Sign up',
  })
  @ApiBody({
    type: CreateUserRequestDto,
  })
  @ApiResponse({
    type: CreateUserResponseDto,
    status: HttpStatus.CREATED,
  })
  async signUp(@Body() createUserDto: CreateUserRequestDto) {
    return this.userService.create(createUserDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('/signin')
  @ApiOperation({
    summary: 'Sign in',
  })
  @ApiBody({
    type: SignInRequestDto,
  })
  @ApiResponse({
    type: SignInResponseDto,
    status: HttpStatus.CREATED,
  })
  async signIn(@Body() signInDto: SignInRequestDto) {
    return this.authService.signIn(signInDto);
  }
}
