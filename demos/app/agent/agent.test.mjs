import debug from 'debug' 
const log = debug('agent')

import { Server } from 'http'
import assert from 'assert'
import { start as InjectMiddleware } from './agent.mjs'

const tracker = new assert.CallTracker();
const serverInstance = new Server()

const eventName = 'request'
const expectedCallCount = 1

const database = [{
    "id": 1,
    "name": "joaozinho",
    "paidIn": "USD",
    "speaks": ["fr", "pt-br"]
}]
const user = database[0]
const request = {
    headers: {
        'x-app-id': user.id
    }
}

InjectMiddleware(database)
const setHeader = tracker.calls(expectedCallCount);
const response = { setHeader: setHeader, on(m, cb) { cb() } }

serverInstance.emit(eventName, request, response)

log('user', JSON.stringify(request.user))

assert.ok(request.user.requestId)
assert.deepEqual(request.user.name, user.name)

process.on('exit', () => tracker.verify());