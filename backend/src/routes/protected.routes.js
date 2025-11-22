import { Router } from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

// ROTA PROTEGIDA (exemplo)
// Só acessa se o token JWT for válido
router.get('/protected', authMiddleware, (req, res) => {
    res.json({
        message: 'Acesso garantido, você está autenticado!',
        userId: req.user.id, // <-- ID decodificado do token
    });
});

export default router;
