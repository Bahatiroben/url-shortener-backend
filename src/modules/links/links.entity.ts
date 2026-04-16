import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { UserEntity } from '../users/user.entity';

@Entity({
    name: 'links'
})
export class Link {
    @PrimaryGeneratedColumn()
    id: string;

    @Column({ nullable: false })
    originalUrl: String;

    @Column({unique: true, nullable: false})
    shortCode: String;

    
    @ManyToOne(() => UserEntity, user => user.id, { onDelete: 'SET NULL' })
    @Column()
    userId: String;

    @Column({ default: true })
    isActive: Boolean;

    @Column({nullable: false})
    validUntil: Date;

    @Column({nullable: false})
    title: String;

    @Column()
    description: String;
}