var http = require('http'),
    url = require('url'),
    path = require('path'),
    fs = require('fs');

var mimeTypes = {
    "html": "text/html",
    "wav": "audio/wav",
    "png": "image/png",
    "js": "text/javascript",
    "css": "text/css"
};
var port = process.env.PORT || 3000;

http.createServer(function(req, res) {
    var uri = url.parse(req.url).pathname;
    if ('/' === uri) {
        uri = '/index.html';
    }
    var filename = path.join(process.cwd(), uri);
    fs.access(filename, fs.constants.F_OK, (err) => {
        if (err) {
            res.writeHead(200, {'Content-Type': 'text/plain'});
            res.write('404 Not Found\n');
            return res.end();
        }

        var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
        res.writeHead(200, mimeType);

        var fileStream = fs.createReadStream(filename);
        fileStream.pipe(res);
    });
}).listen(port);
