
class Tupla {

    public constructor(private path: string, private value: string, private type: string, private diff: string) { }

    public getPath(): string {
        return this.path;
    }

    public getValue(): string {
        return this.value;
    }

    public getType(): string {
        return this.type;
    }

    public getDiff(diff: string) {
        return this.diff;
    }
}

class Marshall {

    constructor(private tuplas: Tupla[]) { }

    public marshall(obj: any, path: string, tuplas: Tupla[]): Tupla[] {
        if (obj instanceof Array) {
            for (let i = 0; i < obj.length; ++i) {
                if (typeof obj[i] === "string") tuplas.push(new Tupla(path + '[' + i + ']', obj[i].toString(), "string", ""));
                else if (typeof obj[i] === "number") tuplas.push(new Tupla(path + '[' + i + ']', obj[i].toString(), "number", ""));
                else if (typeof obj[i] === "boolean") tuplas.push(new Tupla(path + '[' + i + ']', obj[i].toString(), "boolean", ""));
                else if (typeof obj[i] === "object") {
                    tuplas = this.marshall(obj[i], path + '[' + i + ']', tuplas);
                }
            }
        }
        else if (typeof obj === "object") {
            if (obj instanceof Date) {
                console.log(path);
                tuplas.push(new Tupla(path, obj.toString(), "Date", ""));
            }
            else {
                for (let x in obj) {
                    if (path != "") tuplas = this.marshall(obj[x], path + '.' + x, tuplas);
                    else
                        tuplas = this.marshall(obj[x], x, tuplas);
                }
            }
        }
        else {
            if (typeof obj === "number") {
                console.log(path);
                tuplas.push(new Tupla(path, obj.toString(), "number", ""));
            }
            else if (typeof obj === "string") {
                console.log(path);
                tuplas.push(new Tupla(path, obj, "string", ""));
            }
            else if (typeof obj === "boolean") {
                console.log(path);
                tuplas.push(new Tupla(path, obj.toString(), "boolean", ""));
            }
        }
        return tuplas;
    }

    public doArrayRecursivity(json: any, attr: string[], pos: number, tuplas: Tupla[], index_tuplas: number): any {
        if (pos < attr.length) {
            if (!json[attr[pos - 1]]) json.push([]);
            if (pos == attr.length - 1) {
                json[attr[pos - 1]].push(tuplas[index_tuplas].getValue());
            }
            else {
                json[attr[pos - 1]] = this.doArrayRecursivity(json[attr[pos - 1]], attr, pos++, tuplas, index_tuplas);
            }
        }
        return json;
    }

