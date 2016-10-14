'use strict';

require('dotenv').config();

const fs = require('fs');
const fileType = require('file-type');
const AWS = require('aws-sdk');

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

const s3 = new AWS.S3({
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
});

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

  return new Promise((resolve, reject) => {
    s3.upload(options, (error, data) =>{
      if (error) {
        reject(error);
      }
      resolve(data);
    });
  });
};

// dont actually upload yet, just pass the data down the Promise chain
const logMessage = (response) => {
// turn the pojo into a string so that
  console.log(`the response from AWS was ${JSON.stringify(response)}`);
};

readFile(filename)
.then(parseFile)
.then(upload)
.then(logMessage)
.catch(console.error)
;
