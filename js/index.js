import shuffle from "./shuffle.js";
import getDataURL from "./data-url.js";
// lista dos nomes dos icones
const valueList = ["abacaxi", "banana", "batata-frita", "bolo", "brocolis", "cachorro-quente", "cenoura", "cereja", "croissant", "cupcake", "donut", "framboesa", "hamburguer", "limao", "maca", "melancia", "morango", "ovo-frito", "pera", "picole", "pipoca", "presunto", "queijo", "salsicha", "sorvete", "taco"];
class Piece {
    constructor(name, htmlElement) {
        this.checked = false;
        this.dataShow = null;
        this.enabled = true;
        this.name = name;
        this.jqueryRef = $(htmlElement);
    }
    startDataShow(callback) {
        const $this = this;
        getDataURL(`./icons/${this.name}.png`, function (dataShow) {
            callback($this.dataShow = dataShow);
        });
    }
    static startDataHide(callback) {
        const $this = this;
        getDataURL(`./icons/pergunta.png`, function (dataHide) {
            callback.call($this, $this.dataHide = dataHide);
        });
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
        const alt = `icone ${name}`;
        this.jqueryRef.attr("alt", alt).attr("title", alt).finish();
        this.jqueryRef.animate({ marginTop: "-9px", marginBottom: "+9px", opacity: 0.5 }, 150, () => {
            this.jqueryRef.attr("src", data);
        }).animate({ marginTop: "-0px", marginBottom: "+0px", opacity: 1.0 }, 150);
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
    wrong() {
        this.jqueryRef.finish();
        for (let i = 6; i >= 0; i -= 2) {
            this.jqueryRef.animate({ marginLeft: `${+i}px`, marginRight: `${-i}px` }, 50);
            this.jqueryRef.animate({ marginLeft: `${-i}px`, marginRight: `${+i}px` }, 50);
        }
        return this;
    }
    start(callback) {
        // preload
        this.startDataShow(callback);
        // finish animations
        this.jqueryRef.finish();
        // hide if show
        this.hide();
        return this;
    }
    enable() {
        if (!this.enabled) {
            this.enabled = true;
            this.jqueryRef.finish();
            this.jqueryRef.fadeTo(150, 1.0);
        }
    }
    disable() {
        if (this.enabled) {
            this.enabled = false;
            this.jqueryRef.finish();
            this.jqueryRef.fadeTo(150, 0.5);
        }
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
    // start dataHide
    Piece.startDataHide(function () {
        const jqueryRef = $(".piece");
        let enabled = false;
        let timeout = 0;
        let pieceList = null;
        let piece1 = null;
        let piece2 = null;
        jqueryRef.each(function (index) {
            $(this).on("click", function () {
                if (enabled && pieceList !== null) {
                    if (!pieceList[index].getChecked()) {
                        if (piece1 === null) {
                            piece1 = pieceList[index].show();
                        }
                        else if (piece1 !== pieceList[index] && piece2 === null) {
                            piece2 = pieceList[index].show();
                            timeout = window.setTimeout(function () {
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
                            }, 800);
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
            piece1 = null;
            piece2 = null;
            enabled = false;
            const pairNameList = createPairNameList(valueList, jqueryRef.length);
            pieceList = createPieceList(pairNameList, jqueryRef);
            pieceList.forEach(piece => piece.disable());
            (function interval(index) {
                if (index < pieceList.length) {
                    pieceList[index++].start(function () {
                        return window.setTimeout(() => interval(index), 50);
                    });
                }
                else
                    enabled = true;
            })(0);
            window.clearTimeout(timeout);
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
});
