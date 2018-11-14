# JSON PATH VALUE

## Description

It consists 

## Functionalities
### Constructor
```console
const marshall = new Marshal();
```

### Marshall
```console
public  marshall(obj:  any, path:  string, tuplas:  Tupla[]):  Tupla[] {
```
In the first param you must insert your json's name. The second and the third one will always has the same initial value, "" and [] respectively. This method will return a "Tupla[]" that represents the JsonPath format.

Example:
```console
const marshalled = marshall.marshall(json_name, "", []);
```

### UnMarshall
```console
public  unMarshall(tuplas:  Tupla[]):  any {
```
The first param must be the JsonPath in a Tupla[] format. This method will return a json object.


### Compare 2 Json's
```console
public  compare2JSONpath(before:  any, after:  any):  Tupla[] {
```