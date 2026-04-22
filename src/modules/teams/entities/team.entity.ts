import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, ManyToMany } from 'typeorm';
import { User } from '@modules/users/entities';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => User, (user) => user.ownedTeams)
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @ManyToMany(() => User, (user) => user.teams)
  members: User[];

  @Column()
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;
}