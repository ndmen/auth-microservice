import { Column, Entity } from 'typeorm';
import { EntityHelper } from '../../utils/entity-helper';

@Entity({ name: 'user_session' })
export class UserSession extends EntityHelper {
  @Column({ nullable: true })
  access_token: string;

  @Column({ nullable: true })
  user_id: string;

  @Column({ nullable: true })
  user_ip: string;
}
