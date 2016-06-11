module.exports.character_model = function (mongoose) {
    /* Define the Table Schema
     * */
    var ObjectSchema = new mongoose.Schema({
        'name': String,
        'description': String,
        'modified': mongoose.Schema.Types.Mixed,
        'thumbnail': String,
        'detail': mongoose.Schema.Types.Mixed
    });
    ObjectSchema.statics.getAll = function (cb) {
        this.find({}, '-__v', cb);
    }
    return ObjectSchema;
};