import mongoose from 'mongoose'

const AdSchema = new mongoose.Schema({

    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"users",
    },
    prompt:String,
    refinedPrompt: String,
    imageUrl: String,
    caption: String,
    hashtags: [String],
    brandlogo: String,
    finalImageUrl: String
},{timestamps:true})

const AdModel = mongoose.model("Ads",AdSchema);

export default AdModel;