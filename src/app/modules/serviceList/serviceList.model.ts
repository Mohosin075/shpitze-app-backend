import { IServiceList, ServiceListModal } from './serviceList.interface';
import { model, Schema } from 'mongoose';

const serviceListSchema = new Schema<IServiceList, ServiceListModal>(
  {
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    rate: {
      type: String,
      required: true,
    },
    rateType: {
      type: String,
      enum: ["Hour", "Daily"],
      default: "Hour"
    },
    available: {
      type: Boolean,
      default: true
    },
    category: {
      type: String,
    },
    bookingSystem: {
      type: String,
      enum: ['instant_booking', 'request_booking'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
  },
  { timestamps: true }
);

//exist user check
serviceListSchema.statics.isExistPostById = async (id: string) => {
  const isExist = await ServiceList.findById(id);
  return isExist;
};

export const ServiceList = model<IServiceList, ServiceListModal>(
  'ServiceList',
  serviceListSchema
);
