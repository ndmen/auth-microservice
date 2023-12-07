import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignInResponseDto {
  @ApiProperty()
  @IsString()
  access_token: string;
}
