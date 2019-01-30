exports.findColSQLValue = function(key){
    if(columnTypes[key] !== undefined) return columnTypes[key];
    else return key+',';
}


var columnTypes = {
    'integer': 'integer,',
    'gml:CodeType': 'integer,',
    'double': 'numeric,',
    'boolean': 'boolean,',
    'date': 'date,',
    'gml:LengthType': 'numeric,'
}

module.exports = exports;