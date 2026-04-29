import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { SwapiService } from '../swapi/swapi.service';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { SearchMoviesDto } from './dto/search-movies.dto';
import { Public } from '../auth/decorators/public.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/entities/role.enum';
import { Cron } from '@nestjs/schedule';

@ApiTags('movies')
@Controller('movies')
export class MoviesController {
  constructor(
    private readonly moviesService: MoviesService,
    private readonly swapiService: SwapiService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all movies (public, paginated)' })
  @ApiResponse({ status: 200, description: 'List of movies' })
  findAll(@Query() query: SearchMoviesDto) {
    return this.moviesService.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get movie by ID (authenticated)' })
  @ApiResponse({ status: 200, description: 'Movie detail' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  findOne(@Param('id') id: string) {
    return this.moviesService.findOne(id);
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a movie (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Movie created' })
  @ApiResponse({ status: 409, description: 'Title already exists' })
  create(@Body() dto: CreateMovieDto) {
    return this.moviesService.create(dto);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a movie (ADMIN only)' })
  @ApiResponse({ status: 200, description: 'Movie updated' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  @ApiResponse({ status: 409, description: 'Title already exists' })
  update(@Param('id') id: string, @Body() dto: UpdateMovieDto) {
    return this.moviesService.update(id, dto);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a movie (ADMIN only)' })
  @ApiResponse({ status: 204, description: 'Movie deleted' })
  @ApiResponse({ status: 404, description: 'Movie not found' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.moviesService.remove(id);
  }

  @Post('sync')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync movies from SWAPI (ADMIN only)' })
  @ApiResponse({ status: 201, description: 'Movies synced' })
  sync() {
    return this.swapiService.syncMovies();
  }

  @Cron('0 1 * * *')
  async handleCronSync() {
    await this.swapiService.syncMovies();
  }
}
