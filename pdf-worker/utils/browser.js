const { chromium } = require('playwright');

let browserInstance = null;

async function getBrowser() {
    if (!browserInstance) {
        browserInstance = await chromium.launch({
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        });
    }

    return browserInstance;
}

module.exports = {
    getBrowser
};