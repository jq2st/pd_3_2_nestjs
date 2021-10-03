import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from 'src/admin/schemas/user.schema';

@Injectable()
export class AuthService {

    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async login(user: {login: string, password: string}) {
        return await this.userModel.findOne({login: user.login, password: user.password}).exec()
    }

    async signUp(user: {login: string, password: string}) {
        const newUser = new this.userModel({
            ...user,
            role: 'USER'
        })
        return await newUser.save()
    }
}
