import { model, Schema } from 'mongoose';
import { IProvider, ProviderModel } from './provider.interface';

const providerSchema = new Schema<IProvider, ProviderModel>(
  {
    certification: {
      type: String,
      default: ""
    },
    degree: {
      type: String,
      default: ""
    },
    institution: {
      type: String,
      default: ""
    },
    yearOfCompletion: {
      type: String,
      default: ""
    },
    specializations: {
      type: String,
      default: ""
    },
    skills: [],
    leftHanded: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

export const Provider = model<IProvider, ProviderModel>(
  'Provider',
  providerSchema
);
