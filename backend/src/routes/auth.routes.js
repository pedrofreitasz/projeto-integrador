const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../utils/db');
const { body, validationResult } = require('express-validator');
const blockIfLogged = require('../middleware/blockIfLogged');

// ---------------------------------------------------------
// ROTA DE REGISTRO (POST /register)
// ---------------------------------------------------------
router.post(
    '/register',
    blockIfLogged, // Impede usuários já logados de criar nova conta
    [
        body('email').isEmail().withMessage('O e-mail fornecido não é válido'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('A senha deve ter no mínimo 6 caracteres.'),
        body('nome')
            .notEmpty()
            .withMessage('O nome é obrigatório.')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { email, password, nome } = req.body;

        try {
            // Criptografa a senha
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Inserir no PostgreSQL
            await pool.query(
                `INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3)`,
                [nome, email, hashedPassword]
            );

            res.status(201).json({ message: "Usuário registrado com sucesso." });

        } catch (error) {
            // Código 23505 = UNIQUE violation no PostgreSQL
            if (error.code === "23505") {
                return res.status(400).json({ message: "Email já cadastrado." });
            }

            res.status(500).json({ message: "Erro no servidor." });
        }
    }
);

// ---------------------------------------------------------
// ROTA DE LOGIN (POST /login)
// ---------------------------------------------------------
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        // Busca usuário no PostgreSQL
        const result = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // Compara hash
        const isMatch = await bcrypt.compare(password, user.senha);
        if (!isMatch) {
            return res.status(401).json({ message: "Credenciais inválidas." });
        }

        // Gera token
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        // Envia JWT via cookie HttpOnly
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 3600000
        });

        res.status(200).json({ message: "Login bem-sucedido. Token enviado via cookie." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Erro no servidor." });
    }
});

module.exports = router;
