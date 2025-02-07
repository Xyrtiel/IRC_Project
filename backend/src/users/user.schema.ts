import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop({ required: true })
  pseudo: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop()
  socketId?: string;

  @Prop({ type: String, ref: 'Channel' })
  currentChannel?: string;

  @Prop({ default: Date.now })
  lastSeen: Date;

  // Ajout explicite de _id avec le type approprié
  _id: Types.ObjectId;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Pre-save hook pour le hashage du mot de passe
UserSchema.pre<UserDocument>('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
