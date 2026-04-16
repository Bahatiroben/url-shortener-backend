import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity({
    name: 'users'
})
export class UserEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({unique: true})
    username: string;

    @Column({ unique: true})
    email: string;

    @Column()
    password: string;
}