    public doJsonRecursivity(jsonpath: any[], json: any, position: number, index_tuplas: number, tuplas: Tupla[]): any {
        var attr;
        if (jsonpath[position].includes('[')) {
            attr = jsonpath[position].split('[');
            for (let i = 1; i < attr.length; ++i) {
                attr[i] = parseInt(attr[i].substring(0, attr[i].length - 1));
            }
        }
        if (!attr && position == jsonpath.length - 1 && !json[jsonpath[position]]) {
            if (tuplas[index_tuplas].getType() == "string") json[jsonpath[position]] = tuplas[index_tuplas].getValue();
            else if (tuplas[index_tuplas].getType() == "number") json[jsonpath[position]] = parseInt(tuplas[index_tuplas].getValue(), 10);
            else if (tuplas[index_tuplas].getType() == "boolean") json[jsonpath[position]] = (tuplas[index_tuplas].getValue() == "true");
            else if (tuplas[index_tuplas].getType() == "Date") json[jsonpath[position]] = new Date(tuplas[index_tuplas].getValue());
        }
        else if (!attr && position != jsonpath.length - 1 && !json[jsonpath[position]]) {
            json[jsonpath[position]] = {};
            json[jsonpath[position]] = this.doJsonRecursivity(jsonpath, json[jsonpath[position]], position + 1, index_tuplas, tuplas);
        }
        else if (!attr && position != jsonpath.length - 1 && json[jsonpath[position]]) {
            json[jsonpath[position]] = this.doJsonRecursivity(jsonpath, json[jsonpath[position]], position + 1, index_tuplas, tuplas);
        }
        else if (attr && position == jsonpath.length - 1 && !json[attr[0]]) {
            json[attr[0]] = [];
            if (attr.length > 2) {

                json[attr[0]] = this.doArrayRecursivity(json[attr[0]], attr, 2, tuplas, index_tuplas);

            } else {
                if (tuplas[index_tuplas].getType() == "string") json[attr[0]].push(tuplas[index_tuplas].getValue());
                else if (tuplas[index_tuplas].getType() == "number") json[attr[0]].push(parseInt(tuplas[index_tuplas].getValue(), 10));
                else if (tuplas[index_tuplas].getType() == "boolean") json[attr[0]].push((tuplas[index_tuplas].getValue() == "true"));
                else if (tuplas[index_tuplas].getType() == "Date") json[attr[0]].push(new Date(tuplas[index_tuplas].getValue()));
            }
        }
        else if (attr && position != jsonpath.length - 1 && !json[attr[0]]) {
            json[attr[0]] = [];
            json[attr[0]].push({});
            json[attr[0]][attr[1]] = this.doJsonRecursivity(jsonpath, json[attr[0]][attr[1]], position + 1, index_tuplas, tuplas);
        }
        else if (attr && position == jsonpath.length - 1 && json[attr[0]]) {

            if (attr.length > 2) {
                json[attr[0]] = this.doArrayRecursivity(json[attr[0]], attr, 2, tuplas, index_tuplas);
            }
            else {
                if (tuplas[index_tuplas].getType() == "string") json[attr[0]].push(tuplas[index_tuplas].getValue());
                else if (tuplas[index_tuplas].getType() == "number") json[attr[0]].push(parseInt(tuplas[index_tuplas].getValue(), 10));
                else if (tuplas[index_tuplas].getType() == "boolean") json[attr[0]].push((tuplas[index_tuplas].getValue() == "true"));
                else if (tuplas[index_tuplas].getType() == "Date") json[attr[0]].push(new Date(tuplas[index_tuplas].getValue()));
            }
        }
        else if (attr && position != jsonpath.length - 1 && json[attr[0]] && !json[attr[0]][attr[1]]) {
            json[attr[0]].push({});
            json[attr[0]][attr[1]] = this.doJsonRecursivity(jsonpath, json[attr[0]][attr[1]], position + 1, index_tuplas, tuplas);
        }
        else if (attr && position != jsonpath.length - 1 && json[attr[0]] && json[attr[0]][attr[1]]) {
            json[attr[0]][attr[1]] = this.doJsonRecursivity(jsonpath, json[attr[0]][attr[1]], position + 1, index_tuplas, tuplas);
        }
        return json;
    }


    public unMarshall(tuplas: Tupla[]): any {
        let json = {};
        for (let i = 0; i < tuplas.length; ++i) {
            var splitted = (tuplas[i].getPath()).split('.');
            json = this.doJsonRecursivity(splitted, json, 0, i, tuplas);
        }
        return json;
    }

