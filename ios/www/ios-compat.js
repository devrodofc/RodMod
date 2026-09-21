(function () {
    // Compatibilidade com chamadas existentes no cliente Android.

    if (typeof window.StatusBar === "undefined") {
        window.StatusBar = {
            hide: function () {
                console.log("[iOS Compat] StatusBar.hide ignorado");
            }
        };
    }

    if (!screen.orientation) {
        try {
            Object.defineProperty(screen, "orientation", {
                value: {},
                configurable: true
            });
        } catch (e) {
            console.log("[iOS Compat] screen.orientation indisponível");
        }
    }

    if (screen.orientation &&
        typeof screen.orientation.lock !== "function") {

        screen.orientation.lock = function () {
            console.log("[iOS Compat] orientation.lock ignorado");
            return Promise.resolve();
        };
    }

    if (typeof window.AndroidFullScreen === "undefined") {
        window.AndroidFullScreen = {
            showUnderStatusBar: function () {
                console.log("[iOS Compat] showUnderStatusBar ignorado");
            },

            showUnderSystemUI: function () {
                console.log("[iOS Compat] showUnderSystemUI ignorado");
            },

            immersiveMode: function () {
                console.log("[iOS Compat] immersiveMode ignorado");
            }
        };
    }
})();
