import shuffle from "./shuffle.js";
import { getDataURL } from "./data-url.js";
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
        if (this.dataShow === null) {
            Piece.startData(this.name, (dataShow) => {
                callback(this.dataShow = dataShow);
            });
        }
        return this;
    }
    static startDataHide(callback) {
        if (this.dataHide === null) {
            Piece.startData("pergunta", (dataHide) => {
                callback(this.dataHide = dataHide);
            });
        }
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
    wrong() {
        this.ref.finish();
        for (let i = 6; i >= 0; i -= 2) {
            this.ref.animate({ marginLeft: `${i}px`, marginRight: `${-i}px` }, 50)
                .animate({ marginLeft: `${-i}px`, marginRight: `${i}px` }, 50);
        }
        return this;
    }
    disable() {
        this.ref.finish().fadeTo(150, 0.5);
        return this;
    }
    finish() {
        this.ref.finish();
        return this;
    }
    start(callback) {
        return this.startDataShow(callback).finish().hide();
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
function gameRule(gameData, piece) {
    // piece is not checked
    if (gameData.freeMove && !piece.getChecked()) {
        // piece1 not selected
        if (gameData.piece1 === null) {
            gameData.piece1 = piece.show();
        }
        else if (gameData.piece1 !== piece && gameData.piece2 === null) {
            gameData.piece2 = piece.show();
            if (gameData.piece1 !== null && gameData.piece2 !== null) {
                // pieces equals
                if (Piece.equals(gameData.piece1, gameData.piece2)) {
                    gameData.timeout = window.setTimeout(() => {
                        if (gameData.piece1 !== null && gameData.piece2 !== null) {
                            gameData.piece1.check();
                            gameData.piece2.check();
                            gameData.piece1 = null;
                            gameData.piece2 = null;
                        }
                    }, 400);
                }
                else
                    gameData.timeout = window.setTimeout(() => {
                        if (gameData.piece1 !== null && gameData.piece2 !== null) {
                            gameData.piece1.hide();
                            gameData.piece2.hide();
                            gameData.piece1 = null;
                            gameData.piece2 = null;
                        }
                    }, 800);
            }
        }
        else
            piece.wrong();
    }
    else
        piece.wrong();
}
function start(gameData, pieceElement) {
    if (gameData.freeMove) {
        gameData.freeMove = false;
        window.clearTimeout(gameData.timeout);
        gameData.timeout = 0;
        const pairNameList = createPairNameList(valueList, pieceElement.length);
        gameData.pieceList = createPieceList(pairNameList, pieceElement);
        for (const piece of gameData.pieceList) {
            piece.disable();
        }
        (function propagateStart(index) {
            if (index < gameData.pieceList.length) {
                gameData.pieceList[index++].start(function () {
                    window.setTimeout(() => propagateStart(index), 50);
                });
            }
            else
                gameData.freeMove = true;
        })(0);
        gameData.piece1 = null;
        gameData.piece2 = null;
    }
}
function easterEgg(gameData) {
    let over = false;
    $("#link").on("pointerover", function () {
        over = true;
    });
    $("#link").on("pointerout", function () {
        over = false;
    });
    $(document).on("keydown", function (event) {
        if (gameData.freeMove && over && event.key === "r") {
            gameData.pieceList.forEach(function (piece) {
                if (!piece.getChecked() && piece !== gameData.piece1 && piece !== gameData.piece2) {
                    piece.show().finish();
                }
            });
        }
    });
    $(document).on("keyup", function (event) {
        if (event.key === "r") {
            gameData.pieceList.forEach(function (piece) {
                if (!piece.getChecked() && piece !== gameData.piece1 && piece !== gameData.piece2) {
                    piece.hide().finish();
                }
            });
        }
    });
}
// document ready
$(function () {
    // start dataHide
    Piece.startDataHide(function () {
        const pieceElement = $(".piece");
        const gameData = {
            freeMove: true,
            timeout: 0,
            pieceList: null,
            piece1: null,
            piece2: null
        };
        pieceElement.each(function (index) {
            // add onclick event
            $(this).on("click", function () {
                // enable to click and pieceList exists 
                if (gameData.pieceList !== null) {
                    gameRule(gameData, gameData.pieceList[index]);
                }
            });
        });
        // inicia
        start(gameData, pieceElement);
        // adiciona evento ao botao
        $("#restart").on("click", function () {
            start(gameData, pieceElement);
        });
        // easter egg
        easterEgg(gameData);
    });
});
