const express = require('express');
const conversationsRouter = require('./routes/conversationsRouter');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.use('/api', conversationsRouter);

app.get('/', (req, res) => {
    res.send('Exabloom BE is running!');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
