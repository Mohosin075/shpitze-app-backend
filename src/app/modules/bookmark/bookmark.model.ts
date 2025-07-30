import { model, Schema } from "mongoose";
import { IBookmark, BookmarkModel } from "./bookmark.interface"

const bookmarkSchema = new Schema<IBookmark, BookmarkModel>(
    {
        employer: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        service: {
            type: Schema.Types.ObjectId,
            ref: "ServiceList",
            required: true
        }
    }, 
    {
        timestamps: true
    }
);

export const Bookmark = model<IBookmark, BookmarkModel>("Bookmark", bookmarkSchema);