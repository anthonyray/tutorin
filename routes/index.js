exports.index = function(req,res){
	res.sendfile('public/index.html');
};

exports.chooseroom = function(req, res){
	res.sendfile('public/landing.html');
};

exports.room = function(req,res){
	res.sendfile('public/room.html');
};