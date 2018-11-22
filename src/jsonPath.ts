export class JsonPathPair {

    public constructor(private path: string, private value: any, private type: string, private diff: number) { }

    public getPath(): string {
        return this.path;
    }

    public getValue(): any {
        return this.value;
    }

    public getType(): string {
        return this.type;
    }

    public getDiff(diff: number) {
        return this.diff;
    }

}

export class JsonPath {

    public readonly DIFF_MODIFIED = 2;
    public readonly DIFF_ADDED = 0;
    public readonly DIFF_DELETED = 1;

    public readonly TYPE_STRING = "string";
    public readonly TYPE_NUMBER = "number";
    public readonly TYPE_BOOLEAN = "boolean";
    public readonly TYPE_OBJECT = "object";
    public readonly TYPE_DATE = "Date";
    public readonly TYPE_ARRAY = "Array";

    constructor() { }

    public marshall(obj: any, path: string, JsonPathPairs: JsonPathPair[]): JsonPathPair[] {
        if (obj instanceof Array) {
            for (let i = 0; i < obj.length; ++i) {
                if (typeof obj[i] === this.TYPE_STRING) JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obj[i].toString(), this.TYPE_STRING, ""));
                else if (typeof obj[i] === this.TYPE_NUMBER) JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obj[i].toString(), this.TYPE_NUMBER, ""));
                else if (typeof obj[i] === this.TYPE_BOOLEAN) JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obj[i].toString(), this.TYPE_BOOLEAN, ""));
                else if (typeof obj[i] === this.TYPE_OBJECT) {
                    JsonPathPairs = this.marshall(obj[i], path + '[' + i + ']', JsonPathPairs);
                }
            }
        }
        else if (typeof obj === this.TYPE_OBJECT) {
            if (obj instanceof Date) {
                JsonPathPairs.push(new JsonPathPair(path, obj.toString(), this.TYPE_DATE, ""));
            }
            else {
                for (let x in obj) {
                    if (x != "") {
                        if (path != "") JsonPathPairs = this.marshall(obj[x], path + '.' + x, JsonPathPairs);
                        else
                            JsonPathPairs = this.marshall(obj[x], x, JsonPathPairs);
                    }
                }
            }
        }
        else {
            if (typeof obj === this.TYPE_NUMBER) {
                JsonPathPairs.push(new JsonPathPair(path, obj.toString(), this.TYPE_NUMBER, ""));
            }
            else if (typeof obj === this.TYPE_STRING) {
                JsonPathPairs.push(new JsonPathPair(path, obj, this.TYPE_STRING, ""));
            }
            else if (typeof obj === this.TYPE_BOOLEAN) {
                JsonPathPairs.push(new JsonPathPair(path, obj.toString(), this.TYPE_BOOLEAN, ""));
            }
        }
        return JsonPathPairs;
    }

    public unMarshall(JsonPathPairs: JsonPathPair[]): any {
        let json = {};
        for (let i = 0; i < JsonPathPairs.length; ++i) {
            if (JsonPathPairs[i].getPath() != '') {
                var splitted = (JsonPathPairs[i].getPath()).split('.');
                json = this.doJsonRecursivity(splitted, json, 0, i, JsonPathPairs);
            }
        }
        return json;
    }

    private doArrayRecursivity(json: any, attr: string[], pos: number, JsonPathPairs: JsonPathPair[], index_JsonPathPairs: number): any {
        if (pos < attr.length) {
            if (!json[attr[pos - 1]]) json.push([]);
            if (pos == attr.length - 1) {
                json[attr[pos - 1]].push(JsonPathPairs[index_JsonPathPairs].getValue());
            }
            else {
                json[attr[pos - 1]] = this.doArrayRecursivity(json[attr[pos - 1]], attr, pos + 1, JsonPathPairs, index_JsonPathPairs);
            }
        }
        return json;
    }

    private doArrayAndObjectRecursivity(json: any, jsonpath: any[], posjsonpath: number, attr: any[], pos: number, JsonPathPairs: JsonPathPair[], index_JsonPathPairs: number): any {
        if (pos <= attr.length && posjsonpath != jsonpath.length - 1) {
            if (pos == attr.length - 1) {
                if (!json[attr[pos - 1]][attr[pos]]) json[attr[pos - 1]].push({});
                var attr2 = [];
                if (jsonpath[posjsonpath + 1].includes('[')) {
                    attr2 = jsonpath[posjsonpath + 1].split('[');
                    for (let i = 1; i < attr2.length; ++i) {
                        attr2[i] = parseInt(attr2[i].substring(0, attr2[i].length - 1));
                    }
                    json[attr[pos - 1]][attr[pos]] = this.doArrayAndObjectRecursivity(json[attr[pos - 1]][attr[pos]], jsonpath, posjsonpath + 1, attr2, 0, JsonPathPairs, index_JsonPathPairs);
                }
            }
            else {
                json[attr[pos - 1]] = this.doArrayAndObjectRecursivity(json[attr[pos - 1]], jsonpath, posjsonpath, attr, pos + 1, JsonPathPairs, index_JsonPathPairs);
            }
        }
        else if (pos <= attr.length && posjsonpath == jsonpath.length - 1) {
            if (!json[attr[pos]]) {
                if (attr && pos != attr.length - 1) {
                    json[attr[pos]] = [];
                    json[attr[pos]] = this.doArrayAndObjectRecursivity(json[attr[0]], jsonpath, posjsonpath, attr, pos + 1, JsonPathPairs, index_JsonPathPairs);
                }
                else if (attr && pos == attr.length - 1) {
                    json.push(JsonPathPairs[index_JsonPathPairs].getValue());
                }
            }
        }
        return json;
    }

    private doJsonRecursivity(jsonpath: any[], json: any, position: number, index_JsonPathPairs: number, JsonPathPairs: JsonPathPair[]): any {
        var attr;
        if (jsonpath[position].includes('[')) {
            attr = jsonpath[position].split('[');
            for (let i = 1; i < attr.length; ++i) {
                attr[i] = parseInt(attr[i].substring(0, attr[i].length - 1));
            }
        }
        if (!attr && position == jsonpath.length - 1 && !json[jsonpath[position]]) {
            if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_STRING && JsonPathPairs[index_JsonPathPairs].getValue() != "") json[jsonpath[position]] = JsonPathPairs[index_JsonPathPairs].getValue();
            else if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_NUMBER) json[jsonpath[position]] = parseInt(JsonPathPairs[index_JsonPathPairs].getValue(), 10);
            else if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_BOOLEAN) json[jsonpath[position]] = (JsonPathPairs[index_JsonPathPairs].getValue() == "true");
            else if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_DATE) json[jsonpath[position]] = new Date(JsonPathPairs[index_JsonPathPairs].getValue());
            else {
                json[jsonpath[position]] = JsonPathPairs[index_JsonPathPairs].getValue();
            }
        }
        else if (!attr && position != jsonpath.length - 1 && !json[jsonpath[position]]) {
            json[jsonpath[position]] = {};
            json[jsonpath[position]] = this.doJsonRecursivity(jsonpath, json[jsonpath[position]], position + 1, index_JsonPathPairs, JsonPathPairs);
        }
        else if (!attr && position != jsonpath.length - 1 && json[jsonpath[position]]) {
            json[jsonpath[position]] = this.doJsonRecursivity(jsonpath, json[jsonpath[position]], position + 1, index_JsonPathPairs, JsonPathPairs);
        }
        else if (attr && position == jsonpath.length - 1 && !json[attr[0]]) {
            json[attr[0]] = [];
            if (attr.length > 2) {

                json[attr[0]] = this.doArrayRecursivity(json[attr[0]], attr, 2, JsonPathPairs, index_JsonPathPairs);

            } else {
                if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_STRING) json[attr[0]].push(JsonPathPairs[index_JsonPathPairs].getValue());
                else if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_NUMBER) json[attr[0]].push(parseInt(JsonPathPairs[index_JsonPathPairs].getValue(), 10));
                else if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_BOOLEAN) json[attr[0]].push((JsonPathPairs[index_JsonPathPairs].getValue() == "true"));
                else if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_DATE) json[attr[0]].push(new Date(JsonPathPairs[index_JsonPathPairs].getValue()));
                else {
                    json[attr[0]].push(JsonPathPairs[index_JsonPathPairs].getValue());
                }
            }
        }
        else if (attr && position != jsonpath.length - 1 && !json[attr[0]]) {
            json[attr[0]] = [];
            json[attr[0]].push({});
            json[attr[0]][attr[1]] = this.doJsonRecursivity(jsonpath, json[attr[0]][attr[1]], position + 1, index_JsonPathPairs, JsonPathPairs);
        }
        else if (attr && position == jsonpath.length - 1 && json[attr[0]]) {

            if (attr.length > 2) {
                json[attr[0]] = this.doArrayRecursivity(json[attr[0]], attr, 2, JsonPathPairs, index_JsonPathPairs);
            }
            else {
                if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_STRING) json[attr[0]].push(JsonPathPairs[index_JsonPathPairs].getValue());
                else if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_NUMBER) json[attr[0]].push(parseInt(JsonPathPairs[index_JsonPathPairs].getValue(), 10));
                else if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_BOOLEAN) json[attr[0]].push((JsonPathPairs[index_JsonPathPairs].getValue() == "true"));
                else if (JsonPathPairs[index_JsonPathPairs].getType() == this.TYPE_DATE) json[attr[0]].push(new Date(JsonPathPairs[index_JsonPathPairs].getValue()));
            }
        }
        else if (attr && position != jsonpath.length - 1 && json[attr[0]] && !json[attr[0]][attr[1]]) {
            json[attr[0]].push({});
            json[attr[0]][attr[1]] = this.doJsonRecursivity(jsonpath, json[attr[0]][attr[1]], position + 1, index_JsonPathPairs, JsonPathPairs);
        }
        else if (attr && position != jsonpath.length - 1 && json[attr[0]] && json[attr[0]][attr[1]]) {
            if (attr.length > 2) {
                json[attr[0]][attr[1]] = this.doArrayAndObjectRecursivity(json[attr[0]][attr[1]], jsonpath, position, attr, 3, JsonPathPairs, index_JsonPathPairs);
            } else {
                json[attr[0]][attr[1]] = this.doJsonRecursivity(jsonpath, json[attr[0]][attr[1]], position + 1, index_JsonPathPairs, JsonPathPairs);
            }
        }
        return json;
    }


    public compareJsonPath(before: any, after: any): JsonPathPair[] {
        let JsonPathPairs3: JsonPathPair[] = [];

        JsonPathPairs3 = this.checkbefaft(before, after, "", []);
        JsonPathPairs3 = this.checkaftbef(before, after, "", JsonPathPairs3);

        return JsonPathPairs3;
    }

    private checkbefaft(objb: any, obja: any, path: string, JsonPathPairs: JsonPathPair[]): JsonPathPair[] {
        if (objb instanceof Array) {
            if (obja instanceof Array) {
                for (let i = 0; i < objb.length; ++i) {
                    if (i < obja.length) JsonPathPairs = this.checkbefaft(objb[i], obja[i], path + '[' + i + ']', JsonPathPairs);
                    else {
                        if (typeof objb[i] === this.TYPE_NUMBER) JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', objb[i].toString(), this.TYPE_NUMBER, this.DIFF_DELETED));
                        else if (typeof objb[i] === this.TYPE_STRING) JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', objb[i], this.TYPE_STRING, this.DIFF_DELETED));
                        else if (objb[i] instanceof Array) {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', objb[i], this.TYPE_ARRAY, this.DIFF_DELETED));
                        }
                        else if (typeof objb[i] === this.TYPE_OBJECT) {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', objb[i], this.TYPE_OBJECT, this.DIFF_DELETED));
                        } else if (typeof obja === this.TYPE_BOOLEAN) {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', objb[i].toString(), this.TYPE_BOOLEAN, this.DIFF_DELETED));
                        }
                    }
                }
            }
            else {
                for (let i = 0; i < objb.length; ++i) {
                    this.checkbefaft(objb[i], '', path + '[' + i + ']', JsonPathPairs);
                }
            }
        }
        else if (typeof objb === this.TYPE_OBJECT) {
            if (objb instanceof Date) {
                if (!obja) {
                    JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_DATE, this.DIFF_DELETED));
                } else {
                    if (objb != obja) {
                        if (typeof obja === this.TYPE_NUMBER) {
                            JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_NUMBER, this.DIFF_MODIFIED));
                        } else if (typeof obja === this.TYPE_STRING) {
                            JsonPathPairs.push(new JsonPathPair(path, obja, this.TYPE_STRING, this.DIFF_MODIFIED));
                        } else if (typeof obja === this.TYPE_BOOLEAN) {
                            JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_BOOLEAN, this.DIFF_MODIFIED));
                        } else if (typeof obja === this.TYPE_OBJECT) {
                            JsonPathPairs.push(new JsonPathPair(path, obja, this.TYPE_OBJECT, this.DIFF_MODIFIED));
                        }
                    }
                }
            }
            else {
                for (let x in objb) {
                    if (!obja[x]) {
                        if (path != "") JsonPathPairs = this.checkbefaft(objb[x], '', path + '.' + x, JsonPathPairs);
                        else {
                            JsonPathPairs = this.checkbefaft(objb[x], '', x, JsonPathPairs);
                        }
                    }
                    else if (obja[x] != objb[x]) {
                        if (path != "") JsonPathPairs = this.checkbefaft(objb[x], obja[x], path + '.' + x, JsonPathPairs);
                        else {
                            JsonPathPairs = this.checkbefaft(objb[x], obja[x], x, JsonPathPairs);
                        }
                    }
                }
            }
        }
        else {
            if (typeof objb === this.TYPE_NUMBER) {
                if (obja && objb != obja) {
                    if (typeof obja === this.TYPE_NUMBER) JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_NUMBER, this.DIFF_MODIFIED));
                    else if (typeof obja === this.TYPE_STRING) JsonPathPairs.push(new JsonPathPair(path, obja, this.TYPE_STRING, this.DIFF_MODIFIED));
                    else if (obja instanceof Array) {
                        JsonPathPairs.push(new JsonPathPair(path, objb.toString(), this.TYPE_NUMBER, this.DIFF_DELETED));
                    }
                    else if (typeof obja === this.TYPE_OBJECT) {
                        JsonPathPairs.push(new JsonPathPair(path, objb, this.TYPE_NUMBER, this.DIFF_DELETED));
                    } else if (typeof obja === this.TYPE_BOOLEAN) {
                        JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_BOOLEAN, this.DIFF_MODIFIED));
                    }
                }
                else if (!obja || obja == '' ) {
                    JsonPathPairs.push(new JsonPathPair(path, objb.toString(), this.TYPE_NUMBER, this.DIFF_DELETED));
                }
            }
            else if (typeof objb === this.TYPE_STRING) {
                if (obja && objb != obja) {
                    if (typeof obja === this.TYPE_NUMBER) JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_NUMBER, this.DIFF_MODIFIED));
                    else if (typeof obja === this.TYPE_STRING) JsonPathPairs.push(new JsonPathPair(path, obja, this.TYPE_STRING, this.DIFF_MODIFIED));
                    else if (obja instanceof Array) {
                        JsonPathPairs.push(new JsonPathPair(path, objb, this.TYPE_STRING, this.DIFF_DELETED));
                    }
                    else if (typeof obja === this.TYPE_OBJECT) {
                        JsonPathPairs.push(new JsonPathPair(path, objb, this.TYPE_STRING, this.DIFF_DELETED));
                    } else if (typeof obja === this.TYPE_BOOLEAN) {
                        JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_BOOLEAN, this.DIFF_MODIFIED));
                    }
                }
                else if (!obja || obja == '') {
                    JsonPathPairs.push(new JsonPathPair(path, objb, this.TYPE_STRING, this.DIFF_DELETED));
                }
            }
            else if (typeof objb === this.TYPE_BOOLEAN) {
                if (obja && objb != obja) {
                    if (typeof obja === this.TYPE_NUMBER) JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_NUMBER, this.DIFF_MODIFIED));
                    else if (typeof obja === this.TYPE_STRING) JsonPathPairs.push(new JsonPathPair(path, obja, this.TYPE_STRING, this.DIFF_MODIFIED));
                    else if (obja instanceof Array) {
                        JsonPathPairs.push(new JsonPathPair(path, objb.toString(), this.TYPE_BOOLEAN, this.DIFF_DELETED));
                    }
                    else if (typeof obja === this.TYPE_OBJECT) {
                        JsonPathPairs.push(new JsonPathPair(path, objb, this.TYPE_BOOLEAN, this.DIFF_DELETED));
                    } else if (typeof obja === this.TYPE_BOOLEAN) {
                        JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_BOOLEAN, this.DIFF_MODIFIED));
                    }
                }
                else if (!obja || obja == '') {
                    JsonPathPairs.push(new JsonPathPair(path, objb.toString(), this.TYPE_BOOLEAN, this.DIFF_DELETED));
                }
            }
        }
        return JsonPathPairs;
    }

    private checkaftbef(objb: any, obja: any, path: string, JsonPathPairs: JsonPathPair[]): JsonPathPair[] {
        if (obja instanceof Array) {
            if (objb instanceof Array) {
                for (let i = 0; i < obja.length; ++i) {
                    if (i >= objb.length) {
                        if (typeof obja[i] === this.TYPE_NUMBER) JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i].toString(), this.TYPE_NUMBER, this.DIFF_ADDED));
                        else if (typeof obja[i] === this.TYPE_STRING) JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i], this.TYPE_STRING, this.DIFF_ADDED));
                        else if (obja[i] instanceof Array) {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i], this.TYPE_ARRAY, this.DIFF_ADDED));
                        }
                        else if (typeof obja[i] === this.TYPE_BOOLEAN) {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i].toString(), this.TYPE_BOOLEAN, this.DIFF_ADDED));
                        }
                        else if (typeof obja[i] === this.TYPE_OBJECT) {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i], this.TYPE_OBJECT, this.DIFF_ADDED));
                        }
                    }
                    else {
                        if (obja[i] != objb[i]) {
                            if (path != "") JsonPathPairs = this.checkaftbef(objb[i], obja[i], path + '[' + i + ']', JsonPathPairs);
                        }
                    }
                }
            }
            else {
                for (let i = 0; i < obja.length; ++i) {
                    if (typeof obja[i] === this.TYPE_NUMBER) JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i].toString(), this.TYPE_NUMBER, this.DIFF_ADDED));
                    else if (typeof obja[i] === this.TYPE_STRING) JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i], this.TYPE_STRING, this.DIFF_ADDED));
                    else if (obja[i] instanceof Array) {
                        this.checkaftbef('', obja[i], path + '[' + i + ']', JsonPathPairs);
                    }
                    else if (typeof obja[i] === this.TYPE_BOOLEAN) {
                        JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i].toString(), this.TYPE_BOOLEAN, this.DIFF_ADDED));
                    }
                    else if (typeof obja[i] === this.TYPE_OBJECT) {
                        this.checkaftbef('', obja[i], path + '[' + i + ']', JsonPathPairs);
                    }
                }
            }
        }
        else if (typeof obja === this.TYPE_OBJECT) {
            if (obja instanceof Date) {
                if (!objb) {
                    JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_DATE, this.DIFF_ADDED));
                }
            }
            else {
                if (typeof objb === this.TYPE_OBJECT) {
                    for (let x in obja) {
                        if (!objb[x]) {
                            if (path != "") {
                                JsonPathPairs = this.checkaftbef("", obja[x], path + '.' + x, JsonPathPairs);
                            }
                            else {
                                JsonPathPairs = this.checkaftbef("", obja[x], x, JsonPathPairs);
                            }
                        }
                        else if (obja[x] != objb[x]) {
                            if (path != "") {
                                JsonPathPairs = this.checkaftbef(objb[x], obja[x], path + '.' + x, JsonPathPairs);
                            }
                            else {
                                JsonPathPairs = this.checkaftbef(objb[x], obja[x], x, JsonPathPairs);
                            }
                        }
                    }
                }
                else {
                    for (let x in obja) {
                        if (typeof obja[x] === this.TYPE_NUMBER) JsonPathPairs.push(new JsonPathPair(path + '.' + x, obja[x].toString(), this.TYPE_NUMBER, this.DIFF_ADDED));
                        else if (typeof obja[x] === this.TYPE_STRING) JsonPathPairs.push(new JsonPathPair(path + '.' + x, obja[x], this.TYPE_STRING, this.DIFF_ADDED));
                        else if (obja[x] instanceof Array) {
                            this.checkaftbef("", obja[x], path + '.' + x, JsonPathPairs);
                        }
                        else if (typeof obja[x] === this.TYPE_BOOLEAN) {
                            JsonPathPairs.push(new JsonPathPair(path + '.' + x, obja[x].toString(), this.TYPE_BOOLEAN, this.DIFF_ADDED));
                        }
                        else if (typeof obja[x] === this.TYPE_OBJECT) {
                            this.checkaftbef("", obja[x], path + '.' + x, JsonPathPairs);
                        }
                    }
                }
            }
        }
        else {
            if (typeof obja === this.TYPE_NUMBER) {
                if (!objb || objb instanceof Array) {
                    JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_NUMBER, this.DIFF_ADDED));
                }
            }
            else if (typeof obja === this.TYPE_STRING) {
                if (!objb || objb instanceof Array) {
                    JsonPathPairs.push(new JsonPathPair(path, obja, this.TYPE_STRING, this.DIFF_ADDED));
                }
            }
            else if (typeof obja === this.TYPE_BOOLEAN) {
                if (!objb || objb instanceof Array) {
                    JsonPathPairs.push(new JsonPathPair(path, obja.toString(), this.TYPE_BOOLEAN, this.DIFF_ADDED));
                }
            }
        }

        return JsonPathPairs;
    }



}