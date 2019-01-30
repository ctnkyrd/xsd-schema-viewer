var https = require('https'),
    http = require('http'),
    colTypes = require('./columnTypes'),
    xml2js = require('xml2js');



exports.getElements = function(req, res){
    var xmlURL = req.body.xsd.url;
    if(xmlURL.split('://')[0] === 'https'){
        getElementsHTTPS(xmlURL, res);
    } else if(xmlURL.split('://')[0] === 'http'){
        getElementsHTTP(xmlURL, res);
    } else {
        res.render("error");
    }
}

function getElementsHTTP(xmlURL, res){
    http.get(xmlURL, function(result){
        webGET(xmlURL,result,res)
    }).on('error', e => {console.log(e)});
}

function getElementsHTTPS(xmlURL, res){
    https.get(xmlURL, function(result){
        webGET(xmlURL, result, res);
    }).on('error', e => {console.log(e)});
}

function webGET(xmlURL, result, res){
    var data = '';
    var parser = new xml2js.Parser();
    var getColValue = colTypes.findColSQLValue;
    console.log(getColValue('gml:LengthType'));
    parser.on('error', function(err) { 
        console.log(err);
        res.render("error"); 
    });
    if(result.statusCode === 200){
        result.on('data', function(data_) { data += data_.toString(); });
        result.on('end', function() {
            parser.parseString(data, function(err, result) {
              if (err){
                res.render("error");
              } 
              else {
                var resulArr = result.schema.element.map(function(val){
                    var name = val.$.name;
                    var description = val.annotation[0].documentation[0];
                    var columns = findColumns(result.schema.complexType, name);
                    var sqlSentence ='';
                    columns.forEach(function(val){
                        sqlSentence += '"'+val.name+'"'+ ' ' +getColValue(val.type)+'\n';
                    });
                    return {
                        name: name, 
                        description : description,
                        substitutionGroup: val.$.substitutionGroup,
                        type: val.$.type,
                        columns: columns,
                        dbscript: `CREATE TABLE ${name}(
                            ${sqlSentence}
                        )`
                    }                            
                    })

                  res.render("scripting", {result: resulArr, xsdURL: xmlURL});
                }
            });
          });
    } else {
        res.render("error");
    }
}

function findColumns(arr,name){
    //objetanımlayıcılardan içerisinde Type ve PropertyType yazanlar o nesnenin kolonlarını ifade etmektedir, ilgili nesnenin kolonlarına erişimin başka yolu yok
    var colF1 = arr.filter(val=>((val.$.name === name+'Type' || val.$.name === name+'PropertyType') && val.complexContent !== undefined))
                 .map(val => (val.complexContent[0].extension[0].sequence[0].element))[0];
                if (colF1 !== undefined){
                    var col1=colF1.map(function(val){
                        var obj = val.$;
                        if (obj.maxOccurs !== undefined){
                            return {name: obj.name, type: 'RelationalTable', isColumn: false};
                        } else {
                            return {name: obj.name, type: obj.type, isColumn: true};
                        }
                    });
                } else{
                    col1 = [{name: 'noColumnType', type:'noColumnType', isColumn:false}]  
                } 

    var colF2 = arr.filter(val=>((val.$.name === name+'Type' || val.$.name === name+'PropertyType') && val.complexContent === undefined))
                .map(function(val){
                    return val.sequence[0].element;
                })[0];

                if (colF2 !== undefined){
                    var col2 = colF2.map(function(val){
                        var obj = val.$;
                        if (obj.maxOccurs !== undefined){
                            return {name: obj.name, type: 'RelationalTable', isColumn: false};
                        } else {
                            return {name: obj.name, type: obj.type, isColumn: true};
                        }
                    });
                } else col2 = [{name: 'noColumnType', type:'noColumnType', isColumn:false}]
                
               return [...col1, ...col2].filter(val=>(val.name!==undefined && val.isColumn === true));
            }

module.exports = exports;