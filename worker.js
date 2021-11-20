const qqJsRegex = /window\.__INITIAL_STATE__=({.+})/;
const jsonHeader = {
    "Content-Type": "application/json"
};

addEventListener("fetch", (event) => {
    event.respondWith(
        handleRequest(event.request).catch(
            (err) => new Response(JSON.stringify({
                error: {
                    message: "Internal error when fetching",
                    stack: err.stack
                }
            }), {
                status: 500,
                headers: jsonHeader
            })
        )
    );
});

/**
 * Handle API request
 * @param {Request} request
 * @returns {Promise<Response>}
 */
async function handleRequest(request) {
    const requestUrl = new URL(request.url);
    const {pathname} = requestUrl;

    // Disallow robots.txt
    if (pathname === "/robots.txt") {
        return new Response("User-agent: *\nDisallow: /");
    }

    const qqHtmlContent = await fetch("https://im.qq.com/download", {
        headers: {
            "User-Agent": [
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                "AppleWebKit/537.36 (KHTML, like Gecko)",
                "Chrome/80.0.3987.132 Safari/537.36"].join(" ")
        }
    });
    const qqRawJson = qqJsRegex.exec(await qqHtmlContent.text());
    if (!qqRawJson) {
        return new Response(JSON.stringify({
            error: {
                message: "Failed to fetch QQ page"
            }
        }), {
            status: 500,
            headers: jsonHeader
        })
    }

    const qqJson = JSON.parse(qqRawJson[1]);
    const androidQQ = qqJson['rainbowConfig']['products']['mQQ']['andQQ'];

    const andQQJson = {
        version: androidQQ['version'].trim(),
        feature: androidQQ['feature'].map(s => s.trim()),
        updateDate: androidQQ['updateDate'].trim(),
        downloadUrl: androidQQ['downloadUrl'].trim()
    };

    if (pathname.substring(1) in andQQJson) {
        return new Response(androidQQ[pathname.substring(1)]);
    } else if (pathname === "/json") {
        return new Response(JSON.stringify(andQQJson), {headers: jsonHeader});
    }

    if (pathname === "/latest") {
        const currentVersion = requestUrl.searchParams.get("current");
        if (!currentVersion) {
            return new Response(JSON.stringify({
                error: {
                    message: "Missing param(s)"
                }
            }), {
                status: 400,
                headers: jsonHeader
            })
        } else if (currentVersion !== andQQJson.version) {
            return new Response(JSON.stringify(andQQJson), {headers: jsonHeader});
        } else if (currentVersion === andQQJson.version) {
            return new Response("", {status: 304});
        }
    }
}
