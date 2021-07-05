import shuffle from "./shuffle.js";
import { getDataURL } from "./data-url.js";
// lista dos nomes dos icones
const valueList = ["abacaxi", "banana", "batata-frita", "bolo", "brocolis", "cachorro-quente", "cenoura", "cereja", "croissant", "cupcake", "donut", "framboesa", "hamburguer", "limao", "maca", "melancia", "morango", "ovo-frito", "pera", "picole", "pipoca", "presunto", "queijo", "salsicha", "sorvete", "taco"];
class Piece {
    constructor(name, htmlElement) {
        this.checked = false;
        this.dataShow = null;
        this.name = name;
        this.ref = $(htmlElement);
    }
    static startData(name, callback) {
        getDataURL(`./icons/${name}.png`, callback);
    }
    startDataShow(callback) {
        Piece.startData(this.name, (dataShow) => {
            callback(this.dataShow = dataShow);
        });
        return this;
    }
    static startDataHide(callback) {
        Piece.startData("pergunta", (dataHide) => {
            callback(this.dataHide = dataHide);
        });
        return this;
    }
    getChecked() {
        return this.checked;
    }
    check() {
        this.checked = true;
        this.ref.finish().fadeTo(150, 0.5);
        return this;
    }
    toogle(name, data) {
        const alt = `icone ${name}`;
        this.ref.attr("alt", alt)
            .attr("title", alt).finish()
            .animate({ marginTop: "-9px", marginBottom: "9px", opacity: 0.5 }, 150, function () {
            $(this).attr("src", data);
        }).animate({ marginTop: "0px", marginBottom: "0px", opacity: 1.0 }, 150);
        return this;
    }
    show() {
        if (this.dataShow !== null) {
            this.toogle(this.name, this.dataShow);
        }
        return this;
    }
    hide() {
        if (Piece.dataHide !== null) {
            this.toogle("pergunta", Piece.dataHide);
        }
        return this;
    }
    finish() {
        this.ref.finish();
        return this;
    }
    wrong() {
        this.finish();
        for (let i = 6; i >= 0; i -= 2) {
            this.ref.animate({ marginLeft: `${i}px`, marginRight: `${-i}px` }, 50)
                .animate({ marginLeft: `${-i}px`, marginRight: `${+i}px` }, 50);
        }
        return this;
    }
    start(callback) {
        // preload
        return this.startDataShow(callback).finish().hide();
    }
    disable() {
        this.ref.finish().fadeTo(150, 0.5);
        return this;
    }
    static equals(piece1, piece2) {
        return piece1.name === piece2.name;
    }
}
Piece.dataHide = null;
function createPairNameList(valueList, length) {
    const pairNameList = shuffle(valueList).slice(0, length / 2);
    return shuffle(pairNameList, pairNameList);
}
function createPieceList(pairNameList, ref) {
    const pieceList = [];
    ref.each(function (index) {
        pieceList[index] = new Piece(pairNameList[index], this);
    });
    return pieceList;
}
// document ready
$(function () {
    // start dataHide
    Piece.startDataHide(function () {
        const pieceElement = $(".piece");
        let enabled = false;
        let timeout = 0;
        let pieceList = null;
        let piece1 = null;
        let piece2 = null;
        pieceElement.each(function (index) {
            // add onclick event
            $(this).on("click", function () {
                // enable to click and pieceList exists 
                if (enabled && pieceList !== null) {
                    // piece is not checked
                    if (!pieceList[index].getChecked()) {
                        // piece1 not selected
                        if (piece1 === null) {
                            piece1 = pieceList[index].show();
                        }
                        else if (piece1 !== pieceList[index] && piece2 === null) {
                            piece2 = pieceList[index].show();
                            if (piece1 !== null && piece2 !== null) {
                                // pieces equals
                                if (Piece.equals(piece1, piece2)) {
                                    timeout = window.setTimeout(() => {
                                        if (piece1 !== null && piece2 !== null) {
                                            piece1.check();
                                            piece2.check();
                                            piece1 = null;
                                            piece2 = null;
                                        }
                                    }, 400);
                                }
                                else
                                    timeout = window.setTimeout(() => {
                                        if (piece1 !== null && piece2 !== null) {
                                            piece1.hide();
                                            piece2.hide();
                                            piece1 = null;
                                            piece2 = null;
                                        }
                                    }, 800);
                            }
                        }
                        else
                            pieceList[index].wrong();
                    }
                    else
                        pieceList[index].wrong();
                }
            });
        });
        function start() {
            enabled = false;
            window.clearTimeout(timeout);
            timeout = 0;
            const pairNameList = createPairNameList(valueList, pieceElement.length);
            pieceList = createPieceList(pairNameList, pieceElement);
            for (const piece of pieceList) {
                piece.disable();
            }
            (function interval(index) {
                if (index < pieceList.length) {
                    pieceList[index++].start(function () {
                        return window.setTimeout(() => interval(index), 50);
                    });
                }
                else
                    enabled = true;
            })(0);
            piece1 = null;
            piece2 = null;
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
            if (enabled && over && event.key === "r") {
                pieceList.forEach(function (piece) {
                    if (!piece.getChecked() && piece !== piece1 && piece !== piece2) {
                        piece.show().finish();
                    }
                });
            }
        });
        $(document).on("keyup", function (event) {
            if (event.key === "r") {
                pieceList.forEach(function (piece) {
                    if (!piece.getChecked() && piece !== piece1 && piece !== piece2) {
                        piece.hide().finish();
                    }
                });
            }
        });
    });
});
