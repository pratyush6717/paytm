// backend/routes/index.js
const express = require('express');
const apiRouter = express.Router();
const userRouter = require('./user'); // Import the userRouter
const accountRouter = require("./account");


apiRouter.use('/user', userRouter);
apiRouter.use("/account", accountRouter);
// Define your routes here
apiRouter.get('/', (req, res) => {
    res.send('API is working');
});

module.exports = apiRouter;
