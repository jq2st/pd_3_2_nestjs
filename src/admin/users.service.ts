import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserDto } from './historyDTO/user.dto';
import { User, UserDocument } from './schemas/user.schema';

@Injectable()
export class UsersService {

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async getUsers(): Promise<User[]> {
        return await this.userModel.find().exec()
    }

    async addUser(historyItem: UserDto): Promise<User> {
        const newHistoryItem = new this.userModel(historyItem)
        return newHistoryItem.save()
    }

}
