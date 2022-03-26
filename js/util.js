function createMat(ROWS, COLS) {
    var mat = []
    for (var i = 0; i < ROWS; i++) {
        var row = []
        for (var j = 0; j < COLS; j++) {
            row.push('')
        }
        mat.push(row)
    }
    return mat
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
}

function getRadioValue(elRadioBtns,theme = false) {
    for (var button of elRadioBtns) {
        if (button.checked) {
            if (theme) return button.value
            return { SIZE: button.size, MINES: +button.value }
        }
    }
}

function generateItem(item, itemImg) {
    var itemIndex = getItemPosition()
    while (gBoard[itemIndex.i][itemIndex.j].gameElement) itemIndex = getItemPosition()
    gBoard[itemIndex.i][itemIndex.j].gameElement = item
    renderCell(itemIndex, itemImg)
}

function getItemPosition() {
    var row = getRandomInt(0, gBoard[0].length)
    var col = getRandomInt(0, gBoard.length)
    return { i: row, j: col }
}

function setTime() {
    ++totalSeconds;
    secondsLabel.innerHTML = pad(totalSeconds % 60);
    minutesLabel.innerHTML = pad(parseInt(totalSeconds / 60));
}

function pad(val) {
    var valString = val + "";
    if (valString.length < 2) {
        return "0" + valString;
    } else {
        return valString;
    }
}

function resetTimer(id){
	totalSeconds = 0
	clearInterval(id)
	minutesLabel.innerHTML = "00"
	secondsLabel.innerHTML = "00"
}

function getIdName(Idx) {
	var cellClass = 'cell-' + Idx.i + '-' + Idx.j;
	return cellClass;
}

function openModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'block';
}

function closeModal() {
    var elModal = document.querySelector('.modal')
    elModal.style.display = 'none'
}