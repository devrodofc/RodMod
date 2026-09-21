document.addEventListener("deviceready", function () {
    const status = document.getElementById("status");

    status.textContent = "Abrindo Mystera...";

    const browser = cordova.InAppBrowser.open(
        "https://www.mysteralegacy.com/play/",
        "_blank",
        "location=no,toolbar=no,hidden=yes,disallowoverscroll=yes"
    );

    let finished = false;
    let attempts = 0;

    function waitForGame() {
        if (finished) return;

        attempts++;

        browser.executeScript(
            {
                code: `
                    typeof window.jv !== "undefined" &&
                    typeof window.jv.state !== "undefined";
                `
            },
            function (result) {
                if (result && result[0]) {
                    status.textContent = "Carregando RodMod...";

                    browser.executeScript(
                        {
                            file: "rodmod-mystera.js"
                        },
                        function () {
                            finished = true;

                            console.log("[RodMod iOS] RodMod injetado");

                            browser.show();
                        }
                    );

                    return;
                }

                if (attempts >= 80) {
                    // Se o jogo demorou demais, mostra pelo menos
                    // o Mystera para não ficar preso na tela branca.
                    console.log("[RodMod iOS] Timeout aguardando jv");
                    finished = true;
                    browser.show();
                    return;
                }

                setTimeout(waitForGame, 250);
            }
        );
    }

    browser.addEventListener("loadstop", function (event) {
        console.log("[RodMod iOS] loadstop:", event.url);

        if (
            !finished &&
            event.url &&
            event.url.includes("mysteralegacy.com")
        ) {
            waitForGame();
        }
    });

    browser.addEventListener("loaderror", function (event) {
        console.error(
            "[RodMod iOS] loaderror:",
            event.code,
            event.message
        );

        status.textContent =
            "Erro ao carregar Mystera: " + event.message;
    });
});
