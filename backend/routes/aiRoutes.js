'use strict';

const express = require('express');
const router = express.Router();

const aiController = require('../controllers/aiController');
const { authenticate } = require('../middleware/auth');
const validate = require('../middleware/validate');
const v = require('../utils/validators');

router.use(authenticate);

router.get('/', aiController.types);
router.get('/history', aiController.history);

router.post('/chat', v.aiChatRules, validate, aiController.chat);
router.post('/image', v.aiImageRules, validate, aiController.image);
router.post('/video', v.aiGenericRules, validate, aiController.video);
router.post('/voice', v.aiGenericRules, validate, aiController.voice);
router.post('/music', v.aiGenericRules, validate, aiController.music);
router.post('/logo', v.aiGenericRules, validate, aiController.logo);
router.post('/resume', v.aiGenericRules, validate, aiController.resume);
router.post('/presentation', v.aiGenericRules, validate, aiController.presentation);
router.post('/pdf-summary', v.aiGenericRules, validate, aiController.pdfSummary);
router.post('/code', v.aiGenericRules, validate, aiController.code);
router.post('/website', v.aiGenericRules, validate, aiController.website);
router.post('/app', v.aiGenericRules, validate, aiController.app);
router.post('/email', v.aiGenericRules, validate, aiController.email);
router.post('/document', v.aiGenericRules, validate, aiController.document);

module.exports = router;
