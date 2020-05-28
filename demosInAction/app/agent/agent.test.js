import debug from 'debug'
const log = debug('agent:test')

import { Server } from 'http'
import assert from 'assert'
import { start as InjectMiddleware } from './agent.js'
const tracker = new assert.CallTracker();


const eventName = 'request'

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
const response = {
    setHeader: () => { },
    on(m, cb) { cb() }
}

InjectMiddleware(database)
const serverInstance = new Server()

{
    const expectedCallCount = 1
    const setHeader = tracker.calls(expectedCallCount);
    serverInstance.emit(eventName, request, { ...response, setHeader })

    log('user', JSON.stringify(request.user))

    assert.ok(request.user.requestId)
    assert.deepEqual(request.user.name, user.name)
}


process.on('exit', () => tracker.verify());