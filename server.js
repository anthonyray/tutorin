var express = require('express');
var routes = require('./routes');
var path = require('path');
var http = require('http');

var app = express();

/**
*	Middleware configuration
**/

app.set('port', process.env.PORT || 2014);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/:room',routes.room);


var server = http.createServer(app);
server.listen(app.get('port'),function(){
	console.log("Express server listening on port : ",app.get('port'));
});

var io = require('socket.io').listen(server);

io.sockets.on('connection',function(socket){

	// Convenience function to log server messages on the client
	function log(){
		var array = [">>> Message from the server :"];
		for (var i = 0 ; i < arguments.length ; i++){
			array.push(arguments[i]);
		}
		socket.emit('log',array);
	}

	socket.on('message',function(message){
		log('Got message: ',message);
		//Warning, for the real app, use room only, not the broadcast
		socket.broadcast.emit('message',message);
	});

	socket.on('create or join',function (room){
		var numClients = io.sockets.clients(room).length;

		log('Room'+room+' has :'+numClients+' client(s)');
		log('Request to create or join room :' + room);

		if (numClients === 0){
			socket.join(room);
			socket.emit('created',room);
		} else if (numClients === 1){
			io.sockets.in(room).emit('join',room);
			socket.join(room);
			socket.emit('joined',room);
		} else { // Max two clients
			socket.emit('full',room);
		}
		socket.emit('emit(): client '+socket.id+' joined room'+room);
		socket.broadcast.emit('broadcast(): client '+socket.id+' joined room '+ room );
	});

});

