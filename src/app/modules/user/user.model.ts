import bcrypt from 'bcrypt';
import { StatusCodes } from 'http-status-codes';
import { model, Schema } from 'mongoose';
import config from '../../../config';
import { USER_ROLES } from '../../../enums/user';
import ApiError from '../../../errors/ApiError';
import { IUser, UserModal } from './user.interface';

const userSchema = new Schema<IUser, UserModal>(
  {
    firstName: {
      type: String,
    },
    lastName: {
      type: String,
    },
    appId: {
      type: String,
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      required: true,
    },
    email: {
      type: String
    },
    password: {
      type: String,
      select: 0
    },
    contact: {
      type: String,
      default: ""
    },
    address: {
      type: String,
      default: ""
    },
    address1: {
      type: String,
      default: ""
    },
    address2: {
      type: String,
      default: ""
    },
    province: {
      type: String,
      default: ""
    },
    city: {
      type: String,
      default: ""
    },
    zipCode: {
      type: String,
      default: ""
    },
    rating: {
      type: Number,
      default: 0,
    },
    ratingCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'delete'],
      default: 'active',
    },
    verified: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: 'https://res.cloudinary.com/dzo4husae/image/upload/v1733459922/zfyfbvwgfgshmahyvfyk.png',
    },
    provider: {
      type: Schema.Types.ObjectId,
      ref: 'Provider',
    },
    profession: {
      type: String,
      default: ""
    },
    employer: {
      type: Schema.Types.ObjectId,
      ref: 'Employer',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: false
      },
      coordinates: {
        type: [Number],
        required: false
      }
    },
    accountInformation: {
      status: {
        type: Boolean,
        default: false,
      },
      stripeAccountId: {type: String },
      externalAccountId: { type: String },
      currency: { type: String },
      accountUrl: { type: String }
    },
    authentication: {
      type: {
        isResetPassword: {
          type: Boolean,
          default: false,
        },
        oneTimeCode: {
          type: Number,
          default: null,
        },
        expireAt: {
          type: Date,
          default: null,
        },
      },
      select: 0,
    },
  },
  { timestamps: true }
);

userSchema.index({ location: '2dsphere' });

//exist user check
userSchema.statics.isExistUserById = async (id: string) => {
  const isExist = await User.findById(id);
  return isExist;
};

userSchema.statics.isExistUserByEmail = async (email: string) => {
  const isExist = await User.findOne({ email });
  return isExist;
};

//account check
userSchema.statics.isAccountCreated = async (id: string) => {
  const isUserExist: any = await User.findById(id);
  return isUserExist.accountInformation.status;
};

//is match password
userSchema.statics.isMatchPassword = async (
  password: string,
  hashPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashPassword);
};

//check user
userSchema.pre('save', async function (next) {
  //check user

  if (this?.email) {
    const isExist = await User.findOne({ email: this.email });
    if (isExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Email already exists');
    }
  }

  if (this?.password) {
    //password hash
    this.password = await bcrypt.hash(
      this.password,
      Number(config.bcrypt_salt_rounds)
    );
  }
  next();
});

export const User = model<IUser, UserModal>('User', userSchema);
