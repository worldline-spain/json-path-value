export class JsonPathPair {

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

export class JsonPath {

    
    public readonly DIFF_MODIFIED = "Modified";
    public readonly DIFF_ADDED = "Added";
    public readonly DIFF_DELETED = "Deleted";
    
    constructor() { }

    public marshall(obj: any, path: string, JsonPathPairs: JsonPathPair[]): JsonPathPair[] {
        if (obj instanceof Array) {
            for (let i = 0; i < obj.length; ++i) {
                if (typeof obj[i] === "string") JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obj[i].toString(), "string", ""));
                else if (typeof obj[i] === "number") JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obj[i].toString(), "number", ""));
                else if (typeof obj[i] === "boolean") JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obj[i].toString(), "boolean", ""));
                else if (typeof obj[i] === "object") {
                    JsonPathPairs = this.marshall(obj[i], path + '[' + i + ']', JsonPathPairs);
                }
            }
        }
        else if (typeof obj === "object") {
            if (obj instanceof Date) {
                JsonPathPairs.push(new JsonPathPair(path, obj.toString(), "Date", ""));
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
            if (typeof obj === "number") {
                JsonPathPairs.push(new JsonPathPair(path, obj.toString(), "number", ""));
            }
            else if (typeof obj === "string") {
                JsonPathPairs.push(new JsonPathPair(path, obj, "string", ""));
            }
            else if (typeof obj === "boolean") {
                JsonPathPairs.push(new JsonPathPair(path, obj.toString(), "boolean", ""));
            }
        }
        return JsonPathPairs;
    }

    public unMarshall(JsonPathPairs: JsonPathPair[]): any {
        let json = {};
        for (let i = 0; i < JsonPathPairs.length; ++i) {
            var splitted = (JsonPathPairs[i].getPath()).split('.');
            json = this.doJsonRecursivity(splitted, json, 0, i, JsonPathPairs);
        }
        return json;
    }

    public compareJsonPath(before: any, after: any): JsonPathPair[] {
        let JsonPathPairs3: JsonPathPair[] = [];

        JsonPathPairs3 = this.checkbefaft(before, after, "", []);
        JsonPathPairs3 = this.checkaftbef(before, after, "", JsonPathPairs3);

        return JsonPathPairs3;
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
            if (JsonPathPairs[index_JsonPathPairs].getType() == "string" && JsonPathPairs[index_JsonPathPairs].getValue() != "") json[jsonpath[position]] = JsonPathPairs[index_JsonPathPairs].getValue();
            else if (JsonPathPairs[index_JsonPathPairs].getType() == "number") json[jsonpath[position]] = parseInt(JsonPathPairs[index_JsonPathPairs].getValue(), 10);
            else if (JsonPathPairs[index_JsonPathPairs].getType() == "boolean") json[jsonpath[position]] = (JsonPathPairs[index_JsonPathPairs].getValue() == "true");
            else if (JsonPathPairs[index_JsonPathPairs].getType() == "Date") json[jsonpath[position]] = new Date(JsonPathPairs[index_JsonPathPairs].getValue());
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
                if (JsonPathPairs[index_JsonPathPairs].getType() == "string") json[attr[0]].push(JsonPathPairs[index_JsonPathPairs].getValue());
                else if (JsonPathPairs[index_JsonPathPairs].getType() == "number") json[attr[0]].push(parseInt(JsonPathPairs[index_JsonPathPairs].getValue(), 10));
                else if (JsonPathPairs[index_JsonPathPairs].getType() == "boolean") json[attr[0]].push((JsonPathPairs[index_JsonPathPairs].getValue() == "true"));
                else if (JsonPathPairs[index_JsonPathPairs].getType() == "Date") json[attr[0]].push(new Date(JsonPathPairs[index_JsonPathPairs].getValue()));
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
                if (JsonPathPairs[index_JsonPathPairs].getType() == "string") json[attr[0]].push(JsonPathPairs[index_JsonPathPairs].getValue());
                else if (JsonPathPairs[index_JsonPathPairs].getType() == "number") json[attr[0]].push(parseInt(JsonPathPairs[index_JsonPathPairs].getValue(), 10));
                else if (JsonPathPairs[index_JsonPathPairs].getType() == "boolean") json[attr[0]].push((JsonPathPairs[index_JsonPathPairs].getValue() == "true"));
                else if (JsonPathPairs[index_JsonPathPairs].getType() == "Date") json[attr[0]].push(new Date(JsonPathPairs[index_JsonPathPairs].getValue()));
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




    private checkbefaft(objb: any, obja: any, path: string, JsonPathPairs: JsonPathPair[]): JsonPathPair[] {
        if (objb instanceof Array) {
            if (obja instanceof Array) {
                for (let i = 0; i < objb.length; ++i) {
                    if (i < obja.length) JsonPathPairs = this.checkbefaft(objb[i], obja[i], path + '[' + i + ']', JsonPathPairs);
                    else {
                        if (typeof objb[i] === "number") JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', objb[i].toString(), "number", 'Deleted'));
                        else if (typeof objb[i] === "string") JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', objb[i], "string", "Deleted"));
                        else if (objb[i] instanceof Array) {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', objb[i], "Array", "Deleted"));
                        }
                        else if (typeof objb[i] === "object") {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', objb[i], "Object", "Deleted"));
                        } else if (typeof obja === "boolean") {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', objb[i].toString(), "boolean", 'Deleted'));
                        }
                    }
                }
            }
            else {
                if (typeof obja === "number") {
                    JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "number", 'Modified'));
                } else if (typeof obja === "string") {
                    JsonPathPairs.push(new JsonPathPair(path, obja, "string", 'Modified'));
                } else if (typeof obja === "boolean") {
                    JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "boolean", 'Modified'));
                } else if (typeof obja === "object") {
                    JsonPathPairs.push(new JsonPathPair(path, obja, "object", 'Modified'));
                }
            }
        }
        else if (typeof objb === "object") {
            if (objb instanceof Date) {
                if (!obja) {
                    JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "Date", 'Deleted'));
                } else {
                    if (objb != obja) {
                        if (typeof obja === "number") {
                            JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "number", 'Modified'));
                        } else if (typeof obja === "string") {
                            JsonPathPairs.push(new JsonPathPair(path, obja, "string", 'Modified'));
                        } else if (typeof obja === "boolean") {
                            JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "boolean", 'Modified'));
                        } else if (typeof obja === "object") {
                            JsonPathPairs.push(new JsonPathPair(path, obja, "object", 'Modified'));
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
            if (typeof objb === "number") {
                if (obja && objb != obja) {
                    if (typeof obja === "number") JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "number", 'Modified'));
                    else if (typeof obja === "string") JsonPathPairs.push(new JsonPathPair(path, obja, "string", "Modified"));
                    else if (obja instanceof Array) {
                        JsonPathPairs.push(new JsonPathPair(path, obja, "Array", "Modified"));
                    }
                    else if (typeof obja === "object") {
                        JsonPathPairs.push(new JsonPathPair(path, obja, "object", "Modified"));
                    } else if (typeof obja === "boolean") {
                        JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "boolean", 'Modified'));
                    }
                }
                else if (!obja) {
                    JsonPathPairs.push(new JsonPathPair(path, objb.toString(), "number", 'Deleted'));
                }
            }
            else if (typeof objb === "string") {
                if (obja && objb != obja) {
                    if (typeof obja === "number") JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "number", 'Modified'));
                    else if (typeof obja === "string") JsonPathPairs.push(new JsonPathPair(path, obja, "string", "Modified"));
                    else if (obja instanceof Array) {
                        JsonPathPairs.push(new JsonPathPair(path, obja, "Array", "Modified"));
                    }
                    else if (typeof obja === "object") {
                        JsonPathPairs.push(new JsonPathPair(path, obja, "object", "Modified"));
                    } else if (typeof obja === "boolean") {
                        JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "boolean", 'Modified'));
                    }
                }
                else if (!obja) {
                    JsonPathPairs.push(new JsonPathPair(path, objb, "string", 'Deleted'));
                }
            }
            else if (typeof objb === "boolean") {
                if (obja && objb != obja) {
                    if (typeof obja === "number") JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "number", 'Modified'));
                    else if (typeof obja === "string") JsonPathPairs.push(new JsonPathPair(path, obja, "string", "Modified"));
                    else if (obja instanceof Array) {
                        JsonPathPairs.push(new JsonPathPair(path, obja, "Array", "Modified"));
                    }
                    else if (typeof obja === "object") {
                        JsonPathPairs.push(new JsonPathPair(path, obja, "object", "Modified"));
                    } else if (typeof obja === "boolean") {
                        JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "boolean", 'Modified'));
                    }
                }
                else if (!obja) {
                    JsonPathPairs.push(new JsonPathPair(path, objb.toString(), "boolean", 'Deleted'));
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
                        if (typeof obja[i] === "number") JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i].toString(), "number", 'Added'));
                        else if (typeof obja[i] === "string") JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i], "string", "Added"));
                        else if (obja[i] instanceof Array) {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i], "Array", 'Added'));
                        }
                        else if (typeof obja[i] === "boolean") {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i].toString(), "boolean", 'Added'));
                        }
                        else if (typeof obja[i] === "object") {
                            JsonPathPairs.push(new JsonPathPair(path + '[' + i + ']', obja[i], "object", "Added"));
                        }
                    }
                    else {
                        if (obja[i] != objb[i]) {
                            if (path != "") JsonPathPairs = this.checkaftbef(objb[i], obja[i], path + '[' + i + ']', JsonPathPairs);
                        }
                    }
                }
            }
        }
        else if (typeof obja === "object") {
            if (obja instanceof Date) {
                if (!objb) {
                    JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "Date", 'Added'));
                }
            }
            else {
                if (typeof objb === "object") {
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
            }
        }
        else {
            if (typeof obja === "number") {
                if (!objb) {
                    JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "number", 'Added'));
                }
            }
            else if (typeof obja === "string") {
                if (!objb) {
                    JsonPathPairs.push(new JsonPathPair(path, obja, "string", 'Added'));
                }
            }
            else if (typeof obja === "boolean") {
                if (!objb) {
                    JsonPathPairs.push(new JsonPathPair(path, obja.toString(), "boolean", 'Added'));
                }
            }
            else if (obja instanceof Array) {
                JsonPathPairs.push(new JsonPathPair(path, obja, "Array", "Added"));
            }
            else if (typeof obja === "object") {
                JsonPathPairs.push(new JsonPathPair(path, obja, "Object", "Added"));
            }
        }

        return JsonPathPairs;
    }



}