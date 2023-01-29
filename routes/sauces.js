const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceController = require('../controllers/sauces.js');

const router = express.Router();

router.post('/', auth, multer, sauceController.createSauce);
router.get('/:id', auth, sauceController.getOneSauce);
router.get('/', auth, sauceController.getAllSauces);

module.exports = router;