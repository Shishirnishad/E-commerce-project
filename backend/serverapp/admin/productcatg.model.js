var mongoose = require('mongoose');
const schema = mongoose.Schema;
var ProductCatg= new schema({
    pcatgid:{type : Number},
    pcatgname :{type : String}
},
{
    collection : 'productcatg'

}
);
module.exports = mongoose.model('ProductCategory', ProductCatg);