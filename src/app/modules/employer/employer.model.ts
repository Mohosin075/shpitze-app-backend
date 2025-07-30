import { model, Schema } from 'mongoose';
import { EmployerModel, IEmployer } from './employer.interface';

const employerSchema = new Schema<IEmployer, EmployerModel>(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    contact: {
      type: String,
    },
    address: {
      type: String,
    },
    certification: {
      type: String,
    },
    degree: {
      type: String,
    },
    institution: {
      type: String,
    },
    yearOfCompletion: {
      type: String,
    },
    specializations: {
      type: String,
    },
    skills: [],
    rating: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export const Employer = model<IEmployer, EmployerModel>(
  'Employer',
  employerSchema
);
