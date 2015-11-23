var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
//var session = require('express-session');
// var mongo = require('mongodb');
// var mongoose = require('mongoose');
// var connection_string = 'mongodb://localhost/interviews';

var Server = function() {
    var self = this;

    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
    */
    self.setupVariables = function(port, ip) {
        //  Set the environment variables we need.
        self.ipaddress = ip;
        self.port      = port;

        console.log("IP address: ",self.ipaddress,":",self.port);
    };

    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating server ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.app.use(bodyParser.json());
        self.app.use(bodyParser.urlencoded({extended: true}));
        self.app.use(cookieParser());
        //self.app.use(session({ 
        //    secret: 'secret' 
        //}));
        var routes = require('./routes/index');
        self.app.use('/', routes);
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.server = http.createServer(self.app);
    };

    self.setupDB = function(){
        mongoose.connect(connection_string);
        var db = mongoose.connection;
        db.on('error', console.error.bind(console, 'Mongoose connection error:'));
    };  

    /**
     *  Initializes the sample application.
     */
    self.initialize = function(port, ip) {
    	self.app = express();
        self.setupVariables(port, ip);
        self.setupTerminationHandlers();
        self.initializeServer();
        // self.setupDB();

        self.app.set('views', path.join(__dirname, 'views'));
		self.app.set('view engine', 'ejs');
		self.app.use(express.static(path.join(__dirname, 'public')));
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.server.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

}; 



/************* Main **************/
var port = 8000;
var ip = "18.95.1.102";
process.argv.forEach(function (val, index, array) {
  console.log(index + ': ' + val);
  if(index == 2){
	port = parseInt(val);
   }else if(index == 3){
     ip = val;
    }
});

var s = new Server();
s.initialize(port, ip);
s.start();


