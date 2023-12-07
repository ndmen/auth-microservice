import * as request from 'supertest';
import { User } from 'src/user/interfaces/user.interface';
import { HttpStatus } from '@nestjs/common';

const host = 'http://localhost:3000';
const mockUser: User = {
  id: 1,
  first_name: 'Artem',
  last_name: 'Abdullin',
  email: 'artem@gmail.com',
  password: '1111',
};

describe('POST /auth/signup', () => {
  it('should register a user and return the new user object', async () => {
    const response = await request(host)
      .post('/auth/signup')
      .send(mockUser)
      .expect(HttpStatus.CREATED);

    const responseObject = response.body;

    expect(responseObject).toHaveProperty('id');
    expect(responseObject).toHaveProperty('first_name');
    expect(responseObject).toHaveProperty('last_name');
    expect(responseObject).toHaveProperty('email');
  });

  it('should not register a new user if the passed email already exists', async () => {
    await request(host)
      .post('/auth/signup')
      .send(mockUser)
      .expect(HttpStatus.BAD_REQUEST);
  });
});

describe('POST /auth/signin', () => {
  it('should return access token if credentials valid', async () => {
    const response = await request(host)
      .post('/auth/signin')
      .send({ email: mockUser.email, password: mockUser.password })
      .expect(HttpStatus.CREATED);

    const responseObject = response.body;

    expect(responseObject).toHaveProperty('access_token');
  });

  it('should require authorization if password invalid', async () => {
    return request(host)
      .post('/auth/signin')
      .send({ email: mockUser.email, password: 'invalid_password' })
      .expect(HttpStatus.UNAUTHORIZED);
  });
});
