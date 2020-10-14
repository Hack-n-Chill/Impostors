const http=require('http');
const path=require('path');

const bodyParser=require('body-parser');
const express=require('express');

const app=express();

app.set('view engine','ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.listen(3000,function() {
    console.log("server running on port 3000");
});