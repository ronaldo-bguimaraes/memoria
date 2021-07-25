import "../node_modules/jquery/dist/jquery.min.js";

import { Data, DataCallback, DataURLCallback, getDataURL } from "./data-url.js";

import { shuffleArray } from "./shuffle.js";

class Piece {

  private name: string;

  private ref: JQuery<HTMLElement>;

  private checked: boolean = false;

  private dataImageShow: Data = null;

  private static dataImageHide: Data = null;

  public constructor(name: string, htmlElement: HTMLElement) {

    this.name = name;

    this.ref = $(htmlElement);

  }

  private static startData(name: string, callback: DataURLCallback) {

    getDataURL(`./icons/${name}.png`, callback);

  }

  public startDataImageShow(callback: DataCallback) {

    if (this.dataImageShow === null) {

      Piece.startData(this.name, (dataImageShow) => {

        callback(this.dataImageShow = dataImageShow);

      });

    }

    return this;

  }

  public static startDataImageHide(callback: DataCallback) {

    if (this.dataImageHide === null) {

      Piece.startData("pergunta", (dataImageHide) => {

        callback(this.dataImageHide = dataImageHide);

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

    if (this.dataImageShow !== null) {

      this.toogle(this.name, this.dataImageShow);

    }

    return this;

  }

  public hide() {

    if (Piece.dataImageHide !== null) {

      this.toogle("pergunta", Piece.dataImageHide);

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

    return this.startDataImageShow(callback).finish().hide();

  }

  public static equals(piece1: Piece, piece2: Piece) {

    return piece1.name === piece2.name;

  }

}

function getPairNameList(valueList: string[], length: number) {

  const pairNameList = shuffleArray(valueList).slice(0, length / 2);

  return shuffleArray(pairNameList, pairNameList);

}

function getPieceList(valueList: string[], ref: JQuery<HTMLElement>) {

  const pairNameList = getPairNameList(valueList, ref.length);

  const pieceList: Piece[] = [];

  ref.each(function (index) {

    pieceList[index] = new Piece(pairNameList[index], this);

  })

  return pieceList;

}

export { Piece, getPieceList };