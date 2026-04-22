import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToMany } from 'typeorm';
import { UrlMapping } from '@modules/shortener/entities/url-mapping.entity';
import { Team } from '@modules/teams/entities';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: 'user' })
  role: string;

  @OneToMany(() => UrlMapping, (url) => url.user)
  urls: UrlMapping[];

  @OneToMany(() => Team, (team) => team.owner)
  ownedTeams: Team[];

  @ManyToMany(() => Team, (team) => team.members)
  teams: Team[]; 


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}