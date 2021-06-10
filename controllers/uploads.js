const asyncHandler = require('../middleware/async')
const ErrorResponse = require('../utils/errorResponse')

const Video = require('../models/Video')

const mongoose = require('mongoose')
const DBConnection = require('../config/db')

const Grid = require('gridfs-stream');
Grid.mongo = mongoose.mongo;


const getDB = async ()=>{
    const conn = await DBConnection()
    return conn.connection
  }

exports.getUpload = asyncHandler(async (req, res, next) => {
    
    const db = await getDB();
    console.log("here, uploaded endpoint")
    // Check for range headers to find our start time
    
    /*const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }*/
  
  const video = await Video.findById(req.params.id)
    .populate({
      path: 'categoryId'
    })
    .populate({ path: 'userId', select: 'channelName subscribers photoUrl' })
    .populate({ path: 'likes' })
    .populate({ path: 'dislikes' })
    .populate({ path: 'comments' })
  if (!video) {
    return next(new ErrorResponse(`No video with that id of ${req.params.id}`))
  }

  console.log("video.url", video.url)
  // GridFS Collection
  db.collection('fs.files').findOne({filename : video.url}, (err, video) => {
    if (!video) {
      res.status(404).send("No video uploaded!");
      return;
    }
  
    // Create response headers
    const videoSize = video.length;
    const start = 0 //Number(range.replace(/\D/g, ""));
    const end = videoSize - 1;
  
    const contentLength = end - start + 1;
    const headers = {
      "Content-Range": `bytes ${start}-${end}/${videoSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "video/mp4",
    };
  
    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);
  
    // Get the bucket and download stream from GridFS
    const bucket = new mongoose.mongo.GridFSBucket(db.db);
    console.log("url2", video)
    const downloadStream = bucket.openDownloadStreamByName(video.filename, {
      start
    });
  
    // Finally pipe video to response
    downloadStream.pipe(res);
  });  
  })
  
exports.getUploadThumbnail = asyncHandler(async (req, res, next) => {
    
    const db = await getDB();
    console.log("here, uploaded endpoint")
    // Check for range headers to find our start time
    
    /*const range = req.headers.range;
    if (!range) {
      res.status(400).send("Requires Range header");
    }*/

  // GridFS Collection
  db.collection('fs.files').findOne({filename : req.params.id}, (err, video) => {
    if (!video) {
      res.status(404).send("No video uploaded!");
      return;
    }

  
    // Get the bucket and download stream from GridFS
    const bucket = new mongoose.mongo.GridFSBucket(db.db);
    
    const downloadStream = bucket.openDownloadStreamByName(video.filename);
    
      // Finally pipe video to response
    downloadStream.pipe(res);       

  });  
})
  