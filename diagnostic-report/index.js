// nvm use 13
// nvm use 14 Diagnostic Report goes Stable

let count = 0
while(count < 10){
    ++count
    console.log('count', count)
    setTimeout(() => {
        Promise.reject('HO')
        throw new Error('HEY')
    }, 100);
}
process.report.reportOnUncaughtException = true
process.report.reportOnFatalError = true
// process.report.directory = '.'
// process.report.writeReport('test.json')

