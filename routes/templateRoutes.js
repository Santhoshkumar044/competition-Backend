import express from 'express';
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAllTemplates,
  postTemplateToUsers,
} from '../controllers/templateControllers.js';
import isHost from '../middleware/isHost.js';

const router = express.Router();

// templateRoutes.js
router.post('/', isHost, createTemplate); // ✅ correct
router.put('/templates/:id', isHost, updateTemplate);     // Edit
router.delete('/templates/:id', isHost, deleteTemplate);  // Delete
router.get('/templates', isHost, getAllTemplates);        // List
router.post('/templates/:id/post', isHost, postTemplateToUsers); // Post to user

export default router;
