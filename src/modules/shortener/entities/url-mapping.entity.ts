import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '@modules/users/entities';
import { Team } from '@modules/teams/entities';

@Entity('url_mappings')
export class UrlMapping {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ unique: true, length: 20 })
  shortKey: string;

  @Column({ type: 'text' })
  longUrl: string;

  @Column({ nullable: true, length: 500 })
  title: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ nullable: true })
  expiresAt: Date;

  @Column({ nullable: true })
  passwordHash: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  clickCount: number;

  @Column({ nullable: true, type: 'jsonb' })
  metadata: Record<string, any>;

  @ManyToOne(() => User, (user) => user.urls, { nullable: true })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  userId: string;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @Column({ nullable: true })
  teamId: string;

  @Column({ nullable: true })
  customDomainId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}