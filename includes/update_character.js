var params = require('./config_module.js');
var Marvel = require('marvel')
var marvel = new Marvel({ publicKey: "52b6305c2146fd0f86ae99c9878fcdc2", privateKey: "984ca2beeedd0fa2b81f7e22b7d7e29d5b632c8f" });
var qs = require('querystring'), url = require('url');
var modelNameCharacter = 'tbl_character';
exports.execute_insert_news = function (req, res, mongoose, CharacterSchema, md5) {
    var Character = mongoose.model(modelNameCharacter, CharacterSchema);
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        //for (var i = 0; i < 1500; i+100) {
        try {
            data = url.parse(req.url, true).query;
            var offset = data['offset'];
            if (offset == undefined) {
                offset = 0;
            }
            query(marvel, parseInt(offset));
            /*query(marvel, 100);
            query(marvel, 200);
            query(marvel, 300);
            query(marvel, 400);
            query(marvel, 500);
            query(marvel, 600);
            query(marvel, 700);
            query(marvel, 800);
            query(marvel, 900);
            query(marvel, 1000);
            query(marvel, 1100);
            query(marvel, 1200);
            query(marvel, 1300);
            query(marvel, 1400);
            query(marvel, 1500);*/

        } catch (err) {
            console.log(err);
        }
    });
    //}
    function query(marvel, pag) {
        var api = require('marvel-comics-api')
        try {
            api('characters', {
                publicKey: '52b6305c2146fd0f86ae99c9878fcdc2',
                privateKey: '984ca2beeedd0fa2b81f7e22b7d7e29d5b632c8f',
                query: {
                    limit: 100,
                    offset: pag
                }
            }, function (err, body) {
                if (err) {
                    console.error(err);
                }
                if (body != undefined && body.data != undefined && body.data.total != undefined && body.data.results != undefined) {
                    // total # of items 
                    console.log(body.data.total);

                    // array of characters 
                    //console.log(body.data.results);
                    processData(body.data.results);
                } else {
                    console.error('ERROR AL OBTENER UPDATE_CHARACTER LIMIT: 100 | OFFSET: ' + pag);
                }

            });
        } catch (err) {

        }
        // fetch 50 Marvel characters 

        /*try {
           marvel.characters
          .limit(offset, 100)
          .get(function (err, resp) {
                    if (err) {
                        console.log("Error: ", err);
                        return false;
                    }
                    else {
                    
                        processData(resp);
                        return true;
                    }
                });
        } catch (err) { 
            console.log(err);
        }*/

    }
    function processData(resp) {
        var jsonString = JSON.parse(JSON.stringify(resp));
        for (var j in jsonString) {
            try {
                var id = jsonString[j]['id'];
                var name = jsonString[j]['name'];
                var description = jsonString[j]['description'];
                var modified = jsonString[j]['modified'];
                var thumbnail = jsonString[j]['thumbnail']['path'] + '.' + jsonString[j]['thumbnail']['extension'];
                var detail = jsonString[j]['urls'];
                insertData(mongoose, md5, id, name, description, modified, thumbnail, detail);
            } catch (err) {
                console.error(err);
            }
        }
        return true;
    }
    function insertData(mongoose, md5, id, name, description, modified, thumbnail, detail) {
        var keyID = id + name;
        var tag = name.toLowerCase();
        Character.update({
            '_id': params.generateID(keyID, mongoose, md5).toString()
        }, {
                'name': name,
                'description': description,
                'modified': modified,
                'thumbnail': thumbnail,
                'detail': detail,
                'tag': tag
            }, {
                upsert: true
            }, function (err, numberAffected, raw) {
                if (err)
                    console.log("ERROR -> " + err);
            }
        );
        return true;
    }

    res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
    res.end('{}');
};
exports.get_character = function (req, res, zlib, cache_time, cache, mongoose, CharacterSchema, md5) {

    var qs = require('querystring'), url = require('url'); //file system module if it's needed
    var body = '';
    var _cachekey = '';
    var value = null;
    var character_id = '';
    var skip = 0;
    var limit = 0;
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        try {
            var data = '';
            if (req.method == 'GET') {
                data = url.parse(req.url, true).query;
            } else {
                data = qs.parse(body);
            }
            character_id = data['character-id'];
            skip = data['skip'];
            limit = data['limit'];
            var modelNameCharacter = 'tbl_character';
            var Character = mongoose.model(modelNameCharacter, CharacterSchema);
            _cachekey = "execute_get_character" + character_id + skip + limit;
            value = cache.get(_cachekey);
            if (typeof value != 'undefined') {
                res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                res.end(value);
            } else {
                if ((character_id != undefined) && (mongoose.Types.ObjectId.isValid(character_id))) {
                    Character.findByCharacterId(character_id, function (err, resp) {
                        var jsonString = "[{}]";
                        if (resp != null) {
                            jsonString = JSON.stringify(resp);
                        }
                        res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                        var buf = new Buffer(jsonString, 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            cache.set(_cachekey, jsonString, cache_time);
                            buf = null;
                            res.end(jsonString);
                        });
                    });
                } else if ((skip != undefined) || (limit != undefined)) {
                    Character.getAllByPagination(skip, limit, function (err, resp) {
                        var jsonString = "[{}]";
                        if (resp != null) {
                            jsonString = JSON.stringify(resp);
                        }
                        res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                        var buf = new Buffer(jsonString, 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            cache.set(_cachekey, jsonString, cache_time);
                            buf = null;
                            res.end(jsonString);
                        });
                    });
                } else {
                    Character.getAll(function (err, resp) {
                        var jsonString = "[{}]";
                        if (resp != null) {
                            jsonString = JSON.stringify(resp);
                        }
                        res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                        var buf = new Buffer(jsonString, 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            cache.set(_cachekey, jsonString, cache_time);
                            buf = null;
                            res.end(jsonString);
                        });
                    });
                }

            }
        } catch (ex) {
            res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
            res.end("[{}]");
        }

    });
};

