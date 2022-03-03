import { Body, Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { SerializeInterceptor } from '../interceptors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';

@Controller('auth')
export class UsersController {
    constructor(private usersService: UsersService) { }

    @Post('/signup')
    createUser(@Body() body: CreateUserDto) {
        return this.usersService.create(body.email, body.password);
    }

    @UseInterceptors(new SerializeInterceptor(UserDto))
    @Get('/:id')
    findUser(@Param('id') id: string) {
        return this.usersService.findOne(parseInt(id));
    }
}
