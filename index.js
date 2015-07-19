#! /usr/bin/env node
'use strict';
var child = require('child_process');
var mkdirp = require('mkdirp');
var path = require('path');
var express = require('express');
var spawnCommand = require('spawn-command');
var app = express();
var port = 1454;

var GOOGLE_CHROME_PATH = '/Applications/Google\ Chrome.app\
/Contents/MacOS/Google\ Chrome';
GOOGLE_CHROME_PATH = GOOGLE_CHROME_PATH.replace(/\ /g, '\\ ');

app.use(express.static(__dirname));

var tmpDir = path.join(process.env.TMPDIR, 'show-commits');

mkdirp.sync(tmpDir);

var cmd = 'git log --format=format:"%cn,%ct" --no-merges';
var output = child.exec(cmd, {
  cwd: process.cwd()
}, function(err, stdout, stderr) {
  if (err) throw err;
  var commits = 'author,timestamp\n' + stdout;
  // console.log('commits', commits);
  app.get('/commits.csv', function (req, res) {
    res.send(commits);
    console.log('sending commits');
  });
  var server = app.listen(port, function () {
    var host = 'localhost';
    var port = server.address().port;
    var cmd = GOOGLE_CHROME_PATH + ' \
      --user-data-dir=' + tmpDir + ' \
      --force-app-mode \
      --window-size=1200,800 \
      --app=http://' + host + ':' + port + '/';
    console.log(cmd);
    var child = spawnCommand(cmd);
    child.stdout.on('data', function (data) {
      console.log(data.toString());
    });
    child.stderr.on('data', function (data) {
      console.log(data.toString());
    });
    child.on('exit', function() {
      process.exit();
    });
  });
});