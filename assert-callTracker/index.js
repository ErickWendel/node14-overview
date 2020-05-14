const assert = require('assert');

const { Writable } = require('stream')
// nvm use v14.2.0
const tracker = new assert.CallTracker();
const destroy = () => console.log('Hey! I\'m dead!')
const callDedstroy = tracker.calls(destroy)

process.on('exit', () => {
    console.log('verifying..')
    tracker.verify();
}); 
{
    const writable = new Writable({
        destroy: callDedstroy,
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

