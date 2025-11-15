module.exports = function (req, res, next) {
    const token = req.cookies.jwt;

    if (token) {
        return res.status(403).json({
            message: "Você já está logado. Não pode acessar esta rota."
        });
    }

    next();
};