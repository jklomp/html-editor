//////////////////////////////////////////////////////////
//                                                      //
//               node.js http file server               //
//                                                      //
//////////////////////////////////////////////////////////

// Start the server in a command line window:
// C:\directory_path_to_the_file_server.js> node server

var port = 3250;

var handler = function(req, res) {
	//console.log('-------------> ip address is'+req.socket.localAddress);
    //console.log(req.url);
    var url=decodeURI(req.url);

    if (req.method == 'GET') {

        if (url == '/') url='/index.html'; // default file

        var p=url.lastIndexOf('.');  // file type --> content-type 
        var ctype='text/html';
        var encoding='utf-8';
        if (p>0) { // -1 : no dot, 0: start-dot
            var ext=url.substr(p+1);
            if (ext=='js') var ctype='application/javascript';
            else if (ext=='ico') {ctype='image/ico'; encoding='';}
            else if (ext=='gif') {ctype='image/gif'; encoding='';}
        }
        
        fs.exists('.'+url, function(exists) {
            if (exists) {
                fs.readFile('.'+url,encoding, function (err, data) {
                    if (err) console.log(err);
                    res.setHeader("Content-Type", ctype);        
                    res.writeHead(200);
                    res.end(data);
                    console.log('****** get: reading file '+url);
                });        
            } else {
                res.setHeader("Content-Type", ctype);        
                res.writeHead(200);
                res.end();
                console.log('****** get: file not found '+url);
           }
        }); 
    } // GET
    
    if (req.method == 'POST') {
        var postdata = '';
        req.on('data', function (data) {
            postdata += data;
            if (postdata.length > 1000000) { 
                // FLOOD ATTACK OR FAULTY CLIENT, NUKE REQUEST
                request.connection.destroy();
            }
        });
        req.on('end', function () {
            var data=JSON.parse(postdata);
            if (data && data.func){
                if (data.func=='writefile') writefile(data,res);
                else if (data.func=='readdir') readdir(data,res);
                else if (data.func=='fileexists') fileexists(data,res); 
                else if (data.func=='readfile') readfile(data,res); 
           }
        });
    } // POST
}

function readfile(data,res){ 
    if (data.filename) {
        var filename=data.filename.replace(/'/g,"");   // remove single quotes
        fs.readFile(filename,"utf-8", function (err, data) {
            if (err) console.log(err);
            res.setHeader("Content-Type", "text/html");        
            res.writeHead(200);
            res.end(data);
            console.log('****** post: reading file '+filename);
        });        
    }    
}

function writefile(data,res){ 
    if (data.filename && data.data) {
        var filename=data.filename.replace(/'/g,"");   // remove single quotes
        fs.writeFile(filename, data.data, function (err) { 
            console.log('****** data written in '+filename);
            if (err) console.log(err);
            res.setHeader("Content-Type", "text/html");        
            res.writeHead(200);
            res.end(err);
        });
    }    
}

function fileexists(data,res){ 
    if (data.filename) {
        var filename=data.filename.replace(/'/g,"");   // remove single quotes
        var exists=fs.existsSync(filename);
        console.log('****** checking file '+filename+', existing='+exists);
        res.setHeader("Content-Type", "text/html");        
        res.writeHead(200);
        res.end(JSON.stringify({file:filename,existing:exists}));
    }    
}

function readdir(data,res){
    if (data.dirname) {
        var dirname=data.dirname.replace(/'/g,""); // remove single quotes
        fs.readdir(dirname, function (err, data) { 
            console.log('****** read dir '+dirname);
            var list=[];
            if (err) console.log('----> error in fs.readdir: '+err);
            if (data){
                for (var i=0; i < data.length;i++) {
                    try{
                        var stats=fs.statSync(dirname+'\\'+data[i]);
                        var isfile=stats.isFile();
                        var isdir=stats.isDirectory();
                        if (isdir || isfile){
                            list.push({name:data[i],isdir:isdir,isfile:isfile,size:stats["size"],time:stats["mtime"]});
                            //console.log(list[list.length-1]);		    			
                        }
                    }
                    catch(err) {console.log('error in fs.stat, file: '+data[i]);}
                }
            }
            res.setHeader("Content-Type", "text/html");        
            res.writeHead(200);
            res.end(JSON.stringify(list));
        });
    }
}

//////////////////////////////////////////////////////////
//                                                      //
//                  find ip address                     //
//                                                      //
//////////////////////////////////////////////////////////


function getIPAddresses() {

    var ipAddresses = [];

    var interfaces = require('os').networkInterfaces();
    for (var devName in interfaces) {
        var iface = interfaces[devName];
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                ipAddresses.push(alias.address);
            }
        }
    }

    return ipAddresses;
}

// save the ip-address; it is used to replace the dummy address in onload.js
var serveripaddress = getIPAddresses()[0];

var app     = require('http').createServer(handler);
var fs      = require('fs');

//////////////////////////////////////////////////////////
//                                                      //
//                      start server                    //
//                                                      //
//////////////////////////////////////////////////////////

app.listen(port);

console.log('Server running at ' + serveripaddress + ':'+port);


