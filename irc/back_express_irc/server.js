const express = require('express');
const cors = require('cors');
const app = express();
const port = 8000;

app.use(cors(
    {
        origin: 'http://localhost:5173',  
        methods: 'GET,POST',         
        allowedHeaders: 'Content-Type'     }
));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
});