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
    return ObjectSchema;
};