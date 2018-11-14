import { JsonPath, JsonPathPair } from '../index';
import * as jsonData1 from './json/example1.json';
import * as jsonData2 from './json/example2.json';
import * as jsonData3 from './json/example3.json';
import * as jsonData4 from './json/example4.json';
import * as jsonData5 from './json/example5.json';
import * as jsonData6 from './json/example6.json';
import * as jsonData7 from './json/example7.json';
import * as jsonData8 from './json/example8.json';
import * as jsonData9 from './json/example9.json';
import * as jsonData10 from './json/example10.json';
import * as jsonData11 from './json/example11.json';
import * as jsonData12 from './json/example12.json';
import * as jsonData13 from './json/example13.json';
import * as jsonData14 from './json/example14.json';
import * as jsonData15 from './json/example15.json';
import * as jsonData16 from './json/example16.json';
import * as jsonData17 from './json/example17.json';
import * as jsonData18 from './json/example18.json';
import * as jsonData19 from './json/example19.json';
import * as jsonData20 from './json/example20.json';
import * as jsonData21 from './json/example21.json';
import * as jsonData22 from './json/example22.json';
import * as jsonData23 from './json/example23.json';


test('My Test', () => {
  const jsonPath = new JsonPath();
  const marshalledObject = jsonPath.marshall(jsonData1, "", []);
  const unMarshalledObject = jsonPath.unMarshall(marshalledObject);
  const result = jsonPath.compareJsonPath(jsonData1, unMarshalledObject);
  expect(result.length).toBe(0);

});

test('Empty path test', () => {
  const jsonPath = new JsonPath();
  const marshalledObject = jsonPath.marshall(jsonData2, "", []);
  const unMarshalledObject = jsonPath.unMarshall(marshalledObject);
  const result = jsonPath.compareJsonPath(jsonData2, unMarshalledObject);
  expect(result.length).toBe(1);

});

test('Compare test', () => {
  const jsonPath = new JsonPath();
  const result = jsonPath.compareJsonPath(jsonData1, jsonData4);
  expect(result.length).toBe(5);

});

test('Array test', () => {
  const jsonPath = new JsonPath();
  const marshalledObject = jsonPath.marshall(jsonData8, "", []);
  const unMarshalledObject = jsonPath.unMarshall(marshalledObject);
  const result = jsonPath.compareJsonPath(jsonData8, unMarshalledObject);
  expect(result.length).toBe(0);

});

test('Array compare test', () => {
  const jsonPath = new JsonPath();
  const result = jsonPath.compareJsonPath(jsonData17, jsonData18);
  expect(result.length).toBe(1);

});

test('Array compare test 2', () => {
  const jsonPath = new JsonPath();
  const result = jsonPath.compareJsonPath(jsonData21, jsonData22);
  expect(result.length).toBe(1);

});




