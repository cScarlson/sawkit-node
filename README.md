sawKit-node
===========

A back-end Facade over the popular 'ws' module for Node, allowing for event emissions and custom event reception.

**Quick-Start**

        $ws({port: 8080}).ready(function($ws, ws){
          
          $ws.send('Tonight at 9...')
            .send({msg: 'tonight at 9...'})
            .emit('news', {message: 'WARNING! Flash-flood!'})
            .emit('news', 'TORNADOW WARNING!');
          
          $ws.on('news', function(data){
              console.log('NEWS!', data, typeof data);
            })
            .on('message', function(data){
              console.log('MESSAGE!', data, typeof data);
            });
          
        });

**METHODS**

***COMING SOON!***


