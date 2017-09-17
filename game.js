"use strict";

window.onload = init;

var gameWindow;
var gameField;
var ctxGameField;

var gameWidth;
var gameHeight;
var sizeCell;
var sizeFont;
var sizeArray;

var minMines;
var maxMines;

var imgMine = new Image();
imgMine.src = "mine.svg";
var imgFlag = new Image();
imgFlag.src = "flag.svg";
var imgCell = new Image();
imgCell.src = "cell.svg";
var imgSelectedCell = new Image();
imgSelectedCell.src = "selectedCell.svg";

var mines;
var flags;		
var digitColors = ["red", "blue", "yellow", "green", "#f0f", "orange", "aqua", "white"];

var resultWindow;
var level;
var time;
var timerID;
var timerTouch;

var buttonNext;
var buttonRefresh;

var prevSelectedCell = {
	x: -1,
	y: -1
};

function init() {
	
	
	gameWindow   = document.getElementById("gameFieldDiv");
	gameField    = document.getElementById("gameField");
	ctxGameField = gameField.getContext("2d");
	
	
	if (getCookie("c_level") === undefined) {
		level = 1;
	}
	else {
		level = parseInt(getCookie("c_level"));
	}
	
	mapLevel();
	
	sizeFont = Math.trunc(sizeCell / 1.5);
	
	document.getElementById("testID").innerHTML = "Уровень " + level;
	

	
	gameField.width  = gameWidth;
	gameField.height = gameHeight;
	
	document.getElementById("button").innerHTML = "Старт";
	
	document.getElementById("button").addEventListener("click", start);
	
	
	buttonNext = document.getElementById("next");
	buttonNext.addEventListener("click", jumpNextLevel);
	
	buttonRefresh = document.getElementById("refresh");
	buttonRefresh.addEventListener("click", start);
	
	
	resultWindow = document.getElementById("result");
	
}

function getCookie(name) {
	var matches = document.cookie.match(new RegExp(
		"(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
		));
	return matches ? decodeURIComponent(matches[1]) : undefined;
}

function initializationArray() {
	mines = [];
	flags = [];
	
	for (var i = 0; i < sizeArray; i++) {
		mines.push(fillSecondDimension());
		flags.push(fillSecondDimension());
	}
}

function fillSecondDimension() {
	var secondDimension = [];
		for (var i = 0; i < sizeArray; i++) {
		secondDimension.push(0);
	}
	return secondDimension;
}

function start() {

	gameField.width  = gameWidth;
	gameField.height = gameHeight;	
			
	time = 0;
	clearInterval(timerID);
	document.getElementById("timer").innerHTML = time;
	timerID = setInterval(timing, 1000);	// Timer
	resultWindow.style.display = "none";
	document.getElementById("button").value = "Заново";
	document.getElementById("testID").innerHTML = "Уровень " + level;
	
	
	initializationArray();
	generateMines();
	
	
	gameField.addEventListener("click", exploreMap);
	gameField.addEventListener("contextmenu", toggleFlag);
	
	gameField.addEventListener("mousemove", selectCell);
	

	
	
	
	// Draw grid
	ctxGameField.strokeStyle = "#aaa";
	for (var i = 0; i < sizeArray; i++) {
		ctxGameField.moveTo(0, i * sizeCell);
		ctxGameField.lineTo(gameWidth, i * sizeCell);
		ctxGameField.stroke();
	}
	for (var i = 0; i < sizeArray; i++) {
		ctxGameField.moveTo(i * sizeCell, 0);
		ctxGameField.lineTo(i * sizeCell, gameHeight);
		ctxGameField.stroke();
	}
	
	// Draw cells
	for (var i = 0; i < sizeArray; i++) {
		for (var j = 0; j < sizeArray; j++) {
			ctxGameField.drawImage(imgCell, i * sizeCell + 1, j * sizeCell + 1, sizeCell - 2, sizeCell - 2);
		}
	}
	
	
	
	
	
	// //test
	// for (var i = 0; i < sizeArray; i++) {
		// for (var j = 0; j < sizeArray; j++) {
			// if (mines[i][j]) {
				// ctxGameField.fillStyle = "#ccc";
				// ctxGameField.fillRect(i * sizeCell + 1, j * sizeCell + 1, sizeCell - 2, sizeCell - 2);
				// ctxGameField.drawImage(imgMine, sizeCell * i, sizeCell * j, sizeCell, sizeCell);
			// }
		// }
	// }		
}

