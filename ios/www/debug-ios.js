(function () {
    const logs = [];

    function render() {
        if (!document.body) return;

        let box = document.getElementById("rodmod-ios-debug");

        if (!box) {
            box = document.createElement("pre");
            box.id = "rodmod-ios-debug";

            Object.assign(box.style, {
                position: "fixed",
                top: "0",
                left: "0",
                width: "100%",
                maxHeight: "55vh",
                overflow: "auto",
                margin: "0",
                padding: "8px",
                zIndex: "2147483647",
                background: "rgba(0,0,0,0.90)",
                color: "#00ff66",
                font: "11px monospace",
                whiteSpace: "pre-wrap",
                pointerEvents: "none"
            });

            document.body.appendChild(box);
        }

        box.textContent = logs.slice(-40).join("\n");
    }

    function log(message) {
        const text = "[DEBUG] " + message;
        logs.push(text);
        console.log(text);
        render();
    }

    window.__rodmodDebug = log;

    log("debug-ios.js carregado");
    log("URL: " + location.href);

    window.addEventListener("error", function (event) {
        if (event.target && event.target !== window) {
            log(
                "RESOURCE ERROR: " +
                (event.target.src ||
                 event.target.href ||
                 event.target.tagName)
            );
            return;
        }

        log(
            "JS ERROR: " +
            event.message +
            " @ " +
            event.filename +
            ":" +
            event.lineno
        );
    }, true);

    window.addEventListener("unhandledrejection", function (event) {
        log("PROMISE ERROR: " + String(event.reason));
    });

    document.addEventListener("DOMContentLoaded", function () {
        log("DOMContentLoaded");
        render();
    });

    document.addEventListener("deviceready", function () {
        log("deviceready");
    });

    const NativeWebSocket = window.WebSocket;

    if (NativeWebSocket) {
        function DebugWebSocket(url, protocols) {
            log("WebSocket -> " + url);

            const ws = protocols === undefined
                ? new NativeWebSocket(url)
                : new NativeWebSocket(url, protocols);

            ws.addEventListener("open", function () {
                log("WebSocket OPEN -> " + url);
            });

            ws.addEventListener("error", function () {
                log("WebSocket ERROR -> " + url);
            });

            ws.addEventListener("close", function (event) {
                log(
                    "WebSocket CLOSE " +
                    event.code +
                    " -> " +
                    url
                );
            });

            return ws;
        }

        DebugWebSocket.prototype = NativeWebSocket.prototype;

        ["CONNECTING", "OPEN", "CLOSING", "CLOSED"].forEach(function (key) {
            Object.defineProperty(DebugWebSocket, key, {
                value: NativeWebSocket[key]
            });
        });

        window.WebSocket = DebugWebSocket;
    }

    function snapshot(label) {
        let state = "N/A";

        try {
            state =
                typeof window.jv !== "undefined"
                    ? String(window.jv.state)
                    : "jv inexistente";
        } catch (e) {
            state = "erro";
        }

        log(
            label +
            " | cordova=" + !!window.cordova +
            " PIXI=" + typeof window.PIXI +
            " mlmeta=" + typeof window.mlmeta +
            " jv=" + typeof window.jv +
            " jv.state=" + state
        );
    }

    setTimeout(() => snapshot("1s"), 1000);
    setTimeout(() => snapshot("3s"), 3000);
    setTimeout(() => snapshot("8s"), 8000);
})();
