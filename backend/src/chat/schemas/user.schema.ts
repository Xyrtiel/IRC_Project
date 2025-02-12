import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class User extends Document {
  @Prop({ type: String, required: true })
  socketId: string;

  @Prop({ type: String, required: true })
  nickname: string;

  @Prop({ type: String })
  currentChannel?: string;
}

export const UserSchema = SchemaFactory.createForClass(User); 
