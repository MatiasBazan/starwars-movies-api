import { Test, TestingModule } from '@nestjs/testing';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { SwapiService } from '../swapi/swapi.service';
import { Movie } from './entities/movie.entity';

const mockMovie: Partial<Movie> = {
  id: 'uuid-1',
  title: 'A New Hope',
  episodeId: 4,
};

const mockMoviesService = {
  findAll: jest.fn().mockResolvedValue({ data: [mockMovie], total: 1, page: 1, limit: 10 }),
  findOne: jest.fn().mockResolvedValue(mockMovie),
  create: jest.fn().mockResolvedValue(mockMovie),
  update: jest.fn().mockResolvedValue(mockMovie),
  remove: jest.fn().mockResolvedValue(undefined),
};

const mockSwapiService = {
  syncMovies: jest.fn().mockResolvedValue({ synced: 6, message: 'Synced 6 movies' }),
};

describe('MoviesController', () => {
  let controller: MoviesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MoviesController],
      providers: [
        { provide: MoviesService, useValue: mockMoviesService },
        { provide: SwapiService, useValue: mockSwapiService },
      ],
    }).compile();

    controller = module.get<MoviesController>(MoviesController);
  });

  it('findAll should call MoviesService.findAll with parsed page and limit', async () => {
    const result = await controller.findAll('1', '10');
    expect(mockMoviesService.findAll).toHaveBeenCalledWith(1, 10);
    expect(result.data).toHaveLength(1);
  });

  it('findOne should call MoviesService.findOne with id', async () => {
    const result = await controller.findOne('uuid-1');
    expect(mockMoviesService.findOne).toHaveBeenCalledWith('uuid-1');
    expect(result).toEqual(mockMovie);
  });

  it('create should call MoviesService.create with dto', async () => {
    const dto = { title: 'A New Hope' };
    const result = await controller.create(dto);
    expect(mockMoviesService.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockMovie);
  });

  it('update should call MoviesService.update with id and dto', async () => {
    const dto = { director: 'George Lucas' };
    const result = await controller.update('uuid-1', dto);
    expect(mockMoviesService.update).toHaveBeenCalledWith('uuid-1', dto);
    expect(result).toEqual(mockMovie);
  });

  it('remove should call MoviesService.remove with id', async () => {
    await controller.remove('uuid-1');
    expect(mockMoviesService.remove).toHaveBeenCalledWith('uuid-1');
  });

  it('sync should call SwapiService.syncMovies', async () => {
    const result = await controller.sync();
    expect(mockSwapiService.syncMovies).toHaveBeenCalled();
    expect(result.synced).toBe(6);
  });
});
