import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MovieListItemDto {
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
  releaseDate: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  director: string | null;
}
