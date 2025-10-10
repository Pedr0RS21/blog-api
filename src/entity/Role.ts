import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from './User';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string; // 'admin' | 'editor' | 'reader'

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @ManyToMany(() => User, (user) => user.roles)
  users!: User[];

  // Evita default SQL en simple-json; inicializa en código
  @Column({ type: 'simple-json', nullable: false })
  privilegios!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  constructor() {
    // Asegura inicialización para strictPropertyInitialization y valor por defecto
    this.privilegios = [];
    this.active = true;
  }
}