function changeGameVar(C, A, minM, maxM) {
	sizeCell   = C; 
	sizeArray  = A;
	minMines = minM;
	maxMines = maxM;

	gameWidth  = sizeCell * sizeArray;
	gameHeight = sizeCell * sizeArray;
	gameWindow.style.width = gameWidth + 50 + "px";
	gameWindow.style.height = gameHeight + 50 + "px";
}

function selectCell(e) {
	var x = e.offsetX == undefined ? e.layerX : e.offsetX;
	var y = e.offsetY == undefined ? e.layerY : e.offsetY;
	x = parseInt(x / sizeCell);
	y = parseInt(y / sizeCell);
	// Остановка программы если находимся в той же клетке
	if (prevSelectedCell.x == x && prevSelectedCell.y == y || mines[x][y] == 9) {
		return;
	}
	// Выделение текущего и сброс предыдущего
	if ((prevSelectedCell.x != -1 || prevSelectedCell.y != -1) && mines[prevSelectedCell.x][prevSelectedCell.y] != 9) {
		setCell(prevSelectedCell.x, prevSelectedCell.y, imgCell);
		setCell(x, y, imgSelectedCell);
	}
	if (mines[x][y] == 9) {
		setCell(prevSelectedCell.x, prevSelectedCell.y, imgCell);
	}
	
	prevSelectedCell.x = x;
	prevSelectedCell.y = y;
}

function strokeCell(x, y, color) {
	ctxGameField.beginPath();
	ctxGameField.strokeStyle = color;
	ctxGameField.strokeRect(x * sizeCell, y * sizeCell, sizeCell, sizeCell)
	ctxGameField.stroke();		
}

function clearCell(x, y) {
	// Clear upper line
	ctxGameField.clearRect(x * sizeCell, y * sizeCell, sizeCell, 1);
	// Clear left line
	ctxGameField.clearRect(x * sizeCell, y * sizeCell, 1, sizeCell);
	// Clear right line
	ctxGameField.clearRect(x * sizeCell + sizeCell - 1, y * sizeCell, 1, sizeCell);
	// Clear bottom line
	ctxGameField.clearRect(x * sizeCell, y * sizeCell + sizeCell - 1, sizeCell, 1);
}

function setCell(x, y, img) {
	ctxGameField.clearRect(sizeCell * x, sizeCell * y, sizeCell, sizeCell);
	ctxGameField.drawImage(img, x * sizeCell + 1, y * sizeCell + 1, sizeCell - 2, sizeCell - 2);
}

