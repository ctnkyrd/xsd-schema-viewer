const express = require('express'),
    app = express(),
    port = process.env.PORT || 3000,
    ip = process.env.IP || 'localhost',
    bodyParser = require("body-parser");


var dbRoutes = require("./routes/db");

//static app.use configuration!
app.use(bodyParser.json());
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname+'/views'));
app.use(express.static(__dirname+'/public'));

app.use('/db', dbRoutes);

app.get("/", function(req, res){
    res.render("index");
});



app.listen(port, ip, function(){
    console.log(`APP STARTED`);
});