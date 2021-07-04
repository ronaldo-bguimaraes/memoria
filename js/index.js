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
class Piece {
    constructor(name, htmlElement) {
        this.checked = false;
        this.name = name;
        this.jqueryRef = $(htmlElement);
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
    toogle(name) {
        this.jqueryRef.finish();
        this.jqueryRef.fadeTo(150, 0.0, () => {
            this.jqueryRef.attr("src", `./icons/${name}.png`);
        }).fadeTo(150, 1.0);
        return this;
    }
    show() {
        return this.toogle(this.name);
    }
    hide() {
        return this.toogle("pergunta");
    }
    wrong() {
        this.jqueryRef.finish();
        for (let i = 6; i >= 0; i -= 2) {
            this.jqueryRef.animate({ marginLeft: `${+i}px`, marginRight: `${-i}px` }, 50);
            this.jqueryRef.animate({ marginLeft: `${-i}px`, marginRight: `${+i}px` }, 50);
        }
        return this;
    }
    start() {
        this.hide();
        this.jqueryRef.finish();
        this.jqueryRef.fadeTo(150, 0.5).fadeTo(150, 1.0);
    }
    static test(piece1, piece2) {
        if (piece1 !== null && piece2 !== null) {
            if (piece1.name === piece2.name) {
                piece1.check();
                piece2.check();
            }
            else {
                piece1.hide();
                piece2.hide();
            }
        }
    }
}
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
    let timeout = 0;
    let pieceList = null;
    let piece1 = null;
    let piece2 = null;
    function onclick(piece) {
        if (!piece.getChecked()) {
            if (piece1 === null) {
                piece1 = piece.show();
            }
            else if (piece1 !== piece && piece2 === null) {
                piece2 = piece.show();
                timeout = setTimeout(function () {
                    Piece.test(piece1, piece2);
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
    function start() {
        piece1 = null;
        piece2 = null;
        const pairNameList = createPairNameList(valueList, jqueryRef.length);
        pieceList = createPieceList(pairNameList, jqueryRef);
        for (const piece of pieceList) {
            piece.start();
        }
        clearTimeout(timeout);
    }
    // inicia
    start();
    // adiciona evento ao botao
    $("#restart").on("click", start);
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
