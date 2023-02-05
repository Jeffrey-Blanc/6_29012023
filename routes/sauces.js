const express = require('express');
const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');
const sauceController = require('../controllers/sauces.js');

const router = express.Router();

router.post('/', auth, multer, sauceController.createSauce);
router.get('/:id', auth, sauceController.getOneSauce);
router.get('/', auth, sauceController.getAllSauces);
router.put('/:id', auth, multer, sauceController.modifySauce);
router.delete('/:id', auth, sauceController.deleteSauce);
router.post('/:id/like', auth, sauceController.appreciationSauce);

module.exports = router;