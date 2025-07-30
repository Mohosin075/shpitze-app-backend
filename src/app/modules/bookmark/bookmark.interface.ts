import { Model, Types } from "mongoose";

export type IBookmark= {
    employer: Types.ObjectId,
    service: Types.ObjectId
}

export type BookmarkModel = Model<IBookmark>;