exports.search = function (req, res, zlib, cache_time, cache, mongoose, CharacterSchema, md5) {
    var qs = require('querystring'), url = require('url'); //file system module if it's needed
    var body = '';
    var _cachekey = '';
    var value = null;
    var key = '';
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        try {
            var data = '';
            if (req.method == 'GET') {
                data = url.parse(req.url, true).query;
            } else {
                data = qs.parse(body);
            }
            key = data['key'];
            var modelNameCharacter = 'tbl_character';
            var Character = mongoose.model(modelNameCharacter, CharacterSchema);
            _cachekey = "execute_find_by_name" + key;
            value = cache.get(_cachekey);
            if (typeof value != 'undefined') {
                res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                res.end(value);
            } else {
                if (key != undefined) {
                    Character.findByName(key, function (err, resp) {
                        var jsonString = "[{}]";
                        if (resp != null) {
                            jsonString = JSON.stringify(resp);
                        }
                        res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                        var buf = new Buffer(jsonString, 'utf-8');
                        zlib.gzip(buf, function (_, result) {
                            cache.set(_cachekey, jsonString, cache_time);
                            buf = null;
                            res.end(jsonString);
                        });
                    });
                } else {
                    res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                    res.end("[{}]");
                }

            }
        } catch (err) {
            res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
            res.end("[{}]");
        }
    });
};

exports.get_top_heroes = function (req, res, zlib, cache_time, cache, mongoose, CharacterSchema, md5, query) {
    var qs = require('querystring'), url = require('url'); //file system module if it's needed
    var body = '';
    var _cachekey = '';
    var value = null;

    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        try {
            var data = '';
            if (req.method == 'GET') {
                data = url.parse(req.url, true).query;
            } else {
                data = qs.parse(body);
            }
            var modelNameCharacter = 'tbl_character';
            var Character = mongoose.model(modelNameCharacter, CharacterSchema);
            _cachekey = query;
            value = cache.get(_cachekey);
            if (typeof value != 'undefined') {
                res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                res.end(value);
            } else {
                switch (query) {
                    case "top_heroes":
                        Character.getTopHeroes(function (err, resp) {
                            if (err) {
                                res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                                res.end("[{}]");
                            }
                            var jsonString = "[{}]";
                            if (resp != null) {
                                jsonString = JSON.stringify(resp);
                            }
                            res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                            var buf = new Buffer(jsonString, 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                cache.set(_cachekey, jsonString, cache_time);
                                buf = null;
                                res.end(jsonString);
                            });
                        });
                        break;
                    case "bad_guys":
                     Character.getBadGuys(function (err, resp) {
                            if (err) {
                                res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                                res.end("[{}]");
                            }
                            var jsonString = "[{}]";
                            if (resp != null) {
                                jsonString = JSON.stringify(resp);
                            }
                            res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                            var buf = new Buffer(jsonString, 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                cache.set(_cachekey, jsonString, cache_time);
                                buf = null;
                                res.end(jsonString);
                            });
                        });
                    break;
                     case "women_heroes":
                     Character.getWomenOfHeroes(function (err, resp) {
                            if (err) {
                                res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                                res.end("[{}]");
                            }
                            var jsonString = "[{}]";
                            if (resp != null) {
                                jsonString = JSON.stringify(resp);
                            }
                            res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                            var buf = new Buffer(jsonString, 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                cache.set(_cachekey, jsonString, cache_time);
                                buf = null;
                                res.end(jsonString);
                            });
                        });
                    break;
                    case "titanic_teams":
                     Character.getTitanicTeams(function (err, resp) {
                            if (err) {
                                res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                                res.end("[{}]");
                            }
                            var jsonString = "[{}]";
                            if (resp != null) {
                                jsonString = JSON.stringify(resp);
                            }
                            res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                            var buf = new Buffer(jsonString, 'utf-8');
                            zlib.gzip(buf, function (_, result) {
                                cache.set(_cachekey, jsonString, cache_time);
                                buf = null;
                                res.end(jsonString);
                            });
                        });
                    break;
                    default:
                        break;
                }

            }
        } catch (err) {
            res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
            res.end("[{}]");
        }
    });
}