function mapLevel() {
	switch(level) {		
		case  1: changeGameVar(50, 4, 1, 1); break;
		case  2: changeGameVar(50, 4, 2, 2); break;
		case  3: changeGameVar(50, 4, 2, 3); break;
		case  4: changeGameVar(50, 4, 3, 3); break;
		case  5: changeGameVar(50, 5, 4, 5); break;
		case  6: changeGameVar(50, 5, 5, 6); break;
		case  7: changeGameVar(50, 5, 5, 7); break;
		case  8: changeGameVar(50, 5, 6, 7); break;
		case  9: changeGameVar(50, 5, 7, 8); break;
		case 10: changeGameVar(50, 6, 9, 10); break;
		case 11: changeGameVar(50, 6, 10, 12); break;
		case 12: changeGameVar(50, 6, 11, 13); break;
		case 13: changeGameVar(50, 6, 12, 14); break;
		case 14: changeGameVar(50, 6, 14, 15); break;
		case 15: changeGameVar(50, 7, 16, 17); break;
		case 16: changeGameVar(50, 7, 17, 18); break;
		case 17: changeGameVar(50, 7, 18, 19); break;
		case 18: changeGameVar(50, 7, 19, 20); break;
		case 19: changeGameVar(50, 7, 22, 24); break;
		case 20: changeGameVar(50, 8, 25, 26); break;
		case 21: changeGameVar(50, 8, 28, 31); break;
		case 22: changeGameVar(50, 8, 29, 32); break;
		case 23: changeGameVar(50, 8, 33, 34); break;
		case 24: changeGameVar(50, 8, 35, 36); break;
		case 25: changeGameVar(50, 9, 36, 37); break;
		case 26: changeGameVar(50, 9, 25, 26); break;
		case 27: changeGameVar(50, 9, 28, 31); break;
		case 28: changeGameVar(50, 9, 29, 32); break;
		case 29: changeGameVar(50, 9, 33, 34); break;
		case 30: changeGameVar(50, 10, 35, 36); break;
		case 31: changeGameVar(50, 10, 37, 38); break;
		case 32: changeGameVar(50, 10, 39, 40); break;
		case 33: changeGameVar(50, 10, 40, 41); break;
		case 34: changeGameVar(50, 10, 42, 43); break;
		case 35: changeGameVar(50, 11, 45, 50); break;
		case 36: changeGameVar(50, 11, 49, 53); break;
		case 37: changeGameVar(50, 11, 52, 57); break;
		case 38: changeGameVar(50, 11, 56, 61); break;
		case 39: changeGameVar(50, 11, 61, 63); break;
		case 40: changeGameVar(40, 12, 63, 66); break;
	}
}

function generateMines() {
	var countMines = random(minMines, maxMines);
	var i; 
	var j;
	
	while (countMines > 0) {
		i = random(0, sizeArray-1);
		j = random(0, sizeArray-1);
		if (!mines[i][j]) {
			mines[i][j] = 1;
			countMines--;
		}
	}
}

