'use strict';

// this has to come before anything else
require('dotenv').config();

const fs = require('fs');
const crypto = require('crypto');

const fileType = require('file-type');
const AWS = require('aws-sdk');
// AWS is amazon's naming convention
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

const randomHexString = (length) => {
  return new Promise((resolve, reject) =>{
    crypto.randomBytes(length, (error, buffer) =>{
      if (error) {
        reject(error);
      }

      resolve(buffer.toString('hex'));
    });
  });
};

const nameFile = (file) => {
  return randomHexString(16)
  .then((val) => {
    file.name = val;
    return file;
  });
};

const nameDirectory = (file) => {
  file.dir = new Date().toISOString().split('T')[0];
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
      Key: `${file.dir}/${file.name}.${file.ext}`,
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

const logMessage = (response) => {
  // turn the pojo into a string so that
  console.log(`the response from AWS was ${JSON.stringify(response)}`);
};

readFile(filename)
.then(parseFile)
.then(nameFile)
.then(nameDirectory)
.then(upload)
.then(logMessage)
.catch(console.error)
;
