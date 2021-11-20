import core from '@actions/core'
import fetch from 'node-fetch'

const qqJsRegex = /window\.__INITIAL_STATE__=({.+})/;
const jsonHeader = {
    "Content-Type": "application/json"
};

async function run() {
    try {
        const qqHtmlContent = await fetch("https://im.qq.com/download", {
            headers: {
                "User-Agent": 
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
            }
        });
        const qqRawJson = qqJsRegex.exec(await qqHtmlContent.text());
        if (!qqRawJson) {
            throw new Error("Unable to find initial state")
        }

        const qqJson = JSON.parse(qqRawJson[1]);
        const androidQQ = qqJson['rainbowConfig']['products']['mQQ']['andQQ'];

        const response = {
            version: androidQQ['version'].trim(),
            feature: androidQQ['feature'].map(s => s.trim()),
            updateDate: androidQQ['updateDate'].trim(),
            downloadUrl: androidQQ['downloadUrl'].trim()
        };

        core.info(`Version: ${response.version}\nFeatures: ${response.feature.join(', ')}\nDate: ${response.updateDate}\nURL: ${response.downloadUrl}`)

        core.setOutput('version', response.version)
        core.setOutput('update_date', response.updateDate)
        core.setOutput('url', response.downloadUrl)
    } catch (e) {
        core.setFailed(e)
    }
}

run()
