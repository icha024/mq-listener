// Socker IO
var app = require('http').createServer(handler);
var io = require('socket.io')(app);
var fs = require('fs');

app.listen(3333);

io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

function handler (req, res) {
  fs.readFile(__dirname + '/mqclient.htm',
  function (err, data) {
    if (err) {
      res.writeHead(500);
      return res.end('Error loading index.html');
    }

    res.writeHead(200);
    res.end(data);
  });
}

// MQ Listener
var mqlight = require('mqlight');
var recvClient = mqlight.createClient({service: 'amqp://localhost', user: 'admin', password: 'password'});
var topicPattern = '#';
recvClient.on('started', function() {
  recvClient.subscribe(topicPattern);
  recvClient.on('message', function(data, delivery) {
	var message = {topic: delivery.message.topic, data: data}
	// data.topic = delivery.message.topic
    console.log('Recv: %s', data);
	io.sockets.emit('message', message)
  });
});