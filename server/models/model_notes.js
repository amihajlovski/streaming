/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
var db_manager = require('./db_manager.js');
var ObjectId = require('mongodb').ObjectID;
exports.newNote = newNote;
exports.deleteNote = deleteNote;
exports.allNotes = allNotes;
exports.getNoteByID = getNoteByID;

function newNote(doc, postback){
    db_manager.db_notes.insert(doc, {w:1}, function(err, result) {
        postback(err, result);
    });
}

function deleteNote(id, postback){
    db_manager.db_notes.remove({_id: new Object(id)}, function(err, result){
        postback(err, result);
    });
}

function getNoteByID(id, postback){
    db_manager.db_notes.findOne({_id : new ObjectId(id)}, function(err, doc){
        postback(err, doc);
    });
}

function allNotes(postback){
    db_manager.db_notes.find().toArray(function(err, items) {
        postback(err, items);
    });
}