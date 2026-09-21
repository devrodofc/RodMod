document.addEventListener("deviceready", async function () {
    const status = document.getElementById("status");

    try {
        status.textContent = "Carregando RodMod...";

        // Lê o RodMod que está empacotado dentro do próprio app.
        const response = await fetch("rodmod-mystera.js");

        if (!response.ok) {
            throw new Error("Não foi possível carregar rodmod-mystera.js");
        }

        const rodmodSource = await response.text();

        const browser = cordova.InAppBrowser.open(
            "https://www.mysteralegacy.com/play/",
            "_blank",
            "location=no,toolbar=no,hidden=yes,disallowoverscroll=yes"
        );

        let shown = false;

        function injectRodMod() {
            // Primeiro verifica se o jogo web já criou o objeto jv.
            browser.executeScript(
                {
                    code: `
                        typeof window.jv !== "undefined" &&
                        typeof window.jv.state !== "undefined";
                    `
                },
                function (result) {
                    if (!result || !result[0]) {
                        setTimeout(injectRodMod, 250);
                        return;
                    }

                    // Evita carregar o RodMod duas vezes.
                    browser.executeScript(
                        {
                            code: `
                                typeof window.dsk !== "undefined";
                            `
                        },
                        function (alreadyLoaded) {
                            if (alreadyLoaded && alreadyLoaded[0]) {
                                if (!shown) {
                                    browser.show();
                                    shown = true;
                                }
                                return;
                            }

                            browser.executeScript(
                                {
                                    code: rodmodSource
                                },
                                function () {
                                    console.log("[RodMod iOS] RodMod injetado.");

                                    if (!shown) {
                                        browser.show();
                                        shown = true;
                                    }
                                }
                            );
                        }
                    );
                }
            );
        }

        browser.addEventListener("loadstop", function (event) {
            console.log("[RodMod iOS] Página carregada:", event.url);

            if (
                event.url &&
                event.url.includes("mysteralegacy.com")
            ) {
                injectRodMod();
            }
        });

        browser.addEventListener("loaderror", function (event) {
            console.error("[RodMod iOS] Erro:", event.message);

            status.textContent =
                "Erro ao carregar Mystera: " + event.message;
        });

    } catch (error) {
        console.error(error);
        status.textContent = "Erro: " + error.message;
    }
});
