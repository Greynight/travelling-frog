//TODO create config files
//process.env.VCAP_SERVICES - config var from app-fog

var express = require('express'),
    app = express.createServer(),
    mongoose = require('mongoose'),
    mongoStore = require('connect-mongo')(express),
    models = {},
    classes = {};

var modules = 
{
    'fs':           require('fs'),
    'http':         require('http'),
    'crypto':       require('crypto'),
    'url':          require('url'),
    'nodemailer':   require("nodemailer")
};

app.set('view engine', 'jade');
app.use(express.static(__dirname + '/public'));

mongoose.connect('mongodb://localhost/');

var db = mongoose.connection;

app.use(express.cookieParser("some secret"));
app.use(express.session(
{
    secret: 'some secret',
    store: new mongoStore(
    {
        db: ''
    })
}));

app.use(express.bodyParser());

//include models
modules.fs.readdirSync('./app/models').forEach(function (file)
{
    models[file] = require('./app/models' + '/' + file)(mongoose).model;
})

//include classes
modules.fs.readdirSync('./app/classes').forEach(function (file)
{
    classes[file] = require('./app/classes' + '/' + file)(models, modules);
})

//include routes
modules.fs.readdirSync('./app/routes').forEach(function (file)
{
    require('./app/routes' + '/' + file)(app, models, classes, modules);
})

//get ge.tt accesstoken
classes.photo.auth(classes.photo);

app.listen(process.env.VCAP_APP_PORT || 3000);
