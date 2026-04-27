const express = require('express');
const router = express.Router();
const pdfService = require('../services/pdf.service');

let activeRequests = 0;
const MAX_CONCURRENT = 8;

router.post('/', async (req, res) => {
    if (activeRequests >= MAX_CONCURRENT) {
        return res.status(429).send({ error: 'Too many requests' });
    }

    const { html } = req.body;

    if (!html) {
        return res.status(400).send({ error: 'HTML is required' });
    }

    activeRequests++;

    try {
        const pdfBuffer = await pdfService.generatePdf(html);

        res.setHeader('Content-Type', 'application/pdf');
        res.send(pdfBuffer);

    } catch (err) {
        console.error(err);
        res.status(500).send({ error: 'PDF generation failed' });

    } finally {
        activeRequests--;
    }
});

module.exports = router;