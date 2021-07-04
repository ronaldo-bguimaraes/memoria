"use strict";
// lista dos nomes dos icones
const valueList = ["abacaxi", "banana", "batata-frita", "bolo", "brocolis", "cachorro-quente", "cenoura", "cereja", "croissant", "cupcake", "donut", "framboesa", "hamburguer", "limao", "maca", "melancia", "morango", "ovo-frito", "pera", "picole", "pipoca", "presunto", "queijo", "salsicha", "sorvete", "taco"];
// embaralhador de array
function shuffle(...array) {
    let _array = array.flat();
    for (let i = 0; i < _array.length; i++) {
        const j = Math.floor(Math.random() * _array.length);
        [_array[i], _array[j]] = [_array[j], _array[i]];
    }
    return _array;
}
async function getDataURL(src) {
    const response = await fetch(src);
    const blob = await response.blob();
    const reader = new FileReader();
    return new Promise(function (resolve, reject) {
        reader.addEventListener("loadend", () => {
            resolve(reader.result);
        });
        reader.readAsDataURL(blob);
    });
}
class Piece {
    constructor(name, htmlElement) {
        this.checked = false;
        this.dataShow = null;
        this.name = name;
        this.jqueryRef = $(htmlElement);
    }
    async getDataShow() {
        if (this.dataShow === null) {
            return this.dataShow = await getDataURL(`./icons/${this.name}.png`);
        }
        else
            return this.dataShow;
    }
    static async getDataHide() {
        if (this.dataHide === null) {
            return this.dataHide = await getDataURL(`./icons/pergunta.png`);
        }
        else
            return this.dataHide;
    }
    getName() {
        return this.name;
    }
    getJqueryRef() {
        return this.jqueryRef;
    }
    getChecked() {
        return this.checked;
    }
    check() {
        this.jqueryRef.finish();
        this.checked = true;
        this.jqueryRef.fadeTo(150, 0.2);
        return this;
    }
    toogle(name, data) {
        const desc = `icone ${name}`;
        this.jqueryRef.attr("alt", desc).attr("title", desc);
        this.jqueryRef.finish();
        this.jqueryRef.fadeTo(150, 0.0, () => {
            this.jqueryRef.attr("src", data);
        }).fadeTo(150, 1.0);
        return this;
    }
    async show() {
        if (this.dataShow !== null) {
            return this.toogle(this.name, await this.getDataShow());
        }
        return null;
    }
    async hide() {
        if (this.dataShow !== null) {
            return this.toogle("pergunta", await Piece.getDataHide());
        }
        return null;
    }
    wrong() {
        this.jqueryRef.finish();
        for (let i = 6; i >= 0; i -= 2) {
            this.jqueryRef.animate({ marginLeft: `${+i}px`, marginRight: `${-i}px` }, 50);
            this.jqueryRef.animate({ marginLeft: `${-i}px`, marginRight: `${+i}px` }, 50);
        }
        return this;
    }
    async start() {
        // preload
        this.dataShow = await this.getDataShow();
        // hide if show
        this.hide();
        // finish animations
        this.jqueryRef.finish();
        // start effect
        this.jqueryRef.fadeTo(150, 0.5).fadeTo(150, 1.0);
        return true;
    }
}
Piece.dataHide = null;
function createPairNameList(valueList, length) {
    const pairNameList = (function () {
        const _pairNameList = shuffle(valueList).slice(0, length / 2);
        return shuffle(_pairNameList, _pairNameList);
    })();
    return pairNameList;
}
function createPieceList(pairNameList, jqueryRef) {
    const pieceList = [];
    jqueryRef.each(function (index) {
        pieceList[index] = new Piece(pairNameList[index], this);
    });
    return pieceList;
}
// document ready
$(function () {
    const jqueryRef = $(".piece");
    let count = 0;
    let timeout = 0;
    let pieceList = null;
    let piece1 = null;
    let piece2 = null;
    async function onclick(piece) {
        if (!piece.getChecked()) {
            if (piece1 === null) {
                piece1 = await piece.show();
            }
            else if (piece1 !== piece && piece2 === null) {
                piece2 = await piece.show();
                timeout = setTimeout(function () {
                    if (piece1 !== null && piece2 !== null) {
                        if (piece1.getName() === piece2.getName()) {
                            piece1.check();
                            piece2.check();
                        }
                        else {
                            piece1.hide();
                            piece2.hide();
                        }
                    }
                    piece1 = null;
                    piece2 = null;
                }, 1000);
            }
            else
                piece.wrong();
        }
        else
            piece.wrong();
    }
    jqueryRef.each(function (index) {
        $(this).on("click", function () {
            if (pieceList !== null) {
                onclick.call(this, pieceList[index]);
            }
        });
    });
    const progress = $("#progress");
    function progressTo(value) {
        return progress.width(`${value}%`).attr("aria-valuenow", value);
    }
    function start() {
        // reset count
        count = 0;
        // reset progress
        progress.hide();
        // reset progress
        progressTo(0).show();
        piece1 = null;
        piece2 = null;
        const pairNameList = createPairNameList(valueList, jqueryRef.length);
        pieceList = createPieceList(pairNameList, jqueryRef);
        pieceList.forEach(function (piece) {
            piece.start().then(function (finish) {
                if (finish)
                    progressTo(++count / pieceList.length * 100);
            });
        });
        clearTimeout(timeout);
    }
    // inicia
    start();
    // adiciona evento ao botao
    $("#restart").on("click", start);
    // easter egg
    let over = false;
    $("#link").on("pointerover", function () {
        over = true;
    });
    $("#link").on("pointerout", function () {
        over = false;
    });
    $(document).on("keydown", function (event) {
        if (over && event.key === "r") {
            pieceList.forEach(function (piece) {
                if (!piece.getChecked() && piece !== piece1 && piece !== piece2) {
                    piece.show();
                    piece.getJqueryRef().finish();
                }
            });
        }
    });
    $(document).on("keyup", function (event) {
        if (event.key === "r") {
            pieceList.forEach(function (piece) {
                if (!piece.getChecked() && piece !== piece1 && piece !== piece2) {
                    piece.hide();
                    piece.getJqueryRef().finish();
                }
            });
        }
    });
});
