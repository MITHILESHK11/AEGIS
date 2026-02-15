const checkRole = (roles) => {
    return (req, res, next) => {
        // Assuming `req.user.role` is populated by previous middleware (auth.js)
        if (!req.user || !roles.includes(req.user.role)) {
            console.log(`[RBAC] Access Denied for ${req.user?.email} (${req.user?.role}) to ${req.originalUrl}. Required: ${roles}`);
            return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
        }
        next();
    };
};

module.exports = checkRole;
