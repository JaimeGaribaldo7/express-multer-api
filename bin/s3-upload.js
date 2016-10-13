'use strict';

const fs = require('fs');
const fileType = require('file-type');

const filename = process.argv[2] || '';

const readFile =  (filename) => {
  return new Promise((resolve, reject) =>{
    fs.readFile(filename, (error, data) =>{
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });

};

// return a default obj in the case that file type is
// given an unsupported file type to read
const mimeType = (data) => {
  return Object.assign({
    ext: 'bin',
    mime: 'application/octet-stream',
  }, fileType(data));
};

const parseFile = (fileBuffer) => {
  let file = mimeType(fileBuffer);
  file.data = fileBuffer;
  return file;
};

const upload = (file) => {
  const options = {
    // get the bucket name from your AWS s3 console
    Bucket: 'pallettown',
    // attach the file Buffer as a stream to send to Amazon
    Body: file.data,
    // allow anyone to access the URL of the uploaded file
    ACL: 'public-read',
    // tell s3 waht the mime type is
    ContentType: file.mime,
    // pick a file name for s3 to upload
    Key: `test/test.${file.ext}`,
  };
  return Promise.resolve(options);
};

// dont actually upload yet, just pass the data down the Promise chain
const logMessage = (upload) => {
  // get rid of the stream for now
  delete upload.Body;
  console.log(`the upload options are ${JSON.stringify(upload)}`);
};

readFile(filename)
.then(parseFile)
.then(upload)
.then(logMessage)
.catch(console.error)
;
