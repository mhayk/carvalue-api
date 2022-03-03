import { BadRequestException, Injectable } from '@nestjs/common';
import { randomBytes, scrypt as _scrypt } from 'crypto';
import { UsersService } from './users.service';
import { promisify } from 'util';

const scrypt = promisify(_scrypt);

@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) { }

    async validateUser(email: string, password: string): Promise<any> {
        // const user = await this.usersService.findOne(email);
        // if (user && user.password === password) {
        //     const { password, ...result } = user;
        //     return result;
        // }
        // return null;
    }

    async signup(email: string, password: string) {
        // See if email is in use
        const users = await this.usersService.find(email);
        if (users.length) {
            throw new BadRequestException('Email in use');
        }

        // Hash the users password
        // Generate a salt
        const salt = randomBytes(8).toString('hex');

        // Hash the salt and password together
        const hash = (await scrypt(password, salt, 32)) as Buffer;

        // join the hashed result and the salt together
        const result = salt + '.' + hash.toString('hex');

        // Create a new user and save it
        const user = await this.usersService.create(email, result);

        // return the user
        return user;
    }

    signin() { }
}