    public checkbefaft(objb: any, obja: any, path: string, tuplas: Tupla[]): Tupla[] {
        if (objb instanceof Array) {
            if (obja instanceof Array) {
                for (let i = 0; i < objb.length; ++i) {
                    if (i < obja.length) tuplas = this.checkbefaft(objb[i], obja[i], path + '[' + i + ']', tuplas);
                    else {
                        if (typeof objb[i] === "number") tuplas.push(new Tupla(path + '[' + i + ']', objb[i].toString(), "number", 'Deleted'));
                        else if (typeof objb[i] === "string") tuplas.push(new Tupla(path + '[' + i + ']', objb[i], "string", "Deleted"));
                        else if (typeof objb[i] === "object") {
                            //
                        } else if (typeof obja === "boolean") {
                            tuplas.push(new Tupla(path + '[' + i + ']', objb[i].toString(), "boolean", 'Deleted'));
                        }
                    }
                }
            }
        }
        else if (typeof objb === "object") {
            if (objb instanceof Date) {
            }
            else {
                for (let x in objb) {
                    if (!obja[x]) {
                        if (path != "") tuplas = this.checkbefaft(objb[x], '', path + '.' + x, tuplas);
                        else {
                            tuplas = this.checkbefaft(objb[x], '', x, tuplas);
                        }
                    }
                    else if (obja[x] != objb[x]) {
                        if (path != "") tuplas = this.checkbefaft(objb[x], obja[x], path + '.' + x, tuplas);
                        else {
                            tuplas = this.checkbefaft(objb[x], obja[x], x, tuplas);
                        }
                    }
                }
            }
        }
        else {
            if (typeof objb === "number") {
                if (obja && objb != obja) {
                    if (typeof obja === "number") tuplas.push(new Tupla(path, obja.toString(), "number", 'Modified'));
                    else if (typeof obja === "string") tuplas.push(new Tupla(path, obja, "string", "Modified"));
                    else if (typeof obja === "object") {
                        for (let x in obja) {
                            if (path != "") tuplas = this.checkbefaft(objb, obja[x], path + '.' + x, tuplas);
                            else if (path == "") tuplas = this.checkbefaft(objb, obja[x], x, tuplas);
                        }
                    } else if (typeof obja === "boolean") {
                        tuplas.push(new Tupla(path, obja.toString(), "boolean", 'Modified'));
                    }
                }
                else if (!obja) {
                    tuplas.push(new Tupla(path, objb.toString(), "number", 'Deleted'));
                }
            }
            else if (typeof objb === "string") {
                if (obja && objb != obja) {
                    if (typeof obja === "number") tuplas.push(new Tupla(path, obja.toString(), "number", 'Modified'));
                    else if (typeof obja === "string") tuplas.push(new Tupla(path, obja, "string", "Modified"));
                    else if (typeof obja === "object") {
                        for (let x in obja) {
                            if (path != "") tuplas = this.checkbefaft(objb, obja[x], path + '.' + x, tuplas);
                            else if (path == "") tuplas = this.checkbefaft(objb, obja[x], x, tuplas);
                        }
                    } else if (typeof obja === "boolean") {
                        tuplas.push(new Tupla(path, obja.toString(), "boolean", 'Modified'));
                    }
                }
                else if (!obja) {
                    tuplas.push(new Tupla(path, objb, "string", 'Deleted'));
                }
            }
            else if (typeof objb === "boolean") {
                if (obja && objb != obja) {
                    if (typeof obja === "number") tuplas.push(new Tupla(path, obja.toString(), "number", 'Modified'));
                    else if (typeof obja === "string") tuplas.push(new Tupla(path, obja, "string", "Modified"));
                    else if (typeof obja === "object") {
                        for (let x in obja) {
                            if (path != "") tuplas = this.checkbefaft(objb, obja[x], path + '.' + x, tuplas);
                            else if (path == "") tuplas = this.checkbefaft(objb, obja[x], x, tuplas);
                        }
                    } else if (typeof obja === "boolean") {
                        tuplas.push(new Tupla(path, obja.toString(), "boolean", 'Modified'));
                    }
                }
                else if (!obja) {
                    tuplas.push(new Tupla(path, objb.toString(), "boolean", 'Deleted'));
                }
            }
        }
        return tuplas;
    }

    public checkaftbef(objb: any, obja: any, path: string, tuplas: Tupla[]): Tupla[] {
        if (obja instanceof Array) {
            for (let i = 0; i < obja.length; ++i) {
            }
        }
        else if (typeof obja === "object") {
            if (obja instanceof Date) {
            }
            else {
                for (let x in obja) {
                    if (!objb[x]) {
                        if (path != "") {
                            tuplas = this.checkaftbef("", obja[x], path + '.' + x, tuplas);
                        }
                        else {
                            tuplas = this.checkaftbef("", obja[x], x, tuplas);
                        }
                    }
                }
            }
        }
        else {
            if (typeof obja === "number") {
                if (!objb) {
                    tuplas.push(new Tupla(path, obja.toString(), "number", 'Added'));
                }
            }
            else if (typeof obja === "string") {
                if (!objb) {
                    tuplas.push(new Tupla(path, obja, "string", 'Added'));
                }
            }
            else if (typeof obja === "boolean") {
                if (!objb) {
                    tuplas.push(new Tupla(path, obja.toString(), "boolean", 'Added'));
                }
            }
        }

        return tuplas;
    }

