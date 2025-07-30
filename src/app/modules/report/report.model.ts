import { model, Schema } from 'mongoose';
import { IReport } from './report.interface';

const reportSchema = new Schema<IReport>(
  {
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    employer: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    details: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Payment Report', 'Cancel Booking'],
      required: true
    }
  },
  { timestamps: true }
);

export const Report = model<IReport>('Report', reportSchema);
