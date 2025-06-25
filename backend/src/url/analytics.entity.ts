import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Url } from './url.entity';

@Entity('analytics')
export class Analytics {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn()
  visitDate: Date;

  @Column()
  ipAddress: string;

  @ManyToOne(() => Url, (url) => url.id, { onDelete: 'CASCADE' })
  url: Url;
}