    public compare2JSONpath(/* tuplasbefore: Tupla[], tuplasafter: Tupla[] */): Tupla[] {
        let tuplas3: Tupla[] = [];

        //let marshall = new Marshall(new Array<Tupla>());
        //const marshalled = marshall.unMarshall(tuplasbefore);
        //const marshalled2 = marshall.unMarshall(tuplasafter);

        let example16 = {
            "a": "a",
            "b": [
                [
                    "Ford",
                    "Nissan"
                ],
                "ey"
            ]
        };

        let example17 = {
            "b": [
                [
                    "Toyota",
                    "Seat"
                ],
                {
                    "g": "g"
                }
            ]
        };

        tuplas3 = this.checkbefaft(/* marshalled, marshalled2 */example16, example17, "", []);
        tuplas3 = this.checkaftbef(/* marshalled, marshalled2 */example16, example17, "", tuplas3);

        return tuplas3;
    }

}

let example1 = {
    "a": {
        "b": "b",
        "c": "c"
    },
    "x": {
        "x": "x"
    }
};

let example2 = {
    "a": "b"
};

let example3 = {
    "date": new Date('2012-04-23T18:25:43.511Z')
};

let example4 = {
    "a": {
        "c": false,
        "d": true
    },
    "b": true
};

let example5 = {
    "e": 123,
    "f": {
        "g": 1,
        "h": 2,
        "i": 3
    }
};

let example6 = {
    "a": "a",
    "b": {
        "c": {
            "d": "d",
            "e": "e"
        },
        "f": "f"
    }
}

let example7 = {
    "a": "a",
    "b": {
        "c": {
            "d": true,
            "e": false
        },
        "f": new Date('2012-04-23T18:25:43.511Z')
    }
};

let example8 = {
    "name": "John",
    "age": 30,
    "cars": [
        "Ford",
        "BMW",
        "Fiat",
        true,
        {
            "d": "d",
            "a": [
                "e",
                "f"
            ]
        }
    ]
};

let example = {
    "name": "John",
    "age": 30,
    "cars": [
        "Ford",
        "BMW",
        "Fiat",
        true,
        {
            "d": "d",
            "a": [
                {
                    "e": "e",
                    "f": "f"
                },
                "b"
            ]
        }
    ]
};

let example10 = {
    "name": "John",
    "age": 30,
    "cars": [
        "Ford",
        "BMW",
        "Fiat",
        true,
        {
            "d": "d",
            "a": [
                {
                    "e": "e",
                    "f": "f",
                    "g": [
                        "h",
                        "i"
                    ]
                },
                "b"
            ]
        }
    ]
};

let example11 = {
    "name": "John",
    "age": 30,
    "cars": [
        "Ford",
        "BMW",
        "Fiat",
        true,
        {
            "d": "d",
            "a": [
                [
                    "c",
                    "e"
                ],
                "b"
            ]
        }
    ]
};


let example12 = {
    "b": "b",
    "c": "c",
    "d": {
        "e": "e"
    }
};

let example13 = {
    "b": "c",
    "c": "b",
    "d": {
        "e": "f"
    }
};

let example14 = {
    "b": "c",
    "d": {
        "e": "f"
    }
};

let example15 = {
    "b": "c",
    "g": "g",
    "d": {
        "e": "f"
    }
};

let example16 = {
    "a": "a",
    "b": [
        [
            "Ford",
            "Nissan"
        ],
        "ey"
    ]
};

const marshall = new Marshall(new Array<Tupla>());

const marshalled2 = marshall.marshall(example16, "", []);

console.log(marshalled2);

const resultObj = marshall.unMarshall(marshalled2);

console.log(resultObj);

/* const example12m = marshall.marshall(example12, "", []);
const example13m = marshall.marshall(example15, "", []); */


const result = marshall.compare2JSONpath(/* example12m, example13m */);

console.log(result);