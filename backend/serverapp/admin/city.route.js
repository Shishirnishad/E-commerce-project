const express = require('express');
const cityRoute = express.Router();

var City = require('./city.model');


// save city
cityRoute.route('/save').post((req, res) => {

    var city = new City(req.body);

    city.save().then(city => {
        res.send("City Saved");
        res.end();
    }).catch(err => {
        res.send(err);
        res.end();
    });

});


// search city by id
cityRoute.route('/search/:ctid').get((req, res) => {

    City.findOne({ "ctid": req.params.ctid })
        .then(city => {
            res.send(city);
            res.end();
        }).catch(err => {
            res.send(err);
            res.end();
        });

});


// update city
cityRoute.route('/update').put((req, res) => {

    City.updateOne(
        { "ctid": req.body.ctid },
        {
            "ctname": req.body.ctname,
            "stid": req.body.stid
        }
    ).then(city => {

        res.send("city updated successfully");
        res.end();

    }).catch(err => {

        res.send(err);
        res.end();

    });

});


// delete (disable)
cityRoute.route('/delete/:ctid').delete((req, res) => {

    City.updateOne(
        { "ctid": req.params.ctid },
        { "status": 0 }
    ).then(city => {

        res.send("City disabled successfully");
        res.end();

    }).catch(err => {

        res.send(err);
        res.end();

    });

});


// show enabled cities
cityRoute.route('/show').get((req, res) => {

    City.find({ "status": 1 })
        .then(city => {

            res.send(city);
            res.end();

        }).catch(err => {

            res.send(err);
            res.end();

        });

});


// show all
cityRoute.route('/getall').get(function (req, res) {

    City.find()
        .then(city => {

            res.send(city);
            res.end();

        }).catch(err => {

            res.send(err);
            res.end();

        });

});


// show all cities by state
cityRoute.route('/showbystate/:stid').get((req, res) => {

    City.find({
        "status": 1,
        "stid": req.params.stid
    })
    .then(city => {

        res.send(city);
        res.end();

    }).catch(err => {

        res.send(err);
        res.end();

    });

});


// search city by name
cityRoute.route('/searchbyname/:ctname').get((req, res) => {

    City.findOne({ "ctname": req.params.ctname })
        .then(city => {

            res.send(city);
            res.end();

        }).catch(err => {

            res.send(err);
            res.end();

        });

});

module.exports = cityRoute;