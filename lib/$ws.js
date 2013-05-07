/**
 * This is a Facade Pattern to the Node Module "ws", for WebSockets.
 */


module.exports = (function(){
  var WebSocketServer = require('ws').Server;
  function WS(){
    var self = this;
    return function(opts){
      self.wss = new WebSocketServer((opts || {port: 8080}));
      return {
        wss: self.wss,
        ready: self.connected,
        emit: self.emit,
        send: self.send,
        sendBinary: self.sendBinary,
        on: self.on
      };
    };
  };
  
  WS.prototype = (function(){
    var self;
    
    var util = (function(){
      var timestamp = (new Date).getTime();
      
      var promise = (function(){
        var promises = promises || [];
        function mise(promise){ // pro.mise() (promise it)
          promises.push(promise);
          return promises;
        };
        function gress(key, callback){ // pro.gress() (progress to)
          promises.forEach(function(it, i, a){
            (it.event === key) && callback(it);
          });
        };
        
        return {
          promises: promises,
          mise: mise,
          gress: gress
        };
      })();
      
      function messageBridge(creds){
        var promise = {}, creds = creds, data = creds.data, event = creds.event;
        
        (creds.action === 'send') && (function(){
        
          (event === 'message') && (function(){
            data = JSON.stringify(data);
          }())
          ||
          (event !== 'message') && (function(){
            data = JSON.stringify({_data: data, _event: event});
          }());
          
        }())
        ||
        ((creds.action === 'receive') && (function(){
          var cons = data.constructor, msg = data, event = 'message';;
          (cons !== Buffer && cons !== ArrayBuffer && cons !== Uint8Array) && (function(){
            msg = JSON.parse(data);
            
            (msg.constructor === Object) && (function(){
              event = ((msg._event) && msg._event) || event;
              msg = ((msg._data) && msg._data) || msg;
            }());
            
            util.pro.gress(event, function(_promise){
              _promise.data = msg, _promise.event = event; promise = _promise;
            });
          }())
          ||
          (cons === Buffer || cons === ArrayBuffer || cons === Uint8Array) && (function(){
            util.pro.gress(event, function(_promise){
              _promise.data = msg, _promise.event = event; promise = _promise;
            });
          }());
          
        }()));
        
        return {
          data: data, // for emit
          promise: promise // for onmessage
        };
      };
      
      return {
        ts: timestamp,
        pro: promise,
        msgBridge: messageBridge
      };
    })();
    
    function connected(callback){
      self = this;
      self.wss.on('connection', function(ws){
        console.log('connection made...');
        self.ws = ws;
        callback(self, self.ws);
        
        self.ws.on('message', function(data){
          self.on({data: data});
        });
      });
      
      return this;
    };
    function emit(event, data, callback){
      var data = data;
      
      ((event === 'message') && (function(){
        data = JSON.stringify(data);
      }()))
      ||
      ((event !== 'message') && (function(){
        data = JSON.stringify({_data: data, _event: event});
      }()));
      
      self.ws.send(data);
      console.log('message sent...');
      
      return this;
    };
    function send(data, callback){
      self.emit('message', data);
      return this;
    };
    function sendBinary(binary){
      self.ws.send(binary, {binary: true, mask: false});
    };
    function on(event, callback){
      var promise, promises;
      
      (typeof event === 'string' && callback) && (function(){
        util.pro.mise({event: event, callback: callback});
      }())
      ||
      (typeof event === 'object' && !callback) && (function(){
        promise = util.msgBridge({action: 'receive', data: event.data}).promise;
        (promise.callback) && promise.callback(promise.data, promise);
      }());
      
      return this;
    };
    
    return {
      connected: connected,
      emit: emit,
      send: send,
      sendBinary: sendBinary,
      on: on
    };
  })();
  
  return new WS;
})();

/*
wss.on('connection', function(ws){
  
  ws.on('my event', function(message){
    ws.send(message + 'thing');
    console.log('my event. received: %s', message);
  });
  ws.send('something');
  ws.send(JSON.stringify({data: 'something else', event: 'news'}));
});
*/







