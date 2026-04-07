import { forwardRef, Module } from '@nestjs/common';
import { SwapiService } from './swapi.service';
import { MoviesModule } from '../movies/movies.module';

@Module({
  imports: [forwardRef(() => MoviesModule)],
  providers: [SwapiService],
  exports: [SwapiService],
})
export class SwapiModule {}
