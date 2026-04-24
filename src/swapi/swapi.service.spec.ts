import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SwapiService } from './swapi.service';
import { MoviesService } from '../movies/movies.service';
import { Movie } from '../movies/entities/movie.entity';

const mockFilmsList = {
  result: [{ uid: '1', properties: { title: 'A New Hope' } }],
};

const mockFilmDetail = {
  result: {
    uid: '1',
    properties: {
      title: 'A New Hope',
      episode_id: 4,
      opening_crawl: 'It is a period of civil war...',
      director: 'George Lucas',
      producer: 'Gary Kurtz',
      release_date: '1977-05-25',
      characters: ['https://www.swapi.tech/api/people/1'],
      planets: ['https://www.swapi.tech/api/planets/1'],
      starships: ['https://www.swapi.tech/api/starships/2'],
      vehicles: [],
      species: [],
    },
  },
};

const mockUpsertedMovie: Partial<Movie> = {
  id: 'uuid-1',
  title: 'A New Hope',
  externalId: '1',
};

describe('SwapiService', () => {
  let service: SwapiService;
  let moviesService: jest.Mocked<MoviesService>;

  beforeEach(async () => {
    global.fetch = jest.fn();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SwapiService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal?: unknown) => {
              if (key === 'SWAPI_BASE_URL') return 'https://www.swapi.tech/api';
              return defaultVal;
            }),
          },
        },
        {
          provide: MoviesService,
          useValue: { upsertByExternalId: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<SwapiService>(SwapiService);
    moviesService = module.get(MoviesService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  it('should sync movies from SWAPI', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilmsList,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilmDetail,
      });

    moviesService.upsertByExternalId.mockResolvedValue(
      mockUpsertedMovie as Movie,
    );

    const result = await service.syncMovies();

    expect(result.synced).toBe(1);
    expect(moviesService.upsertByExternalId).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({ title: 'A New Hope' }),
    );
  });

  it('should not duplicate movies on re-sync (upsert behavior)', async () => {
    const okResponse = (body: unknown) => ({
      ok: true,
      json: async () => body,
    });

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce(okResponse(mockFilmsList))
      .mockResolvedValueOnce(okResponse(mockFilmDetail))
      .mockResolvedValueOnce(okResponse(mockFilmsList))
      .mockResolvedValueOnce(okResponse(mockFilmDetail));

    moviesService.upsertByExternalId.mockResolvedValue(
      mockUpsertedMovie as Movie,
    );

    await service.syncMovies();
    await service.syncMovies();

    expect(moviesService.upsertByExternalId).toHaveBeenCalledTimes(2);
  });

  it('should handle SWAPI API errors gracefully', async () => {
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => mockFilmsList,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

    const result = await service.syncMovies();

    expect(result.synced).toBe(0);
    expect(moviesService.upsertByExternalId).not.toHaveBeenCalled();
  });
});
