import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { SearchMoviesDto } from './dto/search-movies.dto';

export interface PaginatedMovies {
  data: Movie[];
  total: number;
  page: number;
  limit: number;
}

@Injectable()
export class MoviesService {
  constructor(
    @InjectRepository(Movie)
    private readonly moviesRepository: Repository<Movie>,
  ) {}

  async findAll(q: SearchMoviesDto): Promise<PaginatedMovies> {
    const sortColumn = `movie.${q.sortBy}`;
    const direction = q.order.toUpperCase() as 'ASC' | 'DESC';

    const qb = this.moviesRepository
      .createQueryBuilder('movie')
      .orderBy(sortColumn, direction)
      .skip((q.page - 1) * q.limit)
      .take(q.limit);

    if (q.search) {
      qb.andWhere('movie.title ILIKE :s', { s: `%${q.search}%` });
    }
    if (q.director) {
      qb.andWhere('movie.director ILIKE :d', { d: `%${q.director}%` });
    }
    if (q.episode !== undefined) {
      qb.andWhere('movie.episodeId = :ep', { ep: q.episode });
    }

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page: q.page, limit: q.limit };
  }

  async findOne(id: string): Promise<Movie> {
    const movie = await this.moviesRepository.findOne({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with id "${id}" not found`);
    }
    return movie;
  }

  async findByExternalId(externalId: string): Promise<Movie | null> {
    return this.moviesRepository.findOne({ where: { externalId } });
  }

  async create(dto: CreateMovieDto): Promise<Movie> {
    const existing = await this.moviesRepository.findOne({
      where: { title: dto.title },
    });
    if (existing) {
      throw new ConflictException(
        `Movie with title "${dto.title}" already exists`,
      );
    }
    const movie = this.moviesRepository.create(dto);
    return this.moviesRepository.save(movie);
  }

  async update(id: string, dto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findOne(id);
    Object.assign(movie, dto);
    try {
      return await this.moviesRepository.save(movie);
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as any).code === '23505'
      ) {
        throw new ConflictException('A movie with that title already exists');
      }
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    const movie = await this.findOne(id);
    await this.moviesRepository.remove(movie);
  }

  async upsertByExternalId(
    externalId: string,
    data: Partial<Movie>,
  ): Promise<Movie> {
    const existing = await this.findByExternalId(externalId);
    if (existing) {
      Object.assign(existing, data);
      return this.moviesRepository.save(existing);
    }
    const movie = this.moviesRepository.create({ ...data, externalId });
    return this.moviesRepository.save(movie);
  }
}
