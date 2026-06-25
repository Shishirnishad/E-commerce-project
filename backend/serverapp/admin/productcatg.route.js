const express = require('express');
const productcatgRoute = express.Router();
var ProductCatg = require('./productcatg.model');
productcatgRoute.route('/addproductcatg/:pcatgid/:pcatgname').post(function (req, res) {
    var productcatg = new ProductCatg({pcatgid:req.params.pcatgid,pcatgname:req.params.pcatgname});
productcatg.save().then(productcatg => {
    res.send('product category added successfully');
    res.end();
}).catch(err => {
    res.send(err);
    res.end();
});
});

productcatgRoute.route('/showproductcatg').get(function (req, res) {
    ProductCatg.find().then(productcatgs => {
       res.send(productcatgs);
       res.end();
    }).catch(err => {
        res.send("data not found");
        res.end();
    });
});
productcatgRoute.route('/updateproductcatg/:id/:pcatgname').put(function (req, res) {
    ProductCatg.updateOne(
        { pcatgid: req.params.id },
        { pcatgname: req.params.pcatgname }
    ).then(() => {
        res.send("product category updated successfully");
    }).catch(err => {
        res.send(err);
    });
});
productcatgRoute.route('/deleteproductcatg/:id').put(function (req, res) {
    ProductCatg.deleteOne({"pcatgid":req.params.id}).then(productcatg => {
        res.send("product category deleted successfully");
        res.end();
    }).catch(err => {
        res.send(err);
        res.end();
    });
});


module.exports = productcatgRoute;
