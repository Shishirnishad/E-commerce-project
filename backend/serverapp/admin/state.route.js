const express = require('express');
const stateRoute = express.Router();

var State = require('./state.model');

// save state
stateRoute.route('/save').post((req, res) => {

    var state = new State(req.body);
    console.log (state.stid+ "  " + state.stname+" " + state.status);
    state.save().then(state => {
        res.send('State Saved');
        res.end();
    }).catch(err => {
        res.send(err);
        res.end();
    });

});

// search state
stateRoute.route('/search/:stid').get((req, res) => {

    State.findOne({ "stid": req.params.stid })
        .then(state => {
            res.send(state);
            res.end();
        }).catch(err => {
            res.send(err);
            res.end();
        });

});

// update state
stateRoute.route('/update').put((req, res) => {

    State.updateOne(
        { "stid": req.body.stid },
        {
            "stid": req.body.stid,
            "stname": req.body.stname
        }
    ).then(state => {
        res.send('state updated successfully');
        res.end();
    }).catch(err => {
        res.send(err);
        res.end();
    });

});

// delete enable or disable
stateRoute.route('/delete/:stid').delete((req, res) => {

    State.updateOne(
        { "stid": req.params.stid },
        { "status": 0 }
    ).then(state => {
        res.send('State disabled successfully');
        res.end();
    }).catch(err => {
        res.send(err);
        res.end();
    });

});

// show enabled state
stateRoute.route('/show').get((req, res) => {

    State.find({ "status": 1 })
        .then(state => {
            res.send(state);
            res.end();
        }).catch(err => {
            res.send(err);
            res.end();
        });

});

// get all states
stateRoute.route('/getall').get((req, res) => {

    State.find()
        .then(state => {
            res.send(state);
            res.end();
        }).catch(err => {
            res.send(err);
            res.end();
        });

});

// search state by name
stateRoute.route('/searchbyname/:stname').get((req, res) => {

    State.findOne({ "stname": req.params.stname })
        .then(state => {
            res.send(state);
            res.end();
        }).catch(err => {
            res.send(err);
            res.end();
        });

});

module.exports = stateRoute;