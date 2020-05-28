process.report.reportOnUncaughtException = true
process.report.reportOnFatalError = true

import debug from 'debug'
const log = debug('app')

import Http from 'http'

import database from './../database.json';

import { start } from './../agent/agent.mjs'
start(database)

import { pipeline, Transform } from 'stream'
import { promisify } from 'util'

const pipelineAsync = promisify(pipeline)

const mapData = (lang) => new Transform({
    // autoDestroy: false,
    destroy (error) {
        log('called destroy automatic!!')
    },
    transform: (chunk, encoding, cb) => {
        const data = JSON.parse(chunk)
        // simulate an error
        if (!data.name)
            throw new Error('unhandled error!!')

        const languageNames = new Intl.DisplayNames([lang], { type: 'currency' });

        const result = JSON.stringify({
            name: data.name,
            currency: languageNames.of(data.currency),
            preferences: data.preferences?.description ?? 'not found'
        })

        cb(null, result)
    }
})

const startServer = async (req, res) => {
    if (req.method !== 'POST')
        return res.end('Hey there')

    try {
        await pipelineAsync(
            req,
            mapData(req.user.speaks),
            res
        )
    } catch (error) {
        log('Internal server error!', error)
        return res.end('Internal server error')
    }
}
const port = 3000
Http
    .createServer(startServer)
    .listen(port, () => console.log('running! at', port))



export default Http

// curl -i -H "x-app-id: 1" -X POST -d '{"name":"ErickWendel","currency":"BRL","preferences":{"description":"movies"}}' http://localhost:3000
// curl -i -H "x-app-id: 2" -X POST -d '{"name":"JsonBecker","currency":"CAD","preferences":null}' http://localhost:3000

/*
autocannon \
    -m POST \
    --body '{"name":"ErickWendel","currency":"BRL","preferences":{"description":"movies"}}' \
    -H "x-app-id: 1"  \
    -c 1 \
    -d 2 \
    http://localhost:3000
*/