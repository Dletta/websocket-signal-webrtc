/*
Node Modules
*/
const path = require('path');
const fs = require('fs');
const http = require('http'); //serve up the static file
var WebSocketServer = require('websocket').server;
const crypto = require('crypto');

/*
Start Http Server and handle both webRTC and Http gets for index.hmtl */

var server = http.createServer(handleRequest);

const port = 3210;
server.listen(port, () => console.log(`Server running at http://localhost:${port}`));

function handleRequest (request, response) {
  console.log('request starting...');

  var filePath = '.' + request.url;
  if (filePath == './')
      filePath = './view/index.html';

  var extname = path.extname(filePath);
  var contentType = 'text/html';
  switch (extname) {
      case '.js':
          contentType = 'text/javascript';
          break;
      case '.mjs':
          contentType = 'text/javascript';
          break;
      case '.css':
          contentType = 'text/css';
          break;
      case '.json':
          contentType = 'application/json';
          break;
      case '.png':
          contentType = 'image/png';
          break;
      case '.jpg':
          contentType = 'image/jpg';
          break;
      case '.wav':
          contentType = 'audio/wav';
          break;
  }

  fs.readFile(filePath, function(error, content) {
      if (error) {
          if(error.code == 'ENOENT'){
              fs.readFile('./404.html', function(error, content) {
                  response.writeHead(200, { 'Content-Type': contentType });
                  response.end(content, 'utf-8');
              });
          }
          else {
              response.writeHead(500);
              response.end('Sorry, check with the site admin for error: '+error.code+' ..\n');
              response.end();
          }
      }
      else {
          response.writeHead(200, { 'Content-Type': contentType });
          response.end(content, 'utf-8');
      }
    })
}

wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});

function originIsAllowed(origin) {
  // put logic here to detect whether the specified origin is allowed.
  console.log(origin);
  return true;
}

var connections = [];

wsServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    var connection = request.accept('echo-protocol', request.origin);

    console.log((new Date()) + ' Connection accepted.');

    connection.sendUTF('{"handshake":true}');

    connection.on('message', function(message) {
        //handle strings
        if (message.type === 'utf8') {
            //console.log('Received Message: ' + message.utf8Data);
            console.log(message);
            var object = JSON.parse(message.utf8Data);
            if(object.direct) {
              // send directly to peer
              console.log('direct message to ', object.to);
              wsServer.connections.forEach((item, i) => {
                if(item.pid == object.to) {
                  console.log('found a match', message, object);
                  item.send(message.utf8Data);
                }
              });

            } else if (object.broadcast) {
              //broadcast
              //console.log('CLIENTSSS', wsServer.connections);
              console.log('broadcast');
              wsServer.connections.forEach((item, i) => {
                console.log(item.pid);
                item.sendUTF(message.utf8Data);
              });

            } else if (object.handshake) {
              connection.pid = object.pid;
              //console.log(connection);

            } else if (object.peerlist) {
              console.log('peer list requested');
              wsServer.connections.forEach((item, i) => {
                var object = {
                  pid: item.pid
                };
                var msg = JSON.stringify(object);
                item.sendUTF(msg);
              });

            }
        }
        else if (message.type === 'binary') {
            console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
            connections.sendBytes(message.binaryData);
        }
    });

    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
        wsServer.connections.forEach((item, i) => {
          var object = {
            left: true,
            announce: true,
            pid: item.pid,
          };
          var msg = JSON.stringify(object);
          item.sendUTF(msg);
        });
    });

});
