import { Model, Types } from 'mongoose';

export type IServiceList = {
  bookingSystem: 'instant_booking' | 'request_booking';
  provider: Types.ObjectId;
  subCategory: string;
  rate: string;
  rateType: 'Hour' | 'Daily';
  available: boolean;
  category: string;
  status: 'active' | 'delete';
};

export type ServiceListModal = Model<IServiceList>;

