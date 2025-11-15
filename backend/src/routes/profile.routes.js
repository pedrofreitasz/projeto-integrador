const router = require('express').Router();
const verifyToken = require('../middleware/authMiddleware');
const db = require('../utils/db');

router.get('/profile', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id; 

        const query = `
            SELECT id, nome, email, created_at, updated_at
            FROM usuarios
            WHERE id = $1
            LIMIT 1
        `;

        const result = await db.query(query, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Usuário não encontrado." });
        }

        const user = result.rows[0];

        res.json({
            id: user.id,
            nome: user.nome,
            email: user.email,
            criado_em: user.created_at,
            atualizado_em: user.updated_at
        });

    } catch (error) {
        console.error("Erro ao buscar perfil:", error);
        res.status(500).json({ message: "Erro no servidor." });
    }
});

module.exports = router;