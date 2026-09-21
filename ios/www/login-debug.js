(function () {
    const logs = [];

    function render() {
        if (!document.body) return;

        let box = document.getElementById("ios-login-debug");

        if (!box) {
            box = document.createElement("pre");
            box.id = "ios-login-debug";

            Object.assign(box.style, {
                position: "fixed",
                left: "0",
                bottom: "0",
                width: "100%",
                maxHeight: "38vh",
                overflow: "auto",
                margin: "0",
                padding: "7px",
                zIndex: "2147483647",
                background: "rgba(0,0,0,.88)",
                color: "#00ff66",
                font: "10px monospace",
                whiteSpace: "pre-wrap",
                pointerEvents: "none"
            });

            document.body.appendChild(box);
        }

        box.textContent = logs.slice(-30).join("\n");
    }

    function log(msg) {
        console.log("[LOGIN DEBUG] " + msg);
        logs.push("[DEBUG] " + msg);
        render();
    }

    window.addEventListener("error", function (e) {
        log("JS ERROR: " + (e.message || "erro desconhecido"));
    });

    document.addEventListener("deviceready", function () {
        log("deviceready OK");
    });

    /*
     * Intercepta pacotes enviados sem exibir
     * usuário ou senha.
     */
    if (window.WebSocket && WebSocket.prototype.send) {
        const originalSend = WebSocket.prototype.send;

        WebSocket.prototype.send = function (data) {
            try {
                const packet = JSON.parse(data);

                if (packet.type === "login") {
                    log(
                        "SEND login | socket=" +
                        this.readyState +
                        " | credenciais ocultas"
                    );
                } else if (packet.type === "guest") {
                    log(
                        "SEND guest | socket=" +
                        this.readyState
                    );
                } else if (packet.type === "client") {
                    log(
                        "SEND client | mobile=" +
                        packet.mobile +
                        " | socket=" +
                        this.readyState
                    );
                } else {
                    log(
                        "SEND " +
                        packet.type +
                        " | socket=" +
                        this.readyState
                    );
                }
            } catch (e) {
                log("SEND não-JSON");
            }

            return originalSend.call(this, data);
        };
    }

    let observedSocket = null;

    setInterval(function () {
        if (
            typeof window.connection !== "undefined" &&
            window.connection &&
            window.connection !== observedSocket
        ) {
            observedSocket = window.connection;

            log(
                "WebSocket detectado | state=" +
                observedSocket.readyState
            );

            observedSocket.addEventListener("open", function () {
                log("WebSocket OPEN");
            });

            observedSocket.addEventListener("close", function (e) {
                log(
                    "WebSocket CLOSE | code=" +
                    e.code
                );
            });

            observedSocket.addEventListener("error", function () {
                log("WebSocket ERROR");
            });

            observedSocket.addEventListener("message", function (e) {
                try {
                    const packet = JSON.parse(e.data);

                    if (packet.type) {
                        log("RECV " + packet.type);
                    } else {
                        log("RECV pacote sem type");
                    }
                } catch (_) {
                    log("RECV não-JSON");
                }
            });
        }
    }, 250);

    setInterval(function () {
        if (
            typeof window.jv === "undefined" ||
            !jv.login_dialog
        ) {
            return;
        }

        const login = jv.login_dialog.okay;
        const guest = jv.login_dialog.guest;

        if (
            login &&
            login.on_click &&
            !login.__iosDebugWrapped
        ) {
            const original = login.on_click;

            login.on_click = function () {
                log(
                    "BOTÃO LOGIN clicado | socket=" +
                    (
                        window.connection
                            ? window.connection.readyState
                            : "sem conexão"
                    )
                );

                return original.apply(this, arguments);
            };

            login.__iosDebugWrapped = true;
            log("Botão Login monitorado");
        }

        if (
            guest &&
            guest.on_click &&
            !guest.__iosDebugWrapped
        ) {
            const original = guest.on_click;

            guest.on_click = function () {
                log(
                    "BOTÃO GUEST clicado | socket=" +
                    (
                        window.connection
                            ? window.connection.readyState
                            : "sem conexão"
                    )
                );

                return original.apply(this, arguments);
            };

            guest.__iosDebugWrapped = true;
            log("Botão Guest monitorado");
        }
    }, 500);

    setTimeout(function () {
        log("login-debug.js ativo");
    }, 500);
})();
