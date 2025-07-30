import { JwtPayload } from 'jsonwebtoken';
import QueryBuilder from '../../builder/QueryBuilder';
import { User } from '../user/user.model';
import { employerSearchAbleFields } from './employer.constant';
import { IEmployer } from './employer.interface';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { Employer } from './employer.model';

const updateEmployerToDB = async (
  user: JwtPayload,
  payload: Partial<IEmployer>
) => {
  const isExistUser = await User.isExistUserById(user.id);
  if (!isExistUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Employer doesn't exist!");
  }

  console.log(payload);

  const updateEducation = await Employer.findOneAndUpdate(
    { _id: isExistUser.employer },
    payload,
    { new: true }
  );
  return updateEducation;
};

const getAllEmployer = async (query: Record<string, unknown>) => {
  const employerQuery = new QueryBuilder(
    User.find({ role: 'EMPLOYER' }).populate('employer'),
    query
  )
    .search(employerSearchAbleFields)
    .filter()
    .sort()
    .paginate()
    .fields();

  const result = await employerQuery.modelQuery;

  return result;
};

const deleteEmployers = async (id: string) => {
  const result = await User.findOneAndUpdate(
    { _id: id },
    { status: 'delete' },
    { new: true }
  );

  return result;
};

export const EmployerService = {
  getAllEmployer,
  updateEmployerToDB,
  deleteEmployers,
};
