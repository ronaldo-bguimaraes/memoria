import "../jquery/dist/jquery.min.js";
import { getDataURL } from "./data-url.js";
import { shuffleArray } from "./shuffle.js";
class Piece {
    name;
    ref;
    checked = false;
    dataImageShow = null;
    static dataImageHide = null;
    constructor(name, htmlElement) {
        this.name = name;
        this.ref = $(htmlElement);
    }
    static startData(name, callback) {
        getDataURL(`./icons/${name}.png`, callback);
    }
    startDataImageShow(callback) {
        if (this.dataImageShow === null) {
            Piece.startData(this.name, (dataImageShow) => {
                callback(this.dataImageShow = dataImageShow);
            });
        }
        return this;
    }
    static startDataImageHide(callback) {
        if (this.dataImageHide === null) {
            Piece.startData("pergunta", (dataImageHide) => {
                callback(this.dataImageHide = dataImageHide);
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
        if (this.dataImageShow !== null) {
            this.toogle(this.name, this.dataImageShow);
        }
        return this;
    }
    hide() {
        if (Piece.dataImageHide !== null) {
            this.toogle("pergunta", Piece.dataImageHide);
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
        return this.startDataImageShow(callback).finish().hide();
    }
    static equals(piece1, piece2) {
        return piece1.name === piece2.name;
    }
}
function getPairNameList(valueList, length) {
    const pairNameList = shuffleArray(valueList).slice(0, length / 2);
    return shuffleArray(pairNameList, pairNameList);
}
function getPieceList(valueList, ref) {
    const pairNameList = getPairNameList(valueList, ref.length);
    const pieceList = [];
    ref.each(function (index) {
        pieceList[index] = new Piece(pairNameList[index], this);
    });
    return pieceList;
}
export { Piece, getPieceList };
