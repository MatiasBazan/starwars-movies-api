import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MoviesService } from '../movies/movies.service';
import { Movie } from '../movies/entities/movie.entity';

interface SwapiFilmProperties {
  title: string;
  episode_id: number;
  opening_crawl: string;
  director: string;
  producer: string;
  release_date: string;
  characters: string[];
  planets: string[];
  starships: string[];
  vehicles: string[];
  species: string[];
}

interface SwapiFilmResult {
  uid: string;
  properties: SwapiFilmProperties;
}

interface SwapiFilmsListResponse {
  result: Array<{ uid: string; properties: { title: string } }>;
}

interface SwapiFilmDetailResponse {
  result: SwapiFilmResult;
}

@Injectable()
export class SwapiService {
  private readonly logger = new Logger(SwapiService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly moviesService: MoviesService,
  ) {}

  async syncMovies(): Promise<{ synced: number; message: string }> {
    const baseUrl = this.configService.get<string>(
      'SWAPI_BASE_URL',
      'https://www.swapi.tech/api',
    );

    const listResponse = await fetch(`${baseUrl}/films`);
    if (!listResponse.ok) {
      throw new Error(`SWAPI list request failed: ${listResponse.status}`);
    }
    const listData = (await listResponse.json()) as SwapiFilmsListResponse;

    let synced = 0;
    for (const film of listData.result) {
      try {
        const detailResponse = await fetch(`${baseUrl}/films/${film.uid}`);
        if (!detailResponse.ok) {
          this.logger.warn(
            `Failed to fetch film ${film.uid}: ${detailResponse.status}`,
          );
          continue;
        }
        const detailData =
          (await detailResponse.json()) as SwapiFilmDetailResponse;
        const props = detailData.result.properties;

        const movieData: Partial<Movie> = {
          title: props.title,
          episodeId: props.episode_id,
          openingCrawl: props.opening_crawl,
          director: props.director,
          producer: props.producer,
          releaseDate: props.release_date,
          characters: props.characters,
          planets: props.planets,
          starships: props.starships,
          vehicles: props.vehicles,
          species: props.species,
        };

        await this.moviesService.upsertByExternalId(film.uid, movieData);
        synced++;
      } catch (err) {
        this.logger.error(`Error syncing film ${film.uid}:`, err);
      }
    }

    return {
      synced,
      message: `Successfully synced ${synced} movies from SWAPI`,
    };
  }
}
