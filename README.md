# JSON PATH VALUE

## Description

It is a library that makes easier working with Json and JsonPath. It provides 3 main functionalities:
1) Json to JsonPath
2) JsonPath to Json
3) Comparing 2 Json's
## Functionalities
### Constructor
```console
const library = new JsonPath();
```
### JsonPathPair
This is a class that represents a JsonPath format.
##### Constructor

```console
public  constructor(private  path:  string, private  value:  any, private  type:  string, private  diff:  string);
```
The first param is the **path** where a **value**, second param,  of a **type**, third param,  is placed.  The fourth param is only used in the "Compare 2 Json's" functionality.

Example:
```console
/*{
	"a": "a",
	"b" : {
		"c" : 1
	}	
}*/

let JsonPathPairs: JsonPathPair[] = [];
JsonPathPairs.push(new JsonPathPair("a", "a", "string", ''));
JsonPathPairs.push(new JsonPathPair("b.c", 1, "number", ''));

/*JsonPathPairs
PATH		VALUE 		TYPE 
a			"a"			"string"
b.c			1			"number"*/
```

### Marshall
This method allows us to transform a Json object "obj" into a JsonPath.

```console
public  marshall(obj:  any, path:  string, JsonPathPairs:  JsonPathPair[]):  JsonPathPair[]
```
In the first param you must insert your json's name. The second and the third one will always has the same initial value, "" and [] respectively.

Example:
```console
let json = {
	"a": "a",
	"b": {
		"c": {
			"d": "d",
			"e": "e"
		},
		"f": "f"
	}
}
const marshalled = library.marshall(json, "", []);

/*MARSHALLED
PATH		VALUE 		TYPE 
a			"a"			"string"
b.c.d		"d"			"string"
b.c.e		"e"			"string"
b.f 		"f"			"string"*/
```

### UnMarshall
This method allows us to transform a JsonPath "JsonPathPairs" into a Json object.

```console
public  unMarshall(JsonPathPairs:  JsonPathPair[]):  any
```
The first param must be the JsonPath in a JsonPathPair[] format.
Example:
```console
/*MARSHALLED
PATH		VALUE 		TYPE 
a			"a"			"string"
b.c.d		"d"			"string"
b.c.e		"e"			"string"
b.f 		"f"			"string"*/

const unmarshalled = library.unMarshall(marshalled, "", []);

/*unmarshalled = {
	"a": "a",
	"b": {
		"c": {
			"d": "d",
			"e": "e"
		},
		"f": "f"
	}
}*/
```


### Compare 2 Json's
This method allows us to compare 2 Json's and the method will return a JsonPathPair[], one row for each difference between the 2 Json (Addition, Modification or Deletion) and the current value.

```console
public  compare2JSONpath(before:  any, after:  any):  JsonPathPair[]
```

Example:
```console
let before = {
	"a": "a",
	"b": {
		"c": {
			"d": "d",
			"e": "e"
		},
		"f": "f"
	}
}
let after = {
	"a": true,
	"b": {
		"c": {
			"d": "d",
			"g" : "g"
		},
		"f": 2
	}
}

const compared = library.compare2JSON(before, after);

/*
COMPARED
PATH		VALUE 		TYPE 		DIFF
a			true		"boolean" 	"Modified"
b.c.e		"e"			"string"	"Deleted"
b.c.g		"g"			"string"	"Added"
b.f 		2			"number"	"Modified"
*/


```
