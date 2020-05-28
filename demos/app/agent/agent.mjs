process.report.reportOnUncaughtException = true
process.report.reportOnFatalError = true
process.report.reportOnSignal = true
process.report.directory = './reports'

import { appendFile } from 'fs/promises'
import { PerformanceObserver, performance } from 'perf_hooks'
import { AsyncLocalStorage } from 'async_hooks'
import { resolve } from 'path'
import { v1 } from 'uuid'
import Http from 'http'

import debug from 'debug'
const log = debug('agent:runner')

const asyncLocalStorage = new AsyncLocalStorage();
const logger = `${resolve()}/logger.log`

const obs = new PerformanceObserver((items) => {
    const [entry] = items.getEntries()
    const item = entry

    log({
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



function start(db) {
    const emit = Http.Server.prototype.emit;
    Http.Server.prototype.emit = function (type, req, res) {
        if (type !== 'request') {
            return emit.apply(this, arguments);
        }

        const customerId = req.headers['x-app-id']
        // const customerId = Math.floor(Math.random() * 2) + 1;
        const customer = db.find(customer => customer.id === parseInt(customerId))
        const data = { customerId, ...customer, requestId: v1() }
        res.setHeader('x-request-id', data.requestId)
        req.user = data
        asyncLocalStorage.enterWith(data)

        logRequest('start');
        res.on('finish', () => logRequest('finish'))
        return emit.apply(this, arguments);
    };

}
export { start }
