import { Body, Controller, Get, HttpCode, HttpException, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {

    constructor(private auth: AuthService) {}

    @Post('login')
    async login(@Body() user) {

        const result = await this.auth.login(user)
        if (!result) throw new HttpException({
            status: HttpStatus.NOT_FOUND,
            error: 'Bad login',
          }, HttpStatus.NOT_FOUND)
        return this.auth.login(user)
         
    }

    @Post('sign_up')
    @HttpCode(201)
    signUp(@Body() user) {
        return this.auth.signUp(user)
    }
}
