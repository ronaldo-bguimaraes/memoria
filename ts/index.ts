// lista dos nomes dos icones
const valueList = ["abacaxi", "banana", "batata-frita", "bolo", "brocolis", "cachorro-quente", "cenoura", "cereja", "croissant", "cupcake", "donut", "framboesa", "hamburguer", "limao", "maca", "melancia", "morango", "ovo-frito", "pera", "picole", "pipoca", "presunto", "queijo", "salsicha", "sorvete", "taco"];

// embaralhador de array
function shuffle(...array: any[]) {

  let _array = array.flat();

  for (let i = 0; i < _array.length; i++) {

    const j = Math.floor(Math.random() * _array.length);

    [_array[i], _array[j]] = [_array[j], _array[i]];

  }

  return _array;

}

async function getDataURL(src: string) {

  const response = await fetch(src);

  const blob = await response.blob();

  const reader = new FileReader();

  return new Promise<string>(function (resolve, reject) {

    reader.addEventListener("loadend", () => {

      resolve(<string>reader.result);

    })

    reader.readAsDataURL(blob);

  })

}

class Piece {

  private name: string;

  private jqueryRef: JQuery<HTMLElement>;

  private checked: boolean = false;

  private dataShow: string | null = null;

  private static dataHide: string | null = null;

  public constructor(name: string, htmlElement: HTMLElement) {

    this.name = name;

    this.jqueryRef = $(htmlElement);

  }

  public async getDataShow() {

    if (this.dataShow === null) {

      return this.dataShow = await getDataURL(`./icons/${this.name}.png`);

    }

    else return this.dataShow;

  }

  public static async getDataHide() {

    if (this.dataHide === null) {

      return this.dataHide = await getDataURL(`./icons/pergunta.png`);

    }

    else return this.dataHide;

  }

  public getName() {

    return this.name;

  }

  public getJqueryRef() {

    return this.jqueryRef;

  }

  public getChecked() {

    return this.checked;

  }

  public check() {

    this.jqueryRef.finish();

    this.checked = true;

    this.jqueryRef.fadeTo(150, 0.2);

    return this;

  }

  private toogle(name: string, data: string) {

    const desc = `icone ${name}`;

    this.jqueryRef.attr("alt", desc).attr("title", desc);

    this.jqueryRef.finish();

    this.jqueryRef.fadeTo(150, 0.0, () => {

      this.jqueryRef.attr("src", data);

    }).fadeTo(150, 1.0);

    return this;

  }

  public async show() {

    if (this.dataShow !== null) {

      return this.toogle(this.name, await this.getDataShow());

    }

    return null;

  }

  public async hide() {

    if (Piece.dataHide !== null) {

      return this.toogle("pergunta", await Piece.getDataHide());

    }

    return null;

  }

  public wrong() {

    this.jqueryRef.finish();

    for (let i = 6; i >= 0; i -= 2) {

      this.jqueryRef.animate({ marginLeft: `${+i}px`, marginRight: `${-i}px` }, 50);

      this.jqueryRef.animate({ marginLeft: `${-i}px`, marginRight: `${+i}px` }, 50);

    }

    return this;

  }

  public async start() {

    // preload
    this.dataShow = await this.getDataShow();

    // hide if show
    this.hide();

    // finish animations
    this.jqueryRef.finish();

    // start effect
    this.jqueryRef.fadeTo(150, 0.5).fadeTo(150, 1.0);

  }

}

function createPairNameList(valueList: string[], length: number) {

  const pairNameList = (function () {

    const _pairNameList = shuffle(valueList).slice(0, length / 2);

    return shuffle(_pairNameList, _pairNameList);

  })();

  return pairNameList;

}

function createPieceList(pairNameList: string[], jqueryRef: JQuery<HTMLElement>) {

  const pieceList: Piece[] = [];

  jqueryRef.each(function (index) {

    pieceList[index] = new Piece(pairNameList[index], this);

  })

  return pieceList;

}

// document ready
$(function () {

  const jqueryRef = $(".piece");

  let timeout: number = 0;

  let pieceList: Piece[] | null = null;

  let piece1: Piece | null = null;

  let piece2: Piece | null = null;

  async function onclick(piece: Piece) {

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

      else piece.wrong();
    }

    else piece.wrong();
  }

  jqueryRef.each(function (index) {

    $(this).on("click", function () {

      if (pieceList !== null) {

        onclick.call(this, pieceList[index]);

      }

    })

  })

  function start() {

    piece1 = null;

    piece2 = null;

    const pairNameList = createPairNameList(valueList, jqueryRef.length);

    pieceList = createPieceList(pairNameList, jqueryRef);

    pieceList.forEach(piece => piece.start());

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

  })

  $("#link").on("pointerout", function () {

    over = false;

  })

  $(document).on("keydown", function (event) {

    if (over && event.key === "r") {

      pieceList!.forEach(function (piece) {

        if (!piece.getChecked() && piece !== piece1 && piece !== piece2) {

          piece.show();

          piece.getJqueryRef().finish();

        }

      })

    }

  })

  $(document).on("keyup", function (event) {

    if (event.key === "r") {

      pieceList!.forEach(function (piece) {

        if (!piece.getChecked() && piece !== piece1 && piece !== piece2) {

          piece.hide();

          piece.getJqueryRef().finish();

        }

      })

    }

  })

})