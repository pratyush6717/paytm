
const express = require('express');
const cors = require('cors'); // Import cors
const app = express();
const apiRouter = require('./routes'); // Import the apiRouter

const PORT = process.env.PORT || 3000;

// Use the cors middleware
app.use(cors());

// Use the express.json middleware to parse JSON bodies
app.use(express.json());

// Use the apiRouter for all /api/v1 routes
app.use('/api/v1', apiRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
