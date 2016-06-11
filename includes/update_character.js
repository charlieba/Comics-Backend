var params = require('./config_module.js');
exports.execute_insert_news = function (req, res, mongoose, CharacterSchema, md5) {
    var qs = require('querystring'), url = require('url');
    var modelNameCharacter = 'tbl_character';
    var Character = mongoose.model(modelNameCharacter, CharacterSchema);
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
    //for (var i = 0; i < 1500; i+100) {
    try {
        data = url.parse(req.url, true).query;
        var offset = data['offset'];
        if(offset==undefined){
            offset=0;
        }
        
        var Marvel = require('marvel')
        var marvel = new Marvel({ publicKey: "52b6305c2146fd0f86ae99c9878fcdc2", privateKey: "984ca2beeedd0fa2b81f7e22b7d7e29d5b632c8f" })
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
        
        } catch (err){ 
            console.log(err);
        }
    });
    //}
    function query(marvel, offset) {
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
        Character.update({
            '_id': params.generateID(keyID, mongoose, md5).toString()
        }, {
            'name': name,
            'description': description,
            'modified': modified,
            'thumbnail': thumbnail,
            'detail':detail
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
exports.get_character=function (req, res, zlib, cache_time,cache, mongoose, CharacterSchema, md5) {

    var qs = require('querystring'), url = require('url'); //file system module if it's needed
    var body = '';
    var _cachekey = '';
    var value = null;
    req.on('data', function (data) {
        body += data;
    });
    req.on('end', function () {
        var data = '';
        if (req.method == 'GET') {
            data = url.parse(req.url, true).query;
        } else {
            data = qs.parse(body);
        }
            var modelNameCharacter = 'tbl_character';
            var Character = mongoose.model(modelNameCharacter, CharacterSchema);
            _cachekey = "execute_get_character";
            value = cache.get(_cachekey);
            if (typeof value!= 'undefined') {
                console.log('cache');
                 res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                 res.end(value);
             }else{
                Character.getAll(function (err, resp)
                {
                    //Temporary
                    var jsonString = "[{}]";
                    if (resp != null) {
                        jsonString = JSON.stringify(resp)
                        //jsonString = jsonString.replace(/\"_id\":/g, "\"team-id\":");
                    }
                    res.writeHead(200, "OK", { 'Content-Type': 'application/json' });
                     var buf = new Buffer(jsonString, 'utf-8');
                    zlib.gzip(buf, function (_, result) {
                        cache.set(_cachekey, jsonString, cache_time);
                        buf = null;
                        console.log('no cache');
                        res.end(jsonString);
                    });
                });
             }
                

        
    });
};