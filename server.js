var mongo = require('mongodb').MongoClient;
//var port = process.env.PORT || '8080';

var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';



//--------------------------------------------------------
var mongoConnectionPath = 'mongodb://localhost:27017/chatDB' ;

if(process.env.OPENSHIFT_MONGODB_DB_URL){
    mongoConnectionPath = process.env.OPENSHIFT_MONGODB_DB_URL + 'chatDB';
    }

//-----------------------------------------------------------------------------

var express = require('express');
var app = express();
var server = require('http').createServer(app);
app.use(express.static('public'));
var client = require('socket.io').listen(server).sockets;

server.listen(server_port, server_ip_address, function () {
    console.log( "Listening on " + server_ip_address + ", port " +server_port )
});
//server.listen(port);


app.get('/', function (req, res) {
    res.sendfile(__dirname + '/index.html');
});

//--------------------------------------------------------------------------------------------------------------------

mongo.connect(mongoConnectionPath, function (err, db) {

    if (err) {
        throw err;
    }

    else {

        client.on('connection', function (socket) {


            var collectionOfData = db.collection('messages');

            //emit messages
            collectionOfData.find().limit(150).sort({_id: 1}).toArray(function (err, res) {
                if (err) {
                    throw err;
                }
                else {
                    socket.emit('output', res);
                }

            });


            function getStatusInfo(status) {
                socket.emit('statusInfo', status);
            }

            console.log('Someone has connected');

            socket.on('inputOfUsersData', function (data) {

                var name = data.name;
                var message = data.message;
                var spacesPattern = /^\s*$/;

                if (spacesPattern.test(message)) {
                    getStatusInfo("You should input your message text");
                    console.log('Incorrect input');
                }
                else {
                    client.emit('output', [data]);

                    collectionOfData.insert({
                        name: spacesPattern.test(name) ? "Anonymoys" : name,
                        message: message
                    }, function () {
                        getStatusInfo({
                            status: "Message sent",
                            clear: true
                        });
                        console.log('inserted');
                    });
                }


            });

        });
    }
});
