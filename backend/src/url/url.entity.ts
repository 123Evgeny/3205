import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('urls')
export class Url {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  originalUrl: string;

  @Column({ unique: true })
  @Index()
  shortUrl: string;

  @Column({ nullable: true, unique: true, length: 20 })
  @Index()
  alias?: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  expiresAt?: Date;

  @Column({ default: 0 })
  clickCount: number;
}
