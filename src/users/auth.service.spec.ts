import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    const users: User[] = [];
    fakeUsersService = {
      find: (email: string) => {
        const filteredUsers = users.filter((user) => user.email === email);
        return Promise.resolve(filteredUsers);
      },
      create: (email: string, password: string) => {
        const user = {
          id: Math.floor(Math.random() * 9999),
          email,
          password,
        } as User;
        users.push(user);
        return Promise.resolve(user);
      },
    };

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: fakeUsersService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('can create an instance of auth service', async () => {
    expect(service).toBeDefined();
  });

  it('creates a new user with a salted and hashed password', async () => {
    const user = await service.signup('test@test.com', 'test');
    expect(user.password).not.toEqual('test');
    const [salt, hash] = user.password.split('.');
    // console.log(salt, hash);
    expect(salt).toBeDefined();
    expect(hash).toBeDefined();
  });

  it('throws an error if user signs up with email that is in use', async () => {
    expect.assertions(1);
    await service.signup('test@test.com', 'test');
    try {
      await service.signup('test@test.com', 'test');
    } catch (err) {
      expect(err.message).toEqual('Email in use');
    }
  });

  it('throws if signin is called with an unused email', async () => {
    try {
      await service.signin('test@test.com', 'test');
    } catch (err) {
      expect(err.message).toEqual('User not found');
    }
  });

  it('throw if an invalid password is provided', async () => {
    expect.assertions(1);
    await service.signup('test@test.com', 'newpassword');

    try {
      await service.signin('test@test.com', 'password');
    } catch (err) {
      expect(err.message).toMatch('Invalid password');
    }
  });

  it('returns a user if signin is successful', async () => {
    await service.signup('test@test.com', 'test');

    const user = await service.signin('test@test.com', 'test');
    expect(user).toBeDefined();
  });
});
