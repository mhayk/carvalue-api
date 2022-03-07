import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { User } from './user.entity';
import { UsersService } from './users.service';

describe('AuthService', () => {
  let service: AuthService;
  let fakeUsersService: Partial<UsersService>;

  beforeEach(async () => {
    // Create a fake copy of the users service
    fakeUsersService = {
      find: () => Promise.resolve([]),
      create: (email: string, password: string) =>
        Promise.resolve({ id: 1, email, password } as User),
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
    fakeUsersService.find = () =>
      Promise.resolve([
        { id: 1, email: 'test@test.com', password: 'test' },
      ] as User[]);
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
    fakeUsersService.find = () =>
      Promise.resolve([
        { id: 1, email: 'test@test.com', password: 'test' },
      ] as User[]);

    try {
      await service.signin('test@test.com', 'password');
    } catch (err) {
      expect(err.message).toEqual('Invalid password');
    }
  });

  it('returns a user if signin is successful', async () => {
    fakeUsersService.find = () =>
      Promise.resolve([
        {
          id: 1,
          email: 'test@test.com',
          password:
            'bb308779be0604e3.8df99cf071a2cd0131a3f9d7977b4676fda481711eea2ed1ca93a4a830351990',
        },
      ] as User[]);

    const user = await service.signin('test@test.com', 'test');
    expect(user).toBeDefined();
  });
});
