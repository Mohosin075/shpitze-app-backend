import mongoose from 'mongoose';
import { sendNotifications } from '../../../helpers/notificationsHelper';
import { IMessage } from './message.interface';
import { Message } from './message.model';
import ApiError from '../../../errors/ApiError';
import { StatusCodes } from 'http-status-codes';
import { User } from '../user/user.model';

const sendMessageToDB = async (payload: any): Promise<IMessage> => {

  if (!mongoose.Types.ObjectId.isValid(payload.receiver)) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid Receiver ID");
  }

  const sender = await User.findById(payload.sender).select("firstName")

  // save to DB
  const response = await Message.create(payload);

  //@ts-ignore
  const io = global.io;
  if (io) {
    io.emit(`getMessage::${payload?.chatId}`, response);
    const data = {
      text: `${sender?.firstName} send you message.`,
      title: "Received Message",
      link: payload?.chatId,
      direction: "message",
      receiver: payload.receiver
    }
    await sendNotifications(data);

  }

  return response;
};

const getMessageFromDB = async (id: any): Promise<IMessage[]> => {
  const messages = await Message.find({ chatId: id })
    .sort({ createdAt: -1 })
  return messages;
};

export const MessageService = { sendMessageToDB, getMessageFromDB };
