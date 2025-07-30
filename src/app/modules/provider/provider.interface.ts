import { Model } from 'mongoose';

export type IProvider = {
  
  certification: string;
  degree: string;
  institution: string;
  yearOfCompletion: string;
  specializations: string;
  leftHanded: boolean;
  skills: [];
  
};

export type ProviderModel = {} & Model<IProvider>;
