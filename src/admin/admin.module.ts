import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AdminController } from './admin.controller';
import { HistoryService } from './history.service';
import { History, HistorySchema } from './schemas/history.schema';
import { User, UserSchema } from './schemas/user.schema';
import { UsersService } from './users.service';

@Module({
  controllers: [AdminController],
  providers: [
    HistoryService,
    UsersService
  ],
  imports: [
    MongooseModule.forFeature([
      {name: History.name, schema: HistorySchema},
      {name: User.name, schema: UserSchema}
    ])
  ],
  exports: [
    HistoryService,
    UsersService
  ]
})
export class AdminModule {}
