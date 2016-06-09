function string_to_slug(str) {
    
    str = str.toLowerCase();
    str = str.trim();
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    
    // remove accents, etc
    str = str.replace(/[áªàäâãåąæā]/gi, "a");
    str = str.replace(/[éèëêęėē]/gi, "e");
    str = str.replace(/[íïìîįī]/gi, "i");
    str = str.replace(/[óºòöôõøœō]/gi, "o");
    str = str.replace(/[úüùûū]/gi, "u");
    str = str.replace(/[ń]/gi, "n");
    str = str.replace(/[çćč]/gi, "c");
    str = str.replace(/[^a-z0-9 -]/g, '')// remove invalid chars
            .replace(/\s+/g, '')// collapse whitespace and replace by -
            .replace(/-+/g, ''); // collapse dashes
    
    return str;
}

exports.generateID = function (str, mongoose, md5) {
    return mongoose.Types.ObjectId(md5(string_to_slug(str)).substring(0, 24)).toString();
};