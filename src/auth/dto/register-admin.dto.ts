import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { RegisterDto } from './register.dto';

export class RegisterAdminDto extends RegisterDto {
  @ApiProperty({ example: 'mi-clave-secreta' })
  @IsString()
  @IsNotEmpty()
  adminSecret: string;
}
