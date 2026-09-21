import express from 'express';
var router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('welcome to the ecommerce api!');
});

export default router;