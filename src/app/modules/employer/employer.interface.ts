import { Model } from 'mongoose';

export type IEmployer = {
  firstName: string;
  lastName: string;
  contact: string;
  address: string;
  rating: number;
  certification: string;
  degree: string;
  institution: string;
  yearOfCompletion: string;
  specializations: string;
  skills: [];
};

export type EmployerModel = {} & Model<IEmployer>;
