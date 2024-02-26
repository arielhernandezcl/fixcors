export default {
    async fetch(request) {
        const corsHeaders = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,HEAD,POST,OPTIONS",
            "Access-Control-Max-Age": "86400",
        };

        const PROXY_ENDPOINT = "/";


        async function handleRequest(request) {
            const url = new URL(request.url);
            let apiUrl = url.searchParams.get("api");

            request = new Request(apiUrl, request);
            request.headers.set("Origin", new URL(apiUrl).origin);
            let response = await fetch(request);
            response = new Response(response.body, response);
            response.headers.set("Access-Control-Allow-Origin", url.origin);
            response.headers.append("Vary", "Origin");

            return response;
        }

        async function handleOptions(request) {
            if (
                request.headers.get("Origin") !== null &&
                request.headers.get("Access-Control-Request-Method") !== null &&
                request.headers.get("Access-Control-Request-Headers") !== null
            ) {
                return new Response(null, {
                    headers: {
                        ...corsHeaders,
                        "Access-Control-Allow-Headers": request.headers.get(
                            "Access-Control-Request-Headers"
                        ),
                    },
                });
            } else {
                return new Response(null, {
                    headers: {
                        Allow: "GET, HEAD, POST, OPTIONS",
                    },
                });
            }
        }

        const url = new URL(request.url);
        if (url.pathname.startsWith(PROXY_ENDPOINT)) {
            if (request.method === "OPTIONS") {
                return handleOptions(request);
            } else if (
                request.method === "GET" ||
                request.method === "HEAD" ||
                request.method === "POST"
            ) {

                return handleRequest(request);
            } else {
                return new Response(null, {
                    status: 405,
                    statusText: "Method Not Allowed",
                });
            }
        } else {
            return;
        }
    },
};

//se modifica worker de cloudflare y se adapta para recibir solo url de la api de destino como parametro