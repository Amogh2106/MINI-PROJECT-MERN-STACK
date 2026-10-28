import { Router } from 'express';
import * as noteController from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';
import { checkOwnership } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import Note from '../models/Note.js';
import { createNoteSchema } from '../validators/noteValidator.js';

const router = Router();

router.use(protect);

router.get('/:entityType/:entityId', noteController.getNotesByEntity);
router.post('/', validate(createNoteSchema), noteController.createNote);
router.delete('/:id', checkOwnership(Note), noteController.deleteNote);

export default router;
