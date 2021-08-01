import "../node_modules/jquery/dist/jquery.min.js";
import "../node_modules/bootstrap/dist/js/bootstrap.min.js";
import { getPieceList, Piece } from "./piece.js";
const valueList = ["abacaxi", "banana", "batata-frita", "bolo", "brocolis", "cachorro-quente", "cenoura", "cereja", "croissant", "cupcake", "donut", "framboesa", "hamburguer", "limao", "maca", "melancia", "morango", "ovo-frito", "pera", "picole", "pipoca", "presunto", "queijo", "salsicha", "sorvete", "taco"];
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
        gameData.pieceList = getPieceList(valueList, pieceElement);
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
        if (gameData.pieceList !== null) {
            if (gameData.freeMove && over && event.key === "r") {
                gameData.pieceList.forEach(function (piece) {
                    if (!piece.getChecked() && piece !== gameData.piece1 && piece !== gameData.piece2) {
                        piece.show().finish();
                    }
                });
            }
        }
    });
    $(document).on("keyup", function (event) {
        if (event.key === "r") {
            if (gameData.pieceList !== null) {
                gameData.pieceList.forEach(function (piece) {
                    if (!piece.getChecked() && piece !== gameData.piece1 && piece !== gameData.piece2) {
                        piece.hide().finish();
                    }
                });
            }
        }
    });
}
// document ready
$(function () {
    // start dataHide
    Piece.startDataImageHide(function () {
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
