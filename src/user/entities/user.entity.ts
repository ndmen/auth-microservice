import { Column, Entity } from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';

@Entity({ name: 'user' })
export class User extends EntityHelper {
  @Column({ nullable: true })
  first_name: string;

  @Column({ nullable: true })
  last_name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ nullable: true })
  password: string;
}
