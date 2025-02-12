import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from './user.schema';

@Schema()
export class Channel extends Document {
  @Prop({ type: String, required: true, unique: true })
  name: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  users: User[];
}

export const ChannelSchema = SchemaFactory.createForClass(Channel);