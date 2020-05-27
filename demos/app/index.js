const { createServer } = require('http')

const database = require('./database.json')
require('./agent/agent').start(database)

const { Transform, pipeline } = require('stream')
const { promisify } = require('util')

const pipelineAsync = promisify(pipeline)

createServer(async (req, res) => {
    if (!req.method)
        res.end('Hey dude!')

    await pipelineAsync(
        req,
        async function* (source) {
            source.setEncoding('utf8')
            for await (const item of source) {

                yield item
            }
        }
    )

    res.end('Hey there')

}).listen(3000, () => console.log('running!'))

// curl -i -H "x-app-id: 1" -X POST -d '{"name":"xyz"}' http://localhost:3000 
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