import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';

const mockMovie: Movie = {
  id: 'uuid-1',
  title: 'A New Hope',
  episodeId: 4,
  openingCrawl: 'It is a period of civil war...',
  director: 'George Lucas',
  producer: 'Gary Kurtz',
  releaseDate: '1977-05-25',
  characters: [],
  planets: [],
  starships: [],
  vehicles: [],
  species: [],
  externalId: '1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

type MockRepository<T> = Partial<Record<keyof Repository<T>, jest.Mock>>;

const createMockRepository = <T>(): MockRepository<T> => ({
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
});

describe('MoviesService', () => {
  let service: MoviesService;
  let repo: MockRepository<Movie>;

  beforeEach(async () => {
    repo = createMockRepository<Movie>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: getRepositoryToken(Movie), useValue: repo },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  describe('findAll', () => {
    it('should return a paginated list of movies', async () => {
      repo.findAndCount!.mockResolvedValue([[mockMovie], 1]);

      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return a movie by ID', async () => {
      repo.findOne!.mockResolvedValue(mockMovie);

      const result = await service.findOne('uuid-1');

      expect(result).toEqual(mockMovie);
    });

    it('should throw NotFoundException if movie does not exist', async () => {
      repo.findOne!.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a movie successfully', async () => {
      repo.findOne!.mockResolvedValue(null);
      repo.create!.mockReturnValue(mockMovie);
      repo.save!.mockResolvedValue(mockMovie);

      const result = await service.create({ title: 'A New Hope' });

      expect(result).toEqual(mockMovie);
      expect(repo.save).toHaveBeenCalledWith(mockMovie);
    });

    it('should throw ConflictException if title already exists', async () => {
      repo.findOne!.mockResolvedValue(mockMovie);

      await expect(service.create({ title: 'A New Hope' })).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('update', () => {
    it('should update an existing movie', async () => {
      const updated = { ...mockMovie, director: 'Someone Else' };
      repo.findOne!.mockResolvedValue(mockMovie);
      repo.save!.mockResolvedValue(updated);

      const result = await service.update('uuid-1', { director: 'Someone Else' });

      expect(result.director).toBe('Someone Else');
    });
  });

  describe('remove', () => {
    it('should remove an existing movie', async () => {
      repo.findOne!.mockResolvedValue(mockMovie);
      repo.remove!.mockResolvedValue(mockMovie);

      await expect(service.remove('uuid-1')).resolves.toBeUndefined();
    });
  });
});
