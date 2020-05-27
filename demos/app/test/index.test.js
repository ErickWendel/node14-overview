const assert = require('assert')
const http = require('./../index')
const debug = require('debug')('app')

const mocks = {
    request1: require('./mocks/request1.json'),
    request2: require('./mocks/request2.json'),
}

const [speaksEn, speaksPt] = require('./../database.json')
const PORT = 3000

async function makeRequest(data, userId) {
    const requestData = JSON.stringify(data)
    const options = {
        hostname: 'localhost',
        port: PORT,
        path: '/',
        method: 'POST',
        headers: {
            'x-app-id': `${userId}`,
            'Content-Length': requestData.length,
            'Content-Type': 'application/json',
        }
    }

    return new Promise((resolve, reject) => {
        const request = http.request(options, (res) => {
            res.once('data', resolve)
            res.once('error', reject)
        })

        request.once("error", reject)
        request.write(requestData)
        request.end()
    })
}

; (async () => {
    {
        const response = await makeRequest(mocks.request1, speaksEn.id)

        const expected = {
            name: 'ErickWendel',
            currency: 'réal brésilien',
            preferences: 'movies'
        }
        const data = JSON.parse(response)
        debug('received', data)

        assert.deepEqual(data, expected)

    }

    {
        const response = await makeRequest(mocks.request2, speaksPt.id)
        const expected = {
            currency: 'Novo dólar taiwanês',
            name: 'XuxaDaSilva',
            preferences: 'not found'
        }
        const data = JSON.parse(response)
        debug('received', data)
        assert.deepEqual(data, expected)
    }



})() 