function random(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

// contextmenu event
function toggleFlag(e) {
	e.preventDefault();		// For cancel default browser context menu
	e.stopPropagation();
	// Variables: 	x - col		y - row
	var x = e.offsetX == undefined ? e.layerX : e.offsetX;
	var y = e.offsetY == undefined ? e.layerY : e.offsetY;
	x = parseInt(x / sizeCell);
	y = parseInt(y / sizeCell);
	
	
	if (mines[x][y] != 9) {
		flags[x][y] = 1 - flags[x][y];	// Toggle flag
		if (flags[x][y]) {
			// Draw flag
			ctxGameField.drawImage(imgFlag, x * sizeCell + 1, y * sizeCell + 1, sizeCell - 2, sizeCell - 2);
		}
		else if (!flags[x][y]) {
			// Clear flag
			//ctxGameField.clearRect(x * sizeCell + 1, y * sizeCell + 1, sizeCell - 2, sizeCell - 2);
			ctxGameField.drawImage(imgCell, x * sizeCell + 1, y * sizeCell + 1, sizeCell - 2, sizeCell - 2);
		}
	}
}

// click event
function exploreMap(e) {	
	// Variables:	x - col		y - row
	var x = e.offsetX == undefined ? e.layerX : e.offsetX;
	var y = e.offsetY == undefined ? e.layerY : e.offsetY;
	x = parseInt(x / sizeCell);
	y = parseInt(y / sizeCell);
	
	if (!flags[x][y]) {
		if (mines[x][y] == 1) {
			lossGame();
		}
		else if (!mines[x][y]) {	// Open cell
		
			mines[x][y] = 9;	// Memorization explored cells for win game!
			var countMines = defineCountMines(x, y);
			if (countMines) {
				writeDigital(x, y, countMines);
			}
			else {	// Open cells around this
				ctxGameField.fillStyle = "#ccc";
				ctxGameField.fillRect(x * sizeCell + 1, y * sizeCell + 1, sizeCell - 2, sizeCell - 2);
				expandExploreMap(x, y);
			}
			
			checkWinGame();		// Condition for win game
		}
	}
}

// click next level
function jumpNextLevel(e) {
	level++;
	document.cookie = "c_level=" + level;
	mapLevel();
	start();
}

function checkWinGame() {
	for (var i = 0; i < sizeArray; i++) {
		for (var j = 0; j < sizeArray; j++) {
			if (!mines[i][j]) {
				return false;
			}
		}
	}
	winGame();	
}

function winGame() {
	
	endGame();
	
	document.getElementById("endLevel").innerHTML = level + " Уровень пройден!";
	
	resultWindow.style.display = "block";
	resultWindow.style.left = (document.documentElement.clientWidth / 2 - 150) + "px";
	resultWindow.style.top = (document.documentElement.clientHeight / 2 - 150) + "px";
}

function lossGame() {
	document.getElementById("testID").innerHTML = "Поражение";
	
	endGame();
}

function endGame() {
	clearInterval(timerID);
	gameField.removeEventListener("contextmenu", toggleFlag);
	gameField.removeEventListener("click", exploreMap);
	gameField.removeEventListener("mousemove", selectCell);
	
	
	// Show mines
	for (var i = 0; i < sizeArray; i++) {
		for (var j = 0; j < sizeArray; j++) {
			if (mines[i][j] == 1) {
				ctxGameField.fillStyle = "#ccc";
				ctxGameField.fillRect(i * sizeCell + 1, j * sizeCell + 1, sizeCell - 2, sizeCell - 2);
				ctxGameField.drawImage(imgMine, sizeCell * i, sizeCell * j, sizeCell, sizeCell);
			}
		}
	}		
}

function defineCountMines(x, y) {
	var countMines = 0;
	for (var i = x - 1; i <= x + 1; i++) {
		for (var j = y - 1; j <= y + 1; j++) {
			if (i >= 0 && i <= sizeArray-1 && j >= 0 && j <= sizeArray-1 && !(i == x && j == y)) {
				if (mines[i][j] == 1) {
					countMines++;
				}
			}
		}
	}
	return countMines;
}

function writeDigital(x, y, countMines) {
	ctxGameField.fillStyle = "#ccc";
	ctxGameField.fillRect(x * sizeCell + 1, y * sizeCell + 1, sizeCell - 2, sizeCell - 2);
	ctxGameField.fillStyle = digitColors[countMines-1];
	ctxGameField.textAlign = "center";
	ctxGameField.font = "normal normal " + sizeFont + "px Tahoma";
	ctxGameField.fillText( countMines, x * sizeCell + (sizeCell / 2), y * sizeCell + (sizeCell/ 1.5) );
}

function expandExploreMap(x, y) {
	var countMines;
	for (var i = x - 1; i <= x + 1; i++) {
		for (var j = y - 1; j <= y + 1; j++) {
			if (i >= 0 && i <= sizeArray-1 && j >= 0 && j <= sizeArray-1 && !(i == x && j == y)) {
				if (mines[i][j] == 0) {
					countMines = defineCountMines(i, j);
					mines[i][j] = 9;
					if (countMines) {
						writeDigital(i, j, countMines);
					}
					else {
						ctxGameField.fillStyle = "#ccc";
						ctxGameField.fillRect(i * sizeCell + 1, j * sizeCell + 1, sizeCell - 2, sizeCell - 2);
						expandExploreMap(i, j);
					}
				}
			}
		}
	}	
}

function timing() {
	time++;
	document.getElementById("timer").innerHTML = time;
}

