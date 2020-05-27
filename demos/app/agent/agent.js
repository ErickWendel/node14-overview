const { promises: { appendFile } } = require('fs')
const { PerformanceObserver, performance } = require('perf_hooks');
const { AsyncLocalStorage } = require('async_hooks');
const debug = require('debug')('agent')
const uuid = require('uuid')

const asyncLocalStorage = new AsyncLocalStorage();
const logger = `${__dirname}/logger.log`

const obs = new PerformanceObserver((items) => {
    const [entry] = items.getEntries()
    const item = entry

    debug({
        name: item.name,
        duration: `${item.duration} ms`,
    });

    performance.clearMarks(item.name);
    appendFile(logger, `name: ${item.name},duration: ${item.duration}\n`)
});

obs.observe({ entryTypes: ['measure'] });


function logRequest(msg) {
    const store = asyncLocalStorage.getStore();
    const { name, requestId } = store

    const labelStart = `start-${name}-${requestId}`
    const labelEnd = `end-${name}-${requestId}`
    debug(`${msg}:${name}:${requestId}`)

    if (msg === "start") {
        performance.mark(labelStart)
    }

    if (msg === "finish") {
        performance.mark(labelEnd);
        performance.measure(`myapp-${name}-${requestId}`, labelStart, labelEnd);
    }
}



const Http = require('http');
function start(db) {
    const emit = Http.Server.prototype.emit;
    Http.Server.prototype.emit = function (type, req, res) {
        if (type !== 'request') {
            return emit.apply(this, arguments);
        }

        const customerId = req.headers['x-app-id']
        // const customerId = Math.floor(Math.random() * 2) + 1;
        const customer = db.find(customer => customer.id === parseInt(customerId))
        const data = { customerId, ...customer, requestId: uuid.v1() }
        res.setHeader('x-request-id', data.requestId)
        req.user = data
        asyncLocalStorage.enterWith(data)

        logRequest('start');
        res.on('finish', () => logRequest('finish'))

        return emit.apply(this, arguments);
    };

}
module.exports = { start }
