import { IChat } from "../app/modules/chat/chat.interface";
import { Chat } from "../app/modules/chat/chat.model";

const createChat = async (payload: any) => {
    const isExistChat: IChat | null = await Chat.findOne({
        participants: { $all: payload },
    });
    
    if (isExistChat) {
        return isExistChat;
    }

    const chat: IChat = await Chat.create({ participants: payload });
    return chat;
};

export default createChat;