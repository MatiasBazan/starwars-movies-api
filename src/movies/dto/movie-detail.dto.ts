import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MovieDetailDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty({ nullable: true })
  @Expose()
  episodeId: number | null;

  @ApiProperty({ nullable: true })
  @Expose()
  openingCrawl: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  director: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  producer: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  releaseDate: string | null;

  @ApiProperty({ type: [String], nullable: true })
  @Expose()
  characters: string[] | null;

  @ApiProperty({ type: [String], nullable: true })
  @Expose()
  planets: string[] | null;

  @ApiProperty({ type: [String], nullable: true })
  @Expose()
  starships: string[] | null;

  @ApiProperty({ type: [String], nullable: true })
  @Expose()
  vehicles: string[] | null;

  @ApiProperty({ type: [String], nullable: true })
  @Expose()
  species: string[] | null;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}
