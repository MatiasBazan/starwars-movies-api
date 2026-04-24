import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RegisterDto } from './register.dto';

export class RegisterAdminDto extends RegisterDto {
  @ApiProperty({
    example: 'conexa-admin-2026',
    description: 'Secret key required to register an admin user',
  })
  @IsString()
  @IsNotEmpty()
  adminSecret: string;
}
