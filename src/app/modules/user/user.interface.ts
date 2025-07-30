import { Model, Types } from 'mongoose';
import { USER_ROLES } from '../../../enums/user';

export type IUser = {
  role: USER_ROLES;
  firstName?: string;
  appId?: string;
  lastName?: string;
  email?: string;
  password?: string;
  contact?: string;
  address?: string;
  address1?: string;
  address2?: string;
  province?: string;
  city?: string;
  zipCode?: string;
  location?: {
    longitude: string
    latitude: string
  };
  status: 'active' | 'delete';
  verified: boolean;
  image: string;
  rating: number;
  ratingCount: number;
  provider?: Types.ObjectId;
  employer?: Types.ObjectId;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  accountInformation?: {
    status: boolean;
    stripeAccountId: string;
    externalAccountId: string;
    currency: string;
    accountUrl: string;
  };
  profession: string;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;
