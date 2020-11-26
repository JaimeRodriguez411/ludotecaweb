const express = require('express');
const app = express();
const logger = require('morgan');
const http = require('http');
const path = require('path');
const PORT = process.env.PORT || 8080;
const bodyParser = require('body-parser');
const baseAPI = '/api/v1';

/** SECURITY **/

const flash = require('connect-flash');
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const middleware = require('connect-ensure-login').ensureLoggedIn();
const usuariosService = require('./routes/usuarios-service');

/* Comprueba que el usuario existe en la base de datos */
passport.use(new Strategy({
    passReqToCallback: true
}, function(req, username, password, cb) {
    usuariosService.findByUsername(username, function(err, user) {
        if (err) {
            return cb(err);
        }
        if (user.length === 0) {
            return cb(null, false, req.flash('loginMessage', 'Usuario no encontrado.'));
        }
        if (password === user[0].contrasenia) {
            return cb(null, user);
        } else {
            return cb(null, false, req.flash('loginMessage', 'Usuario o contraseña incorrectos.'));
        }
    });
}));

passport.serializeUser(function(user, cb) {
    cb(null, user[0].usuario);
});

passport.deserializeUser(function(id, cb) {
    usuariosService.findByUsername(id, function(err, user) {
        if (err) {
            return cb(err);
        }
        cb(null, user);
    });
});

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(require('express-session')({ secret: "clave secreta", resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


app.use(bodyParser.json({ limit: "200mb" }));
app.use(bodyParser.urlencoded({ limit: "200mb", extended: true, parameterLimit: 1000000 }));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.get('/login', function(req, res) {
    res.render('login.ejs', { message: req.flash('loginMessage') });
});

app.post('/login',
    passport.authenticate('local', { failureRedirect: '/login', failureFlash: true }),
    function(req, res) {
        res.redirect('/');
    });

app.get('/logout', function(req, res) {
    req.session.destroy();
    res.redirect('/');
});

app.get('/session', function(req, res) {
    res.send({ user: req.user[0].name });
});

/* estar logeado para utilizar cualquier funcion de la app */
app.use('/', middleware); //Comment this line to disable login & security

app.use('/', express.static(path.join(__dirname + '/public')));

/** ROUTERS **/

const usuarios = require('./routes/usuarios');


/*************/
/* conecta con la base de datos */
const server = http.createServer(app);


usuariosService.connectDb(function(err) {
    if (err) {
        console.log("Could not connect with Mysql - usuariossService");
        process.exit(1);
    }


    server.listen(PORT, function() {
        console.log('Server with GUI up and running on localhost:' + PORT);
    });
});