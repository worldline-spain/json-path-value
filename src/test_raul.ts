var fs = require('fs');
var example1 = JSON.parse(fs.readFileSync('src/json/example1.json', 'utf8'));
var example2 = JSON.parse(fs.readFileSync('src/json/example2.json', 'utf8'));
var example3 = JSON.parse(fs.readFileSync('src/json/example3.json', 'utf8'));
var example4 = JSON.parse(fs.readFileSync('src/json/example4.json', 'utf8'));
var example5 = JSON.parse(fs.readFileSync('src/json/example5.json', 'utf8'));
var example6 = JSON.parse(fs.readFileSync('src/json/example6.json', 'utf8'));
var example7 = JSON.parse(fs.readFileSync('src/json/example7.json', 'utf8'));
var example8 = JSON.parse(fs.readFileSync('src/json/example8.json', 'utf8'));
var example9 = JSON.parse(fs.readFileSync('src/json/example9.json', 'utf8'));
var example10 = JSON.parse(fs.readFileSync('src/json/example10.json', 'utf8'));
var example11 = JSON.parse(fs.readFileSync('src/json/example11.json', 'utf8'));
var example12 = JSON.parse(fs.readFileSync('src/json/example12.json', 'utf8'));
var example13 = JSON.parse(fs.readFileSync('src/json/example13.json', 'utf8'));
var example14 = JSON.parse(fs.readFileSync('src/json/example14.json', 'utf8'));
var example15 = JSON.parse(fs.readFileSync('src/json/example15.json', 'utf8'));
var example16 = JSON.parse(fs.readFileSync('src/json/example16.json', 'utf8'));
var example17 = JSON.parse(fs.readFileSync('src/json/example17.json', 'utf8'));
var example18 = JSON.parse(fs.readFileSync('src/json/example18.json', 'utf8'));
var example19 = JSON.parse(fs.readFileSync('src/json/example19.json', 'utf8'));
var example20 = JSON.parse(fs.readFileSync('src/json/example20.json', 'utf8'));
var example21 = JSON.parse(fs.readFileSync('src/json/example21.json', 'utf8'));
var example22 = JSON.parse(fs.readFileSync('src/json/example22.json', 'utf8'));




class Tupla {

    public constructor(private path: string, private value: any, private type: string, private diff: string) { }

    public getPath(): string {
        return this.path;
    }

