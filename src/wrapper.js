/* eslint-disable */
const w = typeof unsafeWindow == "object" ? unsafeWindow : window;

// GM APIs glue
const _GM = typeof GM == "object" ? GM : undefined;
const gmId = "" + Math.random();
w[gmId] = _GM;

function getRandL() {
    return String.fromCharCode(97 + Math.floor(Math.random() * 26));
}

// script loader
new Promise((resolve) => {
    const id = "" + Math.random();
    w[id] = resolve;

    const stackN = 9;
    let loaderIntro = "";
    for (let i = 0; i < stackN; i++) {
        loaderIntro += `(function ${getRandL()}(){`;
    }
    const loaderOutro = "})()".repeat(stackN);
    const mockUrl = "https://c.amazon-adsystem.com/aax2/apstag.js";

    Function(
        `${loaderIntro}const d=new Image();window['${id}'](d);delete window['${id}'];document.body.prepend(d)${loaderOutro}//# sourceURL=${mockUrl}`
    )();
}).then((d) => {
    d.style.display = "none";
    d.src =
        "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    d.once = false;
    d.setAttribute(
        "onload",
        `if(this.once)return;this.once=true;this.remove();const GM=window['${gmId}'];delete window['${gmId}'];(` +
            function a() {
                /** script code here */
            }.toString() +
            ")()"
    );
});
