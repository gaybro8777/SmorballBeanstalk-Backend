///////////////////////////////////////////////////////
// Simple function to require our routes recursively //
///////////////////////////////////////////////////////

var fs             = require('fs');
var validFileTypes = ['js'];

/**
 * Goes through the files in our routes directory and loads them.
 *
 * @param  directory The directory we want to recurse on.
 * @param  router    The router instance to load our routes into.
 */
function requireFiles (directory, router) {
  fs.readdirSync(directory).forEach(function (fileName) {
    // Recurse if directory
    if(fs.lstatSync(directory + '/' + fileName).isDirectory()) {
      requireFiles(directory + '/' + fileName, router);
    } else {
      // Skip this file
      if(fileName === 'index.js' && directory === __dirname) return;
        // Skip unknown filetypes
        if(validFileTypes.indexOf(fileName.split('.').pop()) === -1) return;
      // Require the file.
      console.log(directory + '/' + fileName);
      require(directory + '/' + fileName)(router);
    }
  });
}

module.exports = function (router) {
    requireFiles(__dirname, router);
};
