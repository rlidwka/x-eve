/*
  a simple static file server to serve the browser tests
*/
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs")
    port = process.argv[2] || 8888;

http.createServer(function(request, response) {

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri);

  if(uri == '' || uri == '/'){
    response.writeHead(302, {"Location": "/test"});
    response.end();
    return;
  }
  
  path.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      return;
    }

	if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        return;
      }

      var contentType = "text/html";

      if(filename.match(/\.js$/))
        contentType = "application/javascript";
      if(filename.match(/\.css$/))
        contentType = "text/css";
            

      response.writeHead(200, {"Content-Type": contentType});
      response.write(file, "binary");
      response.end();
    });
  });
}).listen(parseInt(port, 10));

console.log("Serving Browser Tests at\n\thttp://localhost:" + port + "/\nCTRL + C to shutdown");