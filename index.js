import core from '@actions/core'
import fetch from 'node-fetch'

const qqJsFileReg = /https:\/\/[\w\-\.\/]+\/js\/pc.+?\.js/g
const qqApkUrlReg = /https:\/\/down.*android_apk\/Android_.*\.apk/g

async function run() {
    try {
        const qqHtmlContent = await fetch("https://im.qq.com/index/", {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
            }
        });
        const qqJsFileUrl = qqJsFileReg.exec(await qqHtmlContent.text());

        if (!qqJsFileUrl) {
            throw new Error("Unable to find initial state")
        }

        const jsFileContnet = await fetch(qqJsFileUrl[0], {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.132 Safari/537.36"
            }
        });

        const qqApkUrl = qqApkUrlReg.exec(await jsFileContnet.text())
        if (!qqApkUrl) {
            throw new Error("Unable to find APK URL")
        }

        console.log(qqApkUrl[0])
        core.setOutput('url', qqApkUrl[0])
    } catch (e) {
        core.setFailed(e)
    }
}

run()
