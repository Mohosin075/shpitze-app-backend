import mongoose from "mongoose";
import { IReview } from "./review.interface";
import { Review } from "./review.model";
import ApiError from "../../../errors/ApiError";
import { StatusCodes } from "http-status-codes";
import { User } from "../user/user.model";


const createReviewToDB = async(payload:IReview): Promise<IReview>=>{

    // Validate ID before making a database call
    if (!mongoose.Types.ObjectId.isValid(payload.provider)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Offer ID');
    }

    // Fetch service and check if it exists in one query
    const user:any = await User.findById(payload.provider);
    if (!user) {
        throw new ApiError(StatusCodes.NOT_FOUND, "No User Found");
    }

    if (payload.rating) {

        // checking the rating is valid or not;
        const rating = Number(payload.rating);
        if (rating < 1 || rating > 5) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid rating value");
        }

        // Update service's rating and total ratings count
        const ratingCount = user.ratingCount + 1;

        let newRating;
        if (user.rating === null || user.rating === 0) {
            // If no previous ratings, the new rating is the first one
            newRating = rating;
        } else {
            // Calculate the new rating based on previous ratings
            newRating = ((user.rating * user.ratingCount) + rating) / ratingCount;
        }

        await User.findByIdAndUpdate({_id: payload.provider}, {rating: parseFloat(newRating.toFixed(2)) , ratingCount: ratingCount  }, {new: true})
    }

    const result = await Review.create(payload);
    if(!result){
        throw new ApiError(StatusCodes.BAD_REQUEST, "Failed To create Review")
    }
    return payload;
};

const getReviewFromDB = async(id:any): Promise<IReview[]>=>{

    // Validate ID before making a database call
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid Offer ID');
    }
    
    const reviews = await Review.find({service: id});
    return reviews;
};

export const ReviewService ={ createReviewToDB, getReviewFromDB}