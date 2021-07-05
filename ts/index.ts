import shuffle from "./shuffle.js";

import { Data, DataURLCallback, DataCallback, getDataURL } from "./data-url.js";

// lista dos nomes dos icones
const valueList = ["abacaxi", "banana", "batata-frita", "bolo", "brocolis", "cachorro-quente", "cenoura", "cereja", "croissant", "cupcake", "donut", "framboesa", "hamburguer", "limao", "maca", "melancia", "morango", "ovo-frito", "pera", "picole", "pipoca", "presunto", "queijo", "salsicha", "sorvete", "taco"];

class Piece {

  private name: string;

  private ref: JQuery<HTMLElement>;

  private checked: boolean = false;

  private dataShow: Data = null;

  private static dataHide: Data = null;

  public constructor(name: string, htmlElement: HTMLElement) {

    this.name = name;

    this.ref = $(htmlElement);

  }

  private static startData(name: string, callback: DataURLCallback) {

    getDataURL(`./icons/${name}.png`, callback);

  }

  public startDataShow(callback: DataCallback) {

    if (this.dataShow === null) {

      Piece.startData(this.name, (dataShow) => {

        callback(this.dataShow = dataShow);

      });

    }

    return this;

  }

  public static startDataHide(callback: DataCallback) {

    if (this.dataHide === null) {

      Piece.startData("pergunta", (dataHide) => {

        callback(this.dataHide = dataHide);

      });

    }

    return this;

  }

  public getChecked() {

    return this.checked;

  }

  public check() {

    this.checked = true;

    this.ref.finish().fadeTo(150, 0.5);

    return this;

  }

  private toogle(name: string, data: Data) {

    const alt = `icone ${name}`;

    this.ref.attr("alt", alt)

      .attr("title", alt).finish()

      .animate({ marginTop: "-9px", marginBottom: "9px", opacity: 0.5 }, 150, function () {

        $(this).attr("src", data);

      }).animate({ marginTop: "0px", marginBottom: "0px", opacity: 1.0 }, 150);

    return this;

  }

  public show() {

    if (this.dataShow !== null) {

      this.toogle(this.name, this.dataShow);

    }

    return this;

  }

  public hide() {

    if (Piece.dataHide !== null) {

      this.toogle("pergunta", Piece.dataHide);

    }

    return this;

  }

  public wrong() {

    this.ref.finish();

    for (let i = 6; i >= 0; i -= 2) {

      this.ref.animate({ marginLeft: `${i}px`, marginRight: `${-i}px` }, 50)

        .animate({ marginLeft: `${-i}px`, marginRight: `${i}px` }, 50);

    }

    return this;

  }

  public disable() {

    this.ref.finish().fadeTo(150, 0.5);

    return this;

  }

  public finish() {

    this.ref.finish();

    return this;

  }

  public start(callback: DataCallback) {

    return this.startDataShow(callback).finish().hide();

  }

  public static equals(piece1: Piece, piece2: Piece) {

    return piece1.name === piece2.name;

  }

}

function createPairNameList(valueList: string[], length: number) {

  const pairNameList = shuffle(valueList).slice(0, length / 2);

  return shuffle(pairNameList, pairNameList);

}

function createPieceList(pairNameList: string[], ref: JQuery<HTMLElement>) {

  const pieceList: Piece[] = [];

  ref.each(function (index) {

    pieceList[index] = new Piece(pairNameList[index], this);

  })

  return pieceList;

}

interface GameData {

  freeMove: boolean;

  timeout: number;

  pieceList: Piece[] | null;

  piece1: Piece | null;

  piece2: Piece | null;

}

function gameRule(gameData: GameData, piece: Piece) {

  // piece is not checked
  if (gameData.freeMove && !piece.getChecked()) {

    // piece1 not selected
    if (gameData.piece1 === null) {

      gameData.piece1 = piece.show();

    } else if (gameData.piece1 !== piece && gameData.piece2 === null) {

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

        } else gameData.timeout = window.setTimeout(() => {

          if (gameData.piece1 !== null && gameData.piece2 !== null) {

            gameData.piece1.hide();
            gameData.piece2.hide();

            gameData.piece1 = null;
            gameData.piece2 = null;

          }

        }, 800);

      }

    } else piece.wrong();

  } else piece.wrong();

}

function start(gameData: GameData, pieceElement: JQuery<HTMLElement>) {

  if (gameData.freeMove) {

    gameData.freeMove = false;

    window.clearTimeout(gameData.timeout);

    gameData.timeout = 0;

    const pairNameList = createPairNameList(valueList, pieceElement.length);

    gameData.pieceList = createPieceList(pairNameList, pieceElement);

    for (const piece of gameData.pieceList) {

      piece.disable();

    }

    (function propagateStart(index: number) {

      if (index < gameData.pieceList.length) {

        gameData.pieceList[index++].start(function () {

          window.setTimeout(() => propagateStart(index), 50);

        });

      } else gameData.freeMove = true;

    })(0);

    gameData.piece1 = null;
    gameData.piece2 = null;

  }

}

function easterEgg(gameData: GameData) {

  let over = false;

  $("#link").on("pointerover", function () {

    over = true;

  });

  $("#link").on("pointerout", function () {

    over = false;

  });

  $(document).on("keydown", function (event) {

    if (gameData.freeMove && over && event.key === "r") {

      gameData.pieceList!.forEach(function (piece) {

        if (!piece.getChecked() && piece !== gameData.piece1 && piece !== gameData.piece2) {

          piece.show().finish();

        }

      });

    }

  });

  $(document).on("keyup", function (event) {

    if (event.key === "r") {

      gameData.pieceList!.forEach(function (piece) {

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

    const gameData: GameData = {

      freeMove: true,

      timeout: 0,

      pieceList: null,

      piece1: null,

      piece2: null

    }

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