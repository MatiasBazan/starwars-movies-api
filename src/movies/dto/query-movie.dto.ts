import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumberString, IsOptional, IsString } from 'class-validator';

export class QueryMovieDto {
  @ApiPropertyOptional({ example: 'hope' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: 'lucas' })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiPropertyOptional({ example: '4' })
  @IsOptional()
  @IsNumberString()
  episode?: string;
}
