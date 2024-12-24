const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const axios = require('axios');

const app = express();

app.use(express.json());

// Use session middleware
app.use("/customer", session({
    secret: "fingerprint",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware for authentication
app.use("/friends", function auth(req, res, next) {
    if (req.session.authorization) {
        let token = req.session.authorization['accessToken'];

        jwt.verify(token, "access", (err, user) => {
            if (!err) {
                req.user = user;
                next();
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in" });
    }
});

const PORT = 5000;

app.use("/customer", customer_routes);

app.use("/public_users", genl_routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
