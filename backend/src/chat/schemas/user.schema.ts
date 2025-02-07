import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ required: true })
  socketId: string;

  @Prop({ required: true })
  nickname: string;

  @Prop()
  currentChannel?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);