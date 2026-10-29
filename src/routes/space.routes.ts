import { Router } from 'express';
import * as spaceController from '../controllers/space.controller';

const router = Router();

router.get('/', spaceController.getAllSpaces);
router.get('/:id', spaceController.getSpaceById);
router.post('/', spaceController.createSpace);
router.put('/:id', spaceController.updateSpace);
router.delete('/:id', spaceController.deleteSpace);

export default router;