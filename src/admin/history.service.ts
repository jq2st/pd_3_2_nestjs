import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HistoryItemDto } from './historyDTO/history.dto';
import { History, HistoryDocument } from './schemas/history.schema';

@Injectable()
export class HistoryService {

    constructor(@InjectModel(History.name) private historyModel: Model<HistoryDocument>) {}

    async getHistory(): Promise<History[]> {
        return await this.historyModel.find().exec()
    }

    async addToHistory(historyItem: HistoryItemDto): Promise<History> {
        const newHistoryItem = new this.historyModel(historyItem)
        return newHistoryItem.save()
    }

}
