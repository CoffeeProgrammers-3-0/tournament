const express = require('express');
const pdfRoute = require('./routes/pdf.route');

const app = express();

app.use(express.json({ limit: '20mb' }));

app.use('/pdf', pdfRoute);

app.get('/health', (req, res) => {
    res.send('PDF worker is running');
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`PDF worker running on port ${PORT}`);
});