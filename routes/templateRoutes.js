import express from 'express';
import {
  createTemplate,
  updateTemplate,
  deleteTemplate,
  getAllTemplates,
  postTemplateToUsers,
} from '../controllers/templateControllers.js';

const router = express.Router();

// templateRoutes.js
router.post('/', createTemplate); // ✅ correct
router.put('/templates/:id', updateTemplate);     // Edit
router.delete('/templates/:id', deleteTemplate);  // Delete
router.get('/templates', getAllTemplates);        // List
router.post('/templates/:id/post', postTemplateToUsers); // Post to user

export default router;
