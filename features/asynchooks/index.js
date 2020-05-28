const { PerformanceObserver, performance } = require('perf_hooks');

const http = require('http');
const { AsyncLocalStorage } = require('async_hooks');
const Uuid = require('uuid')
const asyncLocalStorage = new AsyncLocalStorage();

const obs = new PerformanceObserver((items) => {
    const [entry] = items.getEntries()

    const item = entry

    console.log({
        name: item.name,
        duration: item.duration,

    });

    performance.clearMarks();
});

obs.observe({ entryTypes: ['measure'] });


function logWithId(msg) {
    const id = asyncLocalStorage.getStore();
    const uuid = id.uuid

    const labelStart = `start-${uuid}`
    const labelEnd = `end-${uuid}`
    console.log(`${uuid}:${msg}`)
    
    if (msg === "start") {
        performance.mark(labelStart)
    }

    if (msg === "finish") {
        performance.mark(labelEnd);
        performance.measure(`myapp-${uuid}`, labelStart, labelEnd);
    }
}

const longOp = ms => new Promise(resolve => setTimeout(resolve, ms))

let count = 0
http.createServer((req, res) => {

    asyncLocalStorage.run({ uuid: Uuid.v4() }, async () => {
        logWithId('start');
        await longOp(200 * (++count + 1))
        logWithId('loading file...');
        await longOp(50 * (count + 1))
        // Imagine any chain of async operations here
        logWithId('finish');
        res.end();

    });
}).listen(8080)

http.get('http://localhost:8080');
const interv = setImmediate(() => {
    http.get('http://localhost:8080');
}, 1000)

setTimeout(() => {
    clearInterval(interv)
}, 2000);