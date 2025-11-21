// Shared gender/age mapping used across builders
// Exposes window.genderMap and a helper to expand codes safely

(function initGenderMap(global) {
    const map = {
        M: {
            label: "<b>MACHO</b> - <span class='english-text'><b>MALE</b></span>",
            color: "#99CCFF"
        },
        F: {
            label: "HEMBRA - <span class='english-text'><b>FEMALE</b></span>",
            color: "#FFCCCC"
        },
        J: {
            label: "JUVENIL - <span class='english-text'><b>JUVENILE</b></span>",
            color: "#FFFF99"
        },
        N: {
            label: "NIDO - <span class='english-text'><b>NEST</b></span>",
            color: "#FFFF99"
        },
        I: {
            label: "INMADURO - <span class='english-text'><b>IMMATURE</b></span>",
            color: "#FFFF99"
        }
    };

    function expandGenderCode(rawCode, fallbackText) {
        const code = (rawCode || '').toString().trim().toUpperCase();
        const entry = map[code];
        return entry ? entry : (fallbackText ? { label: fallbackText } : null);
    }

    global.genderMap = map;
    global.expandGenderCode = expandGenderCode;
})(window);


