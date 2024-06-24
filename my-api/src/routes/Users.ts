import { Router } from 'express';
import { create, getAll, getById, remove, update, login, emargement, getEmargement, forgotPassword, verifyResetCode, changePassword,} from '../controllers/Users';

const router = Router();

router.get('/', getAll);
router.get('/emargement', getEmargement);
router.get('/:id', getById);


router.post('/', create);
router.post('/login', login);
router.post('/emargement', emargement);
router.post('/forgotPassword', forgotPassword);
router.post('/verify-reset-code', verifyResetCode);

router.put('/changePassword', changePassword);
router.put('/:id', update);

router.delete('/:id', remove);

export default router;
