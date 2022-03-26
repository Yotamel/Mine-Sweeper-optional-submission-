'use strict'
//implemented themes, undo function, fixed the problem where not enough mines would spawn causing the game to become unbeatable,fixed hearts not displaying after restarting
var gBoard; //{mineAround, isMine, isShown, isMarked}
var gLevel;
var gGame = { isOn: false, shownCount: 0, markedCount: 0, secsPassed: 0, };
var gPrevCellList; 
var gLivesLost

var elRadioBtns = document.querySelectorAll('input[name="difficulty"]')
var elSmiley = document.querySelector(".smiley")

var minutesLabel = document.getElementById("minutes");
var secondsLabel = document.getElementById("seconds");
var totalSeconds;
var gTimerInterval;
var gSmileTimeout;


const MINE_IMG = '<img src="img/mine.png" />';
const FLAG_IMG = '<img src="img/flag.png" />';
const HEART_IMG = '<img src="img/heart.png" />';

function gameInit() {
	gLevel = getRadioValue(elRadioBtns)
	gGameInit()
	gPrevCellList = []
	gLivesLost = 0
	resetTimer(gTimerInterval)
	createBoard(gLevel.SIZE)
	renderBoard(gBoard)
	renderSmiley(elSmiley)
	renderLives()
}

function createBoard(size) {
	gBoard = createMat(size, size)
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			gBoard[i][j] = { minesAround: 0, isMine: false, isShown: false, isMarked: false };
		}
	}
}

function renderBoard(board) {
	var diffClass = getClassName()
	var strHTML = '';
	for (var i = 0; i < board.length; i++) {
		strHTML += '<tr>\n';
		for (var j = 0; j < board[0].length; j++) {
			var currCell = board[i][j];
			var cellId = getIdName({ i: i, j: j })
			strHTML += '\t<td class="cell ' + diffClass + '" id="' + cellId +
				'"  onclick="cellClicked(' + i + ',' + j + ')" >\n\t</td>\n';
		}
		strHTML += '</tr>\n';
	}
	var elBoard = document.querySelector('.game-table');
	elBoard.innerHTML = strHTML;
	addEventListener()

}

function addEventListener() {
	var elCells = document.querySelectorAll(".cell")
	for (var i = 0; i < elCells.length; i++) {
		elCells[i].addEventListener('contextmenu', e => {
			e.preventDefault();
			cellRightClicked(e.target)
		});
	}
}

function cellClicked(i, j) {
	if (gGame.isOn && !gBoard[i][j].isShown) {
		var currCell = gBoard[i][j]
		var elCurCell = document.querySelector(`#cell-${i}-${j}`)
		if (currCell.isMarked) changeMark(i, j, elCurCell)
		currCell.isShown = true
		gGame.shownCount++
		elCurCell.classList.add("shown")
		if (!gPrevCellList.length) { //creating mines if it's the first time the user pressed a cell, starting timer 
			createMines(gLevel.MINES, i, j)
			gTimerInterval = setInterval(setTime, 1000);
		}
		gPrevCellList = [{ pI: i, pJ: j }]
		sweepAround(i, j)
		setTimeout(() => { checkWin() }, 800);
	}

}

function cellRightClicked(elCell) {
	if (!elCell.id) {
		elCell = elCell.parentElement
	}
	var indexes = elCell.id.split('-').splice(1)
	if (gBoard[indexes[0]][indexes[1]].isShown || !gGame.isOn) return
	gPrevCellList = [{pI:indexes[0],pJ:indexes[1]}]
	changeMark(indexes[0], indexes[1], elCell)
	checkWin()
}

function createMines(minescount, i, j) {
	var minePos = getItemPosition()
	console.log(minescount)
	for (var idx = 0; idx < minescount; idx++) {
		while (gBoard[minePos.i][minePos.j] === gBoard[i][j] || gBoard[minePos.i][minePos.j].isMine) {
			minePos = getItemPosition()
		}
		gBoard[minePos.i][minePos.j].isMine = true
		var elCurCell = document.querySelector(`#cell-${minePos.i}-${minePos.j}`)
		elCurCell.classList.add("mine")
		var minePos = getItemPosition()
	}
	createMineAround()
}

function createMineAround() {
	for (var i = 0; i < gBoard.length; i++) {
		for (var j = 0; j < gBoard[0].length; j++) {
			gBoard[i][j].minesAround = getMinesAround(i, j)
		}
	}
}


function getMinesAround(rowIdx, colIdx) {
	var mineCount = 0
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i > gBoard.length - 1) continue
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j > gBoard[0].length - 1) continue
			if (i === rowIdx && j === colIdx) continue
			if (gBoard[i][j].isMine) mineCount++
		}
	}
	return mineCount
}

function sweepAround(rowIdx, colIdx) {
	var elCurCell = document.querySelector(`#cell-${rowIdx}-${colIdx}`)
	if (gBoard[rowIdx][colIdx].isMine) {	
		return mineClicked(elCurCell)
	}
	if (gBoard[rowIdx][colIdx].minesAround !== 0) {
		if (!gPrevCellList.length) gPrevCellList.push({ pI: rowIdx, pJ: colIdx })
		elCurCell.innerHTML = gBoard[rowIdx][colIdx].minesAround
		return

	}
	for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
		if (i < 0 || i > gBoard.length - 1) continue
		for (var j = colIdx - 1; j <= colIdx + 1; j++) {
			if (j < 0 || j > gBoard[0].length - 1) continue
			if (i === rowIdx && j === colIdx) continue
			if (!gBoard[i][j].isShown && !gBoard[i][j].isMarked) {
				gPrevCellList.push({ pI: i, pJ: j })
				gBoard[i][j].isShown = true
				gGame.shownCount++
				elCurCell = document.querySelector(`#cell-${i}-${j}`)
				elCurCell.classList.add("shown")
				sweepAround(i, j)
			}
		}
	}
}

