'use strict';

const MySQL = require('mysql');
let db;
const Usuarios = function() {};

Usuarios.prototype.connectDb = function(callback) {
    db = MySQL.createConnection({ host: "localhost", user: "root", password: "", database: "ludoteca" });

    db.connect(function(err) {
        callback(err);
    });
};

Usuarios.prototype.getAll = function(callback) {
    db.query("SELECT * FROM usuarios", function(err, result, fields) {
        if (err)
            callback(err, null);
        else
            callback(false, result);
    });
};

Usuarios.prototype.get = function(id, callback) {
    db.query("SELECT * FROM usuarios WHERE id = " + MySQL.escape(id), function(err, result, fields) {
        if (err)
            callback(err, null);
        else
            callback(false, result);
    });
};

Usuarios.prototype.findByUsername = function(username, callback) {
	
    db.query("SELECT * FROM usuarios WHERE usuario LIKE " + MySQL.escape(username) + "", function(err, result, fields) {
        if (err)
            callback(err, null);
        else
            callback(false, JSON.parse(JSON.stringify(result)));
    });
};

module.exports = new Usuarios();