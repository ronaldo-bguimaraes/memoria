// embaralhador de array
function shuffle(...array) {
    let _array = array.flat();
    for (let i = 0; i < _array.length; i++) {
        const j = Math.floor(Math.random() * _array.length);
        [_array[i], _array[j]] = [_array[j], _array[i]];
    }
    return _array;
}
export default shuffle;
