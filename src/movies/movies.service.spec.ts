import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
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

const createMockQueryBuilder = (result: [Movie[], number]) => {
  const qb: any = {
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue(result),
  };
  return qb;
};

const createMockRepository = <T>(): MockRepository<T> => ({
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  createQueryBuilder: jest.fn(),
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
    it('should return a paginated list of movies without filters', async () => {
      const qb = createMockQueryBuilder([[mockMovie], 1]);
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      const result = await service.findAll(1, 10);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(qb.andWhere).not.toHaveBeenCalled();
    });

    it('should filter by title using ILIKE', async () => {
      const qb = createMockQueryBuilder([[mockMovie], 1]);
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service.findAll(1, 10, { title: 'hope' });

      expect(qb.andWhere).toHaveBeenCalledWith('movie.title ILIKE :title', { title: '%hope%' });
    });

    it('should filter by director using ILIKE', async () => {
      const qb = createMockQueryBuilder([[mockMovie], 1]);
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service.findAll(1, 10, { director: 'lucas' });

      expect(qb.andWhere).toHaveBeenCalledWith('movie.director ILIKE :director', { director: '%lucas%' });
    });

    it('should filter by episodeId exactly', async () => {
      const qb = createMockQueryBuilder([[mockMovie], 1]);
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service.findAll(1, 10, { episode: '4' });

      expect(qb.andWhere).toHaveBeenCalledWith('movie.episodeId = :episodeId', { episodeId: 4 });
    });

    it('should apply multiple filters together', async () => {
      const qb = createMockQueryBuilder([[mockMovie], 1]);
      (repo.createQueryBuilder as jest.Mock).mockReturnValue(qb);

      await service.findAll(1, 10, { title: 'hope', director: 'lucas', episode: '4' });

      expect(qb.andWhere).toHaveBeenCalledTimes(3);
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

    it('should throw ConflictException on duplicate title (PostgreSQL error 23505)', async () => {
      repo.findOne!.mockResolvedValue(mockMovie);
      const dbError = Object.assign(
        new QueryFailedError('UPDATE', [], new Error()),
        { code: '23505' },
      );
      repo.save!.mockRejectedValue(dbError);

      await expect(service.update('uuid-1', { title: 'A New Hope' })).rejects.toThrow(
        ConflictException,
      );
    });

    it('should rethrow unknown errors from save', async () => {
      repo.findOne!.mockResolvedValue(mockMovie);
      repo.save!.mockRejectedValue(new Error('unexpected db error'));

      await expect(service.update('uuid-1', { director: 'X' })).rejects.toThrow(
        'unexpected db error',
      );
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
