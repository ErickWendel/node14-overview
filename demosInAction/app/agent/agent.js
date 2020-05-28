import Http from 'http'
import debug from 'debug'
import { v1 } from 'uuid'

const log = debug('agent:runner')

function start(db) {
    const emit = Http.Server.prototype.emit;
    Http.Server.prototype.emit = function (type, req, res) {
        if (type !== 'request') {
            return emit.apply(this, arguments);
        }

        const customerId = req.headers['x-app-id'] 
        const customer = db.find(customer => customer.id === parseInt(customerId))
        const data = { customerId, ...customer, requestId: v1() }
        res.setHeader('x-request-id', data.requestId)
        req.user = data

        log('a request has happened!', req.headers)
        return emit.apply(this, arguments);
    };

}
export { start }