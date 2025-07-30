import { Types } from 'mongoose';

export type IReport = {
  provider: Types.ObjectId;
  employer: Types.ObjectId;
  details: string;
  type: 'Cancel Booking' | 'Payment Report';
};
