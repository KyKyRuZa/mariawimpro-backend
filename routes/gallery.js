const express = require('express');
const router = express.Router();
const galleryController = require('../controllers/gallery');
const {upload,handleMulterError} = require('../middleware/multer'); 

router.get('/coach/:coachId', galleryController.getGalleryByCoachId);
router.get('/:id', galleryController.getGalleryItemById);
router.post('/coach/:coachId', upload.single('photo'), handleMulterError, galleryController.addToGallery);
router.put('/:id', upload.single('photo'),handleMulterError, galleryController.updateGalleryItem);
router.delete('/:id', galleryController.deleteGalleryItem);
router.patch('/order', galleryController.updateGalleryOrder);

module.exports = router;