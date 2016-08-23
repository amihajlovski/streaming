/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

// Retrieve
var MongoClient = require('mongodb').MongoClient;

// Connect to the db
MongoClient.connect("mongodb://localhost:27017/notesdb", function(err, db) {
    if (!err) {
        console.log("Connected to " + db.databaseName);
        db.createCollection('notes', function(err, collection) {
        });
        exports.db_notes = db.collection('notes');
    }
});

