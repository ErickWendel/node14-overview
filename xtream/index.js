const { Writable } = require('stream')
/**
 Consistency

autoDestroy: Duplex, Readable and Writable
    introduced on node 11 
    set on 14 to default 
    will call 
        destroy (in which emit (close)) automatically
    test on Node: 10
        -> nothing happens
    test on Node: 11
        -> flag default to false
    test on Node: 14
        -> flag default to true

 * 
 * 
 */
{
    const writable = new Writable({
        // autoDestroy: true,
        // emitClose: false,
        // destroy() {
        //     console.log('called!')
        //     // this.emit('close')
        // },
        write(chunk, enc, cb) { cb(); },
    });

    writable.on('finish', function (...args) {
        console.log('finish', this.destroyed)

        // before introduced
        // this.destroy()
    });

    writable.on('close', function (...args) {
        console.log('close', this.destroyed)
    });

    writable.end() 
}

