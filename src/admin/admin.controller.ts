import { Controller, Get, HttpCode } from '@nestjs/common';
import { HistoryService } from './history.service';
import { History } from './schemas/history.schema';
import { User } from './schemas/user.schema';
import { UsersService } from './users.service';

@Controller('admin')
export class AdminController {

    constructor(
        private usersService: UsersService,
        private historyService: HistoryService
    ) {}

    @Get('users')
    @HttpCode(200)
    users(): Promise<User[]> {
        return this.usersService.getUsers()
    }

    @Get('history')
    @HttpCode(200)
    history(): Promise<History[]> {
        return this.historyService.getHistory()
    }
}
