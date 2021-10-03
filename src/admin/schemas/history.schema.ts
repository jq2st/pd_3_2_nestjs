import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type HistoryDocument = History & Document

@Schema()
export class History {
    @Prop()
    date: Date
    
    @Prop()
    linkImgBefore: string

    @Prop()
    linkImgAfter: string

    @Prop()
    type: string

    @Prop()
    info: string

    @Prop()
    user: string
}

export const HistorySchema = SchemaFactory.createForClass(History)