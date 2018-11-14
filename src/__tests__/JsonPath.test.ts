import { JsonPath,JsonPathPair } from '../index';
import * as jsonData1 from './json/example1.json';

test('My Test', () => {
  const jsonPath = new JsonPath();
  const marshalledObject = jsonPath.marshall(jsonData1, "", []);
  const unMarshalledObject = jsonPath.unMarshall(marshalledObject);
  const result =jsonPath.compareJsonPath(jsonData1,unMarshalledObject );
  expect(result.length).toBe(0);

});


