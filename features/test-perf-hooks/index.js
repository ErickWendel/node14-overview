const { PerformanceObserver, performance } = require('perf_hooks');
function mark(event, requestId, name) {
    console.log(name, event, 'has been emited')
    const labelStart = `start-${name}-${requestId}`
    const labelEnd = `end-${name}-${requestId}`

    if (event === "start") {
        performance.mark(labelStart)
    }

    if (event === "finish") {
        performance.mark(labelEnd);
        performance.measure(`myapp-${name}-${requestId}`, labelStart, labelEnd);
    }
}

const obs = new PerformanceObserver((items, obs) => {
    const [item] = items.getEntries()
    console.log({
        name: item.name,
        duration: item.duration,
    });
    performance.clearMarks();
});

obs.observe({ entryTypes: ['measure'] });


let counter = 0
const Http = require('http')
Http.createServer((req, res) => {
    const id = Date.now()
    const appName = `test:${++counter}`
    res.on('finish', () => mark('finish', id, appName))
    
    mark('start', id, appName)

    res.end('Hey there!')
}).listen(3000, () => console.log('running...'))
