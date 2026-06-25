const mongoose = require("mongoose");

const VendorSchema = new mongoose.Schema(
{
    VUserId:{
        type:String,
        required:true,
        unique:true
    },

    VUserPass:{
        type:String,
        required:true
    },

    VendorName:{
        type:String,
        required:true
    },

    VAddress:{
        type:String
    },

    VContact:{
        type:String
    },

    VEmail:{
        type:String,
        required:true,
        unique:true
    },

    VPicName:{
        type:String,
        default:""
    },

    VId:{
        type:Number,
        unique:true
    },

    Status:{
        type:String,
        default:"Inactive"
    }

},
{
    collection:"Vendor"
});

module.exports = mongoose.model("Vendor",VendorSchema);