const express = require('express')
const {getUpload, getUploadThumbnail} = require('../controllers/uploads')


const router = express.Router()

const { protect } = require('../middleware/auth')


router
  .route('/video/:id')
  .get(getUpload)

router
.route('/thumbnail/:id')
.get(getUploadThumbnail)

module.exports = router
