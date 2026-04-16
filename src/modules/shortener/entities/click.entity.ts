import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('clicks')
export class Click {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  shortKey: string;

  @Column({ nullable: true })
  ipHash: string;

  @Column({ nullable: true, length: 2 })
  country: string;

  @Column({ nullable: true })
  deviceType: string;

  @Column({ nullable: true })
  browser: string;

  @Column({ nullable: true })
  referrer: string;

  @CreateDateColumn()
  clickedAt: Date;
}
