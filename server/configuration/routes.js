/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var bodyParser = require('body-parser');
var express = require('express');
var router = express.Router();
var notes = require('../controllers/NotesController.js');

module.exports = function(app) {
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json({limit: '50mb'}));
    app.use('/public', express.static(__dirname + '/../public'));
    app.use('/api', router);
    
    router.use(function(req, res, next) {
        console.log("Input: " + req.body);
        next(); 
    });
    setUpRoutes(router);
};

function setUpRoutes(router){
    
    router.route('/notes').get(notes.getNotes);
    router.route('/note/:id').get(notes.getNote);
    router.route('/notes/new').post(notes.postNote);
    router.route('/notes/delete/:id').get(notes.deleteNote);
    
}