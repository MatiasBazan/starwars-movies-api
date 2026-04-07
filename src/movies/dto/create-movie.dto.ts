import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateMovieDto {
  @ApiProperty({ example: 'A New Hope' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsNumber()
  episodeId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  openingCrawl?: string;

  @ApiPropertyOptional({ example: 'George Lucas' })
  @IsOptional()
  @IsString()
  director?: string;

  @ApiPropertyOptional({ example: 'Gary Kurtz, Rick McCallum' })
  @IsOptional()
  @IsString()
  producer?: string;

  @ApiPropertyOptional({ example: '1977-05-25' })
  @IsOptional()
  @IsString()
  releaseDate?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  characters?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  planets?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  starships?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vehicles?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  species?: string[];
}
