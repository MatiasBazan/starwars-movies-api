import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', maxLength: 254 })
  @IsEmail()
  @MaxLength(254)
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'password123', maxLength: 72 })
  @IsString()
  @MaxLength(72)
  @IsNotEmpty()
  password: string;
}
