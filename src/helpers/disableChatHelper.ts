import { IChat } from "../app/modules/chat/chat.interface";
import { Chat } from "../app/modules/chat/chat.model";

const disableChat = async (payload: any) => {
    const isExistChat: IChat | null = await Chat.findOneAndUpdate(
        { participants: { $all: payload } },
        { status: false },
        { new: true }
    );
    return isExistChat;
};

export default disableChat;