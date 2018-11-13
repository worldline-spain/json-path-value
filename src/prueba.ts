import { Marshall } from './test_raul';
var fs = require('fs');
var example1 = JSON.parse(fs.readFileSync('src/json/example1.json', 'utf8'));

const marshall = new Marshall();

const marshalled = marshall.marshall(example1, "", []);

console.log(marshalled);