var static = require('node-static');
var http = require('http');
var file = new(static.Server)();

var app = http.createServer(function(req,res){
	file.serve(req,res);
}).listen(2014);

var io = require('socket.io').listen(app);

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
		socket.broadcast.emit('broadcast(): client '+socket.id+' joined room'+room );
	});

});

