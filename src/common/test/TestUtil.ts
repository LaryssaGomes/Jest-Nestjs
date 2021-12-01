import { User } from './../../user/user.entity';

export default class TestUtil {
  static giveAMeAValidUser(): User {
    const user = new User();
    (user.email = 'valid@email.com'), (user.name = 'Laryssa'), (user.id = '1');
    return user;
  }
}
