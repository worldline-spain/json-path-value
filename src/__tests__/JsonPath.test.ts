import { JsonPath,JsonPathPair } from '../index';
const jsonData = {
  "a": {
      "b": "b",
      "c": "c"
  },
  "x": {
      "x": "x"
  }
};

test('My Test', () => {
  
  const jsonPath = new JsonPath();

  const marshalledObject = jsonPath.marshall(jsonData, "", []);
  const unMarshalledObject = jsonPath.unMarshall(marshalledObject);
  const result = jsonPath.compareJsonPath(jsonData,unMarshalledObject );
  expect(result.length).toBe(0);

});
