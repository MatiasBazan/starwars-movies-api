import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('movies')
export class Movie {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', unique: true, nullable: false })
  title: string;

  @Column({ nullable: true, type: 'int' })
  episodeId: number | null;

  @Column({ nullable: true, type: 'text' })
  openingCrawl: string | null;

  @Column({ type: 'varchar', nullable: true })
  director: string | null;

  @Column({ type: 'varchar', nullable: true })
  producer: string | null;

  @Column({ type: 'varchar', nullable: true })
  releaseDate: string | null;

  @Column({ type: 'simple-array', nullable: true })
  characters: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  planets: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  starships: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  vehicles: string[] | null;

  @Column({ type: 'simple-array', nullable: true })
  species: string[] | null;

  @Column({ type: 'varchar', nullable: true })
  externalId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}