function mineClicked(elCurrCell) {
	elCurrCell.innerHTML = MINE_IMG
	elCurrCell.classList.add("red")
	elCurrCell.classList.remove("shown")
	gGame.lives -= 1
	gLivesLost++
	renderHit(gGame.lives)
	updateLives(gGame.lives)
	if (!gGame.lives) {
		var elMines = document.querySelectorAll(".mine")
		for (var i = 0; i < elMines.length; i++) {
			elCurrCell = elMines[i]
			elCurrCell.innerHTML = MINE_IMG
		}
		gameOver()
	}

}

function changeMark(i, j, elCell) {
	if (!gBoard[i][j].isMarked) {
		gBoard[i][j].isMarked = true
		gGame.markedCount++
		elCell.innerHTML = FLAG_IMG
	} else {
		gBoard[i][j].isMarked = false
		gGame.markedCount--
		elCell.innerHTML = ''
	}
}

function undo() {
	if (!gPrevCellList.length || !gGame.isOn || gPrevCellList[0] === 999) return
	var elCurCell;
	var theme;
	for (var i = 0; i < gPrevCellList.length; i++) {
		var currCell = gBoard[gPrevCellList[i].pI][gPrevCellList[i].pJ]
		elCurCell = document.querySelector(`#cell-${gPrevCellList[i].pI}-${gPrevCellList[i].pJ}`)
		if (currCell.isMine && currCell.isShown) {
			gGame.lives++
			gLivesLost--
			updateLives(gGame.lives - 1, true)
			elCurCell.classList.remove('red')
		}
		if (currCell.isShown) {
			currCell.isShown = false
			elCurCell.classList.remove('shown')
			gGame.shownCount--
		} else {
			changeMark(gPrevCellList[i].pI, gPrevCellList[i].pJ, elCurCell)
		}
		elCurCell.innerHTML = ""
	}
	gPrevCellList = [999]

}

function getClassName() {
	if (gBoard.length === 4) {
		return "easy"
	} else if (gBoard.length === 8) {
		return "normal"
	} else return "hard"
}

function checkWin() {
	console.log(`cells marked ${gGame.markedCount} cells shown ${gGame.shownCount} total cells ${gBoard.length * gBoard.length}`)
	if (gGame.markedCount + gGame.shownCount === gBoard.length * gBoard.length && gGame.markedCount === gLevel.MINES - gLivesLost) {
		clearTimeout(gSmileTimeout)
		if (getRadioValue(document.querySelectorAll('input[name="theme"]'), true) === "dark") elSmiley.style.background = "#f3f3f3 url(img/Smiley-win-dark.png) no-repeat right top"
		else elSmiley.style.background = "#f3f3f3 url(img/Smiley-win.png) no-repeat right top"
		elSmiley.style["background-size"] = '65px 65px'
		gameOver()
	}
}

function updateLives(index, gained = false) {
	if (!gained) {
		var elLife = document.getElementById(`lives-${index}`)
		elLife.innerHTML = ""
	} else {
		var elLife = document.getElementById(`lives-${index}`)
		elLife.innerHTML = HEART_IMG
	}

}

function renderHit(lives) {
	if (lives > 0) {
		if (getRadioValue(document.querySelectorAll('input[name="theme"]'), true) === "dark") elSmiley.style.background = "#f3f3f3 url(img/Frowney-dark.png) no-repeat right top"
		else elSmiley.style.background = "#f3f3f3 url(img/Frowney.png) no-repeat right top"
		elSmiley.style["background-size"] = '65px 65px'
		gSmileTimeout = setTimeout(() => { renderSmiley(elSmiley) }, 3000);
	} else {
		clearTimeout(gSmileTimeout)
		if (getRadioValue(document.querySelectorAll('input[name="theme"]'), true) === "dark") elSmiley.style.background = "#f3f3f3 url(img/Explosion-dark.png) no-repeat right top"
		else elSmiley.style.background = "#f3f3f3 url(img/Explosion.png) no-repeat right top"
		elSmiley.style["background-size"] = '65px 65px'
	}

}

function renderSmiley(elSmiley) {
	if (getRadioValue(document.querySelectorAll('input[name="theme"]'), true) === "dark") elSmiley.style.background = "url(img/Smiley-dark.png) no-repeat right top"
	else elSmiley.style.background = "url(img/Smiley-none-transparent.png) no-repeat right top"
	elSmiley.style["background-size"] = '65px 65px'
}

function renderLives() {
	var life;
	for (var i = 0; i < 3; i++) {
		life = document.getElementById(`lives-${i}`)
		life.innerHTML = HEART_IMG
	}
}

function gameOver() {
	gGame.isOn = false
	clearInterval(gTimerInterval)
}

function gGameInit() {
	gGame.isOn = true
	gGame.lives = 3
	gGame.hints = 3
	gGame.shownCount = 0
	gGame.markedCount = 0
}


