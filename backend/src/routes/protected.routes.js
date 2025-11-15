const router = require('express').Router();
const verifyToken = require('../middleware/auth'); // Middleware de autenticação

// ROTA PROTEGIDA (exemplo)
// Só acessa se o token JWT for válido
router.get('/protected', verifyToken, (req, res) => {
    res.json({
        message: 'Acesso garantido, você está autenticado!',
        userId: req.user.id, // <-- ID decodificado do token
    });
});

module.exports = router;
