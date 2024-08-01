const express = require('express');

const router = express.Router();
const uplCtrl = require('./controller/uploadController')

router.post('/csvToJson',(req, res, next)=>{
    uplCtrl.csvToJsonConverter(req, res,next)
})

module.exports = router;