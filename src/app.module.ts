import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MoviesModule } from './movies/movies.module';
import { SwapiModule } from './swapi/swapi.module';
import { User } from './users/entities/user.entity';
import { Movie } from './movies/entities/movie.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const isProduction = process.env.NODE_ENV === 'production';
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        return {
          type: 'postgres',
          ...(databaseUrl 
            ? { 
                url: databaseUrl, 
                ssl: isProduction ? { rejectUnauthorized: false } : false 
              }
            : {
                host: configService.get<string>('DB_HOST', 'localhost'),
                port: configService.get<number>('DB_PORT', 5432),
                username: configService.get<string>('DB_USERNAME', 'postgres'),
                password: configService.get<string>('DB_PASSWORD', 'postgres'),
                database: configService.get<string>('DB_NAME', 'starwars_movies'),
              }
          ),
          entities: [User, Movie],
          synchronize: !isProduction, // Only true in development
        };
      },
    }),
    ScheduleModule.forRoot(),
    AuthModule,
    UsersModule,
    MoviesModule,
    SwapiModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
