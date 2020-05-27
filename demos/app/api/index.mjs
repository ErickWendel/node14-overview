import Http from 'http'
 
import database from './../database.json'; 

import { start } from './../agent/agent.mjs'
start(database) 

import { pipeline } from 'stream'
import { promisify } from 'util'

const pipelineAsync = promisify(pipeline)

const mapData = (data, lang) => {
    const languageNames = new Intl.DisplayNames([lang], { type: 'currency' });

    return JSON.stringify({
        name: data.name,
        currency: languageNames.of(data.currency),
        preferences: data.preferences?.description ?? 'not found'
    })
}

const startServer = async (req, res) => {
    if (req.method !== 'POST')
        return res.end('Hey dude!')

    await pipelineAsync(
        req,
        async function* (source) {
            for await (const item of source)
                yield mapData(JSON.parse(item), req.user.speaks) 
        },
        res
    )

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
    --body '{"name":"xyz"}' \
    -H "x-app-id: 1"  \
    -c 1 \
    -d 2 \
    http://localhost:3000
*/