'use strict';
(function () {

    var getDocumentNode = function (selector) {
        return document.querySelector(selector);
    };

    var chatName = getDocumentNode('.chat-name');
    var txtArea = getDocumentNode('.chat-textarea');
    var status = getDocumentNode('.chat-status span');
    var defaultS = status.textContent;
    var messageBlock = getDocumentNode('.chat-messages');
    var spacesPattern = /^\s*$/;

    try {
        var socket = io.connect('http://mytestchat-yaremenkom.rhcloud.com/:8000/', {'forceNew':true });
    }
    catch (e) {
        console.log("Socket hasn`t connected");
    }

    function setStatus(s) {
        status.textContent = s;

        if (s !== defaultS) {
            var delay = setTimeout(function () {
                setStatus(defaultS);
            }, 3000);
        }

    }

    if (socket !== undefined) {

        socket.on('output', function (data) {

            if (data.length) {
                for (var i = 0; i < data.length; i++) {

                    var message = document.createElement('div');
                    message.setAttribute('class', 'chat-message');
                    var checkedName = spacesPattern.test(data[i].name) ? "Anonymoys" : data[i].name;
                    message.textContent = checkedName + ": " + data[i].message;
                    messageBlock.appendChild(message);

                }

            }
        });

        socket.on('statusInfo', function (data) {
            setStatus((typeof data === 'object') ? data.status : data);
            if (data.clear === true) {
                txtArea.value = '';
            }

        });

        txtArea.addEventListener('keydown', function (event) {

            var message = txtArea.value;
            var name = chatName.value;
            if (event.which === 13 && event.shiftKey === false) {

                socket.emit('inputOfUsersData', {
                        name: name,
                        message: message
                    }
                );

                event.preventDefault();
                console.log("send!");
            }


        });
    }


})();