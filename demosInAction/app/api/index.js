import debug from 'debug'
const log = debug('app:api')
import Http from 'http'

import database from '../database.json';

import { start } from '../agent/agent.js'
start(database)

import { pipeline, Transform } from 'stream'
import { promisify } from 'util'

const pipelineAsync = promisify(pipeline)

const mapData = (lang) => new Transform({
    destroy(error) {
        log('called autodestroy!!')
    },
    transform: (chunk, encoding, cb) => {
        const data = JSON.parse(chunk)

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
        return res.end('Hey dude!')
    
    try {
        await pipelineAsync(
            req,
            mapData(req.user.speaks),
            res
        )
    } catch (error) {
        log('Internal server error!', error.message)
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