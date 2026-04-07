import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Movie } from './entities/movie.entity';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';

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

  async findAll(page = 1, limit = 10): Promise<PaginatedMovies> {
    const [data, total] = await this.moviesRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
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
      throw new ConflictException(`Movie with title "${dto.title}" already exists`);
    }
    const movie = this.moviesRepository.create(dto);
    return this.moviesRepository.save(movie);
  }

  async update(id: string, dto: UpdateMovieDto): Promise<Movie> {
    const movie = await this.findOne(id);
    Object.assign(movie, dto);
    return this.moviesRepository.save(movie);
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
