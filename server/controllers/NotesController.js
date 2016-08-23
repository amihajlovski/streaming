/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var validator = require('validator');
var model_notes = require('../models/model_notes.js');
var utilities_common = require('../utilities/utilities_common.js');
var error_messages = require('../configuration/error_messages.js');

exports.postNote = postNote;
exports.getNotes = getNotes;
exports.deleteNote = deleteNote;
exports.getNote = getNote;

function getNotes(req, res){
    res.json("RESPONSE SENT");

    //model_notes.allNotes(function(err, result){
    //    if(result.length == 0){
    //        res.json(utilities_common.generateInvalidResponse(error_messages.content.RESPONSE_ERROR_NOTES_MISSING));
    //    } else {
    //        res.json(utilities_common.generateValidResponse(result));
    //    }
    //});
}

function postNote(req, res){
    var params = req.body;
    
    if(!validateInput(params))
        res.json(utilities_common.generateInvalidResponse(error_messages.content.RESPONSE_ERROR_WRONG_PARAMETERS));
    else {
        model_notes.newNote(params, function(err, result){
            if(err==null){
                res.json(utilities_common.generateValidResponse({}));
            }
        });
    }  
}

function getNote(req, res){
    var id = req.params.id;
    model_notes.getNoteByID(id, function(err, result){
        console.log(err, result);
    })
}

function deleteNote(req, res){
    var id = req.params.id;
    model_notes.deleteNote(id, function(err, result){
        console.log(err, result.result);
        if(err==null){
            res.json(utilities_common.generateValidResponse());
        } else {
            res.json(utilities_common.generateInvalidResponse(error_messages.content.RESPONSE_ERROR_UNKNOWN));
        }
    });
}

function validateInput(data){
    return !validator.isNull(data.From) && !validator.isNull(data.Note);
}