import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Link {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    longUrl: String;

    @Column()
    shortUrl: String;

    @Column()
    validUntil: Date;

    @Column({ default: true })
    isActive: Boolean;
}