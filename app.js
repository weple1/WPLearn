var path = require('path'),
    express = require('express'),
    nunjucks = require('nunjucks'),
    favicon = require('serve-favicon'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    bodyParser = require('body-parser'),
    session = require('express-session'),

    routes = require('./routes/index.js'),
    settings = require('./settings'),

    fs = require('fs'),
    accessLog = fs.createWriteStream('access.log', {
        flags: 'a'
    }),
    errorLog = fs.createWriteStream('error.log', {
        flags: 'a'
    }),

    app = express();

app.set('port', process.env.PORT || 2369);
nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.use(favicon(path.join(__dirname, 'public', '/default/assets/images/favicon.ico')));
app.use(logger('dev'));
app.use(logger('combined', {
    stream: accessLog
}));
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(cookieParser());
//session could save in mongo store, but sometimes it doesn't work
app.use(session({
    secret: settings.cookieSecret,
    key: settings.db, //cookie name
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 1
    }, //1 days
    resave: false,
    saveUninitialized: true
}));
//app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

routes(app);

//error log in the file
app.use(function (err, req, res, next) {
    console.log(err);
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
});

app.listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});

process.on('uncaughtException', function (err) {
    //打印出错误
    console.log(err);
    //打印出错误的调用栈方便调试
    console.log(err.stack);

    var meta = '[' + new Date() + '] ' + err.message + '\n';
    errorLog.write(meta + err.stack + '\n');
});