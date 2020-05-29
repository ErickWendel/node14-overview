# Post's demo - APM Agent + Web API

## Running

### Docker

You can run this application using a Docker instance by running ['./run.sh'](./run.sh)

### Locally

You will need the Node.js v14. You'd install it using *NVM*. After installing this Node.js version, run:

```sh
npm ci
npm test
npm start
```

## Requesting

You can run the following *cURL* commands to see results

```sh
curl -i \
    -H "x-app-id: 1" \
    -X POST \
    -d '{"name":"ErickWendel","currency":"BRL","preferences":{"description":"movies"}}' \
    http://localhost:3000

curl -i \
    -H "x-app-id: 2" \
    -X POST \
    -d '{"name":"JsonBecker","currency":"CAD","preferences":null}' \
    http://localhost:3000
```
