const { getBrowser } = require('../utils/browser');

async function generatePdf(html) {
    const browser = await getBrowser();
    const page = await browser.newPage();

    try {
        await page.setContent(html, {
            waitUntil: 'networkidle'
        });

        const config = await page.evaluate(() => {
            const getMeta = (name) =>
                document.querySelector(`meta[name="${name}"]`)?.content;

            return {
                width: getMeta('pdf-width'),
                height: getMeta('pdf-height')
            };
        });

        const options = {
            printBackground: true,
        };

        if (config.width && config.height) {
            options.width = config.width;
            options.height = config.height;
        } else {
            options.format = 'A4';
        }

        const pdf = await page.pdf(options);

        return pdf;

    } finally {
        await page.close();
    }
}

module.exports = {
    generatePdf
};