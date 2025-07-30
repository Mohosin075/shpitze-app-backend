import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import ApiError from '../../../errors/ApiError';
import { User } from '../user/user.model';
import { IProvider } from './provider.interface';
import { Provider } from './provider.model';
import QueryBuilder from '../../builder/QueryBuilder';
import { providerSearchAbleFields } from './provider.constant';

const updateEducationToDB = async (
  user: JwtPayload,
  payload: Partial<IProvider>
) => {

  const isExistUser = await User.isExistUserById(user.id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Provider doesn't exist!");
  }

  const updateEducation = await Provider.findOneAndUpdate(
    { _id: isExistUser.provider },
    payload,
    { new: true }
  );
  return updateEducation;
};

const getAllProvider = async (query: Record<string, unknown>) => {
  const providerQuery = new QueryBuilder(
    User.find({ role: 'PROVIDER' }).populate('provider'),
    query
  )
    .search(providerSearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await providerQuery.modelQuery;
  return result;
};

const deleteProviderFromDb = async (id: string) => {
  const result = await User.findOneAndUpdate(
    { _id: id },
    {
      status: 'delete',
      new: true,
    }
  );

  return result;
};

export const ProviderService = {
  updateEducationToDB,
  getAllProvider,
  deleteProviderFromDb,
};
