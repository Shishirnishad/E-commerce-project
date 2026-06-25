const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema(
{
    CUserId:{
        type:String,
        required:true,
        unique:true
    },

    CUserPass:{
        type:String,
        required:true
    },

    CustomerName:{
        type:String,
        required:true
    },

    CAddress:{
        type:String
    },
    CStid :{
        type: Number
    },
    CCtid :{
        type:Number
    },

    CContact:{
        type:String
    },

    CEmail:{
        type:String,
        required:true,
        unique:true
    },

    CPicName:{
        type:String,
        default:""
    },

    CId:{
        type:Number,
        unique:true
    },

    Status:{
        type:String,
        default:"Inactive"
    }

},
{
    collection:"Customer"
});

module.exports = mongoose.model("Customer",CustomerSchema);