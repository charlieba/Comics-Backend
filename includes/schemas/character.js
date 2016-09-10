module.exports.character_model = function (mongoose) {
    var ObjectSchema = new mongoose.Schema({
        'name': String,
        'description': String,
        'modified': mongoose.Schema.Types.Mixed,
        'thumbnail': String,
        'detail': mongoose.Schema.Types.Mixed,
        'tag':String
    });
    ObjectSchema.statics.getAll = function (cb) {
        this.find({}, '-__v -_id -tag -detail -modified -description', cb).sort({ 'tag': 1 });
    }
    ObjectSchema.statics.findByCharacterId = function (character_id, cb) {
        this.findOne({"_id": character_id}, cb);
    }
    ObjectSchema.statics.getAllByPagination = function (_skip,_limit,cb) {
        _skip=parseInt(_skip);
        _limit=parseInt(_limit);
        this.find({}, '-__v', cb).sort({ 'name': 1 }).skip(_skip).limit(_limit);
    }
    ObjectSchema.statics.findByName = function (key,cb) {
        this.find( {$or: [{ "name": { "$regex": key, "$options": "i" } },{"name":key} ]} , '-__v', cb).sort({ 'tag': 1 });
    }
     ObjectSchema.statics.getTopHeroes = function (cb) {
        this.find( {$or: [{$or: [
        { "name": "Spider-Man"},
        { "name": "Captain Marvel (Carol Danvers)"},
        { "name": "Hulk"},
        { "name": "Iron Man"},
        { "name": "Luke Cage"},
        { "name": "Black Widow"},
        { "name": "Daredevil"},
        { "name": "Captain America"},
         { "name": "Wolverine"}
        ]}]} , '-__v', cb).sort({ 'tag': 1 });
    }
     ObjectSchema.statics.getBadGuys = function (cb) {
        this.find( {$or: [{$or: [
        { "name": "Ultron"},
        { "name": "Loki"},
        { "name": "Red Skull"},
        { "name": "Mystique"},
        { "name": "Thanos"},
        { "name": "Ronan"},
        { "name": "Magneto"},
        { "name": "Doctor Doom"},
         { "name": "Green Goblin (Barry Norman Osborn)"},
         { "name": "Black Cat"}
        ]}]} , '-__v', cb).sort({ 'tag': 1 });
    }
     ObjectSchema.statics.getWomenOfHeroes = function (cb) {
        this.find( {$or: [{$or: [
        { "name": "Black Widow"},
        { "name": "Captain Marvel (Carol Danvers)"},
        { "name": "Medusa"},
        { "name": "Ms. Marvel (Kamala Khan)"},
        { "name": "Scarlet Witch"},
        { "name": "She-Hulk (HAS)"},
        { "name": "Storm"}
        ]}]} , '-__v', cb).sort({ 'tag': 1 });
    }
    ObjectSchema.statics.getTitanicTeams = function (cb) {
        this.find( {$or: [{$or: [
        { "name": "Avengers"},
        { "name": "Guardians of the Galaxy"},
        { "name": "X-Men"},
        { "name": "Defenders"},
        { "name": "Fantastic Four"},
        { "name": "Brotherhood of Evil Mutants"},
        { "name": "Illuminati"},
        { "name": "Inhumans"}
        ]}]} , '-__v', cb).sort({ 'tag': 1 });
    }
    return ObjectSchema;
};