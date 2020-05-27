const Http = require('http')

const database = require('./database.json')
require('./agent/agent').start(database)

const { pipeline } = require('stream')
const { promisify } = require('util')

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

Http
    .createServer(startServer)
    .listen(3000, () => console.log('running!'))

module.exports = Http
// curl -i -H "x-app-id: 1" -X POST -d '{"name":"erickwendel"}' http://localhost:3000
// curl -i -H "x-app-id: 2" -X POST -d '{"name":"xyz"}' http://localhost:3000
/*
autocannon \
    -m POST \
    --body '{"name":"xyz"}' \
    -H "x-app-id: 1"  \
    -c 1 \
    -d 2 \
    http://localhost:3000
*/