    public getValue(): any {
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
                json[attr[pos - 1]] = this.doArrayRecursivity(json[attr[pos - 1]], attr, pos + 1, tuplas, index_tuplas);
            }
        }
        return json;
    }

    public doArrayAndObjectRecursivity(json: any, jsonpath: any[], posjsonpath: number, attr: any[], pos: number, tuplas: Tupla[], index_tuplas: number): any {
        if (pos <= attr.length && posjsonpath != jsonpath.length - 1) {
            if (pos == attr.length - 1) {
                if (!json[attr[pos - 1]][attr[pos]]) json[attr[pos - 1]].push({});
                var attr2 = [];
                if (jsonpath[posjsonpath + 1].includes('[')) {
                    attr2 = jsonpath[posjsonpath + 1].split('[');
                    for (let i = 1; i < attr2.length; ++i) {
                        attr2[i] = parseInt(attr2[i].substring(0, attr2[i].length - 1));
                    }
                    json[attr[pos - 1]][attr[pos]] = this.doArrayAndObjectRecursivity(json[attr[pos - 1]][attr[pos]], jsonpath, posjsonpath + 1, attr2, 0, tuplas, index_tuplas);
                }
            }
            else {
                json[attr[pos - 1]] = this.doArrayAndObjectRecursivity(json[attr[pos - 1]], jsonpath, posjsonpath, attr, pos + 1, tuplas, index_tuplas);
            }
        }
        else if (pos <= attr.length && posjsonpath == jsonpath.length - 1) {
            if (!json[attr[pos]]) {
                if (attr && pos != attr.length - 1) {
                    json[attr[pos]] = [];
                    json[attr[pos]] = this.doArrayAndObjectRecursivity(json[attr[0]], jsonpath, posjsonpath, attr, pos + 1, tuplas, index_tuplas);
                }
                else if (attr && pos == attr.length - 1) {
                    json.push(tuplas[index_tuplas].getValue());
                }
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
            if (attr.length > 2) {
                json[attr[0]][attr[1]] = this.doArrayAndObjectRecursivity(json[attr[0]][attr[1]], jsonpath, position, attr, 3, tuplas, index_tuplas);
            } else {
                json[attr[0]][attr[1]] = this.doJsonRecursivity(jsonpath, json[attr[0]][attr[1]], position + 1, index_tuplas, tuplas);
            }
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
                        else if (objb[i] instanceof Array) {
                            tuplas.push(new Tupla(path + '[' + i + ']', objb[i], "Array", "Deleted"));
                        }
                        else if (typeof objb[i] === "object") {
                            tuplas.push(new Tupla(path + '[' + i + ']', objb[i], "Object", "Deleted"));
                        } else if (typeof obja === "boolean") {
                            tuplas.push(new Tupla(path + '[' + i + ']', objb[i].toString(), "boolean", 'Deleted'));
                        }
                    }
                }
            }
            else {
                if (typeof obja === "number") {
                    tuplas.push(new Tupla(path, obja.toString(), "number", 'Modified'));
                } else if (typeof obja === "string") {
                    tuplas.push(new Tupla(path, obja, "string", 'Modified'));
                } else if (typeof obja === "boolean") {
                    tuplas.push(new Tupla(path, obja.toString(), "boolean", 'Modified'));
                } else if (typeof obja === "object") {
                    tuplas.push(new Tupla(path, obja, "object", 'Modified'));
                }
            }
        }
        else if (typeof objb === "object") {
            if (objb instanceof Date) {
                if (!obja) {
                    tuplas.push(new Tupla(path, obja.toString(), "Date", 'Deleted'));
                } else {
                    if (objb != obja) {
                        if (typeof obja === "number") {
                            tuplas.push(new Tupla(path, obja.toString(), "number", 'Modified'));
                        } else if (typeof obja === "string") {
                            tuplas.push(new Tupla(path, obja, "string", 'Modified'));
                        } else if (typeof obja === "boolean") {
                            tuplas.push(new Tupla(path, obja.toString(), "boolean", 'Modified'));
                        } else if (typeof obja === "object") {
                            tuplas.push(new Tupla(path, obja, "object", 'Modified'));
                        }
                    }
                }
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
                    else if (obja instanceof Array) {
                        tuplas.push(new Tupla(path, obja, "Array", "Modified"));
                    }
                    else if (typeof obja === "object") {
                        tuplas.push(new Tupla(path, obja, "object", "Modified"));
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
                    else if (obja instanceof Array) {
                        tuplas.push(new Tupla(path, obja, "Array", "Modified"));
                    }
                    else if (typeof obja === "object") {
                        tuplas.push(new Tupla(path, obja, "object", "Modified"));
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
                    else if (obja instanceof Array) {
                        tuplas.push(new Tupla(path, obja, "Array", "Modified"));
                    }
                    else if (typeof obja === "object") {
                        tuplas.push(new Tupla(path, obja, "object", "Modified"));
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
            if (objb instanceof Array) {
                for (let i = 0; i < obja.length; ++i) {
                    if (i >= objb.length) {
                        if (typeof obja[i] === "number") tuplas.push(new Tupla(path + '[' + i + ']', obja[i].toString(), "number", 'Added'));
                        else if (typeof obja[i] === "string") tuplas.push(new Tupla(path + '[' + i + ']', obja[i], "string", "Added"));
                        else if (obja[i] instanceof Array) {
                            tuplas.push(new Tupla(path + '[' + i + ']', obja[i], "Array", 'Added'));
                        }
                        else if (typeof obja[i] === "boolean") {
                            tuplas.push(new Tupla(path + '[' + i + ']', obja[i].toString(), "boolean", 'Added'));
                        }
                        else if (typeof obja[i] === "object") {
                            tuplas.push(new Tupla(path + '[' + i + ']', obja[i], "object", "Added"));
                        }
                    }
                    else {
                        if (obja[i] != objb[i]) {
                            if (path != "") tuplas = this.checkaftbef(objb[i], obja[i], path + '[' + i + ']', tuplas);
                        }
                    }
                }
            }
        }
        else if (typeof obja === "object") {
            if (obja instanceof Date) {
                if (!objb) {
                    tuplas.push(new Tupla(path, obja.toString(), "Date", 'Added'));
                }
            }
            else {
                if (typeof objb === "object") {
                    for (let x in obja) {
                        if (!objb[x]) {
                            if (path != "") {
                                tuplas = this.checkaftbef("", obja[x], path + '.' + x, tuplas);
                            }
                            else {
                                tuplas = this.checkaftbef("", obja[x], x, tuplas);
                            }
                        }
                        else if (obja[x] != objb[x]) {
                            if (path != "") {
                                tuplas = this.checkaftbef(objb[x], obja[x], path + '.' + x, tuplas);
                            }
                            else {
                                tuplas = this.checkaftbef(objb[x], obja[x], x, tuplas);
                            }
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
            else if (obja instanceof Array) {
                tuplas.push(new Tupla(path, obja, "Array", "Added"));
            }
            else if (typeof obja === "object") {
                tuplas.push(new Tupla(path, obja, "Object", "Added"));
            }
        }

        return tuplas;
    }

    public compare2JSONpath(): Tupla[] {
        let tuplas3: Tupla[] = [];       

        tuplas3 = this.checkbefaft(example21, example22, "", []);
        tuplas3 = this.checkaftbef(example21, example22, "", tuplas3);

        return tuplas3;
    }

}

const marshall = new Marshall(new Array<Tupla>());

const marshalled2 = marshall.marshall(example1, "", []);

console.log(marshalled2);

const resultObj = marshall.unMarshall(marshalled2);

console.log(resultObj);

const result = marshall.compare2JSONpath();

console.log(result);