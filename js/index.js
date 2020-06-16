// VARIABLES
var SETTING_SIZE = 5;
var SETTING_THEME = "dark";

var emptyGrid = [[0, 0, 0, 0, 0, 0, 0, 0, 0], 
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0],
            [0, 0, 0, 0, 0, 0, 0, 0, 0]];
var grid = [];
var tempGrid = [];
var oldGrid = [];
var solution = [];
var oldSolution = [];
var history = [];

var solveLimit = 200000;
var minFilled = 17;
var nsearches = 0;
var selected = [undefined, undefined];
var processState = 0;
var timeToSolve = 0;

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");
var sliderScale = document.getElementById("sliderScale");
var visualize = false;

sliderScale.oninput = function() {
  SETTING_SIZE = this.value;
  update();
}

// FUNCTIONS
function setup() {
  grid = copyArray(grid, emptyGrid);
  //generator();
  runGenerator();
  oldGrid = copyArray(oldGrid, grid);
  updateTheme(SETTING_THEME);
  update();
  //console.log(solver(grid));
  console.log(solution);
}

function update() {
  var canvasSize = 12 * 9 * SETTING_SIZE;

  canvas.width = canvasSize;
  canvas.height = canvasSize;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw board
  for (i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (i * canvasSize / 9) + canvasSize / 9);
    ctx.lineTo(canvasSize, (i * canvasSize / 9) + canvasSize / 9);
    if ((i + 1) % 3 == 0) ctx.lineWidth = SETTING_SIZE;
    else ctx.lineWidth = Math.round(SETTING_SIZE / 2);
    if (SETTING_THEME == "light") ctx.strokeStyle = "black";
    else ctx.strokeStyle = "white";
    ctx.stroke();
  }

  for (i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo((i * canvasSize / 9) + canvasSize / 9, 0);
    ctx.lineTo((i * canvasSize / 9) + canvasSize / 9, canvasSize);
    if ((i + 1) % 3 == 0) ctx.lineWidth = SETTING_SIZE;
    else ctx.lineWidth = Math.round(SETTING_SIZE / 2);
    if (SETTING_THEME == "light") ctx.strokeStyle = "black";
    else ctx.strokeStyle = "white";
    ctx.stroke();
  }

  // Fill numbers
  ctx.font = Math.floor(canvasSize / 9) + "px Arial";
  for(i = 0; i < grid.length; i++) {
    for (j = 0; j < grid[i].length; j++) {
      if (grid[i][j] != 0) {
        if (SETTING_THEME == "light") ctx.fillStyle = "#757575";
        else ctx.fillStyle = "#009c00";
        ctx.fillText(grid[i][j], ((j * canvasSize / 9) + canvasSize / 9) - (canvasSize / 9 * 0.77), ((i * canvasSize / 9) + canvasSize / 9) - (canvasSize / 9 / 8));  
      }
    }
  }
  // Highlight default numbers
  ctx.font = "bolder" + Math.floor(canvasSize / 9) + "px Arial";
  for(i = 0; i < oldGrid.length; i++) {
    for (j = 0; j < oldGrid[i].length; j++) {
      if (oldGrid[i][j] != 0) {
        if (SETTING_THEME == "light") ctx.fillStyle = "black";
        else ctx.fillStyle = "#00ff00";
        ctx.fillText(oldGrid[i][j], ((j * canvasSize / 9) + canvasSize / 9) - (canvasSize / 9 * 0.77), ((i * canvasSize / 9) + canvasSize / 9) - (canvasSize / 9 / 8));  
      }
    }
  }
  if (selected[0] != undefined && selected[1] != undefined) selectCell(selected[0], selected[1]);
}
  // https://stackoverflow.c  om/questions/6924216/how-to-generate-sudoku-boards-with-unique-solutions

var c = 0; //hardcode undefined fix
function generator() {
  var done = false;
  while (!done) {
    var x = Math.floor(Math.random() * 9);
    var y = Math.floor(Math.random() * 9);
    if (grid[x][y] == 0) {
      oldGrid = copyArray(oldGrid, grid);
      //console.log(oldGrid);
      grid[x][y] = randomValidNumber(grid, x, y);
      if (grid[x][y] == undefined) grid[x][y] = c;
      tempGrid = copyArray(tempGrid, grid);
      //console.log(tempGrid);
      //console.log(grid[x][y]);

      if (solver()) {
        oldSolution = copyArray(oldSolution, grid);
        grid = copyArray(grid, tempGrid);
      }
      else {
        solution = copyArray(solution, oldSolution);
        grid = copyArray(grid, oldGrid);
        done = true;
      }
    }
  }
}

function generator2() {
  var g = copyArray(g, emptyGrid);
  var toBeFilled = minFilled;
  var completed = false;
  var difNumbers = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  while (!completed) {
    var tempG = copyArray(tempG, g);
    while (toBeFilled > 0 && !completed) {
      var x = Math.floor(Math.random() * 9);
      var y = Math.floor(Math.random() * 9);
      if (tempG[x][y] == 0) {
        var n = randomValidNumber(tempG, x, y);
        if (n == undefined) n = c;
        tempG[x][y] = n;
        difNumbers[n - 1]++;
        toBeFilled--;
      }
      else console.log("Can't find valid number");
    }
    var counter = 0;
    for (var i = 0; i < difNumbers.length; i++) {
      if (difNumbers[i] > 0) counter++;
    }
    if (counter >= 8) {
      g = copyArray(g, tempG);
      completed = true;
    }
    else {
      console.log("Not enough unique numbers");
      toBeFilled = minFilled;
    }
  }
  console.log(g);
  return g;
  
}

function randomValidNumber(inp, x, y) {
  var g = copyArray(g, inp);
  var number = Math.floor(Math.random() * 9 + 1);
  if (checkValidNumber(g, number, x, y)) { c = number; return number; }
  else randomValidNumber(g, x, y);
}

function checkValidNumber(inp, n, x, y) {
  var g = copyArray(g, inp);
  var buffer = 0;
  for (i = 0; i < g.length; i++) {
    if (g[i][y] == n) buffer++;
  }
  for (j = 0; j < g.length; j++) {
    if (g[x][j] == n) buffer++;
  }

  var xCheck, yCheck = 0;
  
  if (x == 0 || x == 3 || x == 6) {
    if (y == 0 || y == 3 || y == 6) {
      xCheck = 0;
      yCheck = 0;
    }
    else if (y == 1 || y == 4 || y == 7) {
      xCheck = 0;
      yCheck = -1;
    }
    else if (y == 2 || y == 5 || y == 8) {
      xCheck = 0;
      yCheck = -2;
    }
  }
  else if (x == 1 || x == 4 || x == 7) {
    if (y == 0 || y == 3 || y == 6) {
      xCheck = -1;
      yCheck = 0;
    }
    else if (y == 1 || y == 4 || y == 7) {
      xCheck = -1;
      yCheck = -1;
    }
    else if (y == 2 || y == 5 || y == 8) {
      xCheck = -1;
      yCheck = -2;
    }
  }
  else if (x == 2 || x == 5 || x == 8) {
    if (y == 0 || y == 3 || y == 6) {
      xCheck = -2;
      yCheck = 0;
    }
    else if (y == 1 || y == 4 || y == 7) {
      xCheck = -2;
      yCheck = -1;
    }
    else if (y == 2 || y == 5 || y == 8) {
      xCheck = -2;
      yCheck = -2;
    }
  }

  for (i = xCheck; i < (xCheck + 3); i++) {
    for (j = yCheck; j < (yCheck + 3); j++) {
      if ((g[x + i][y + j] == n) && (((x + i) != x) && ((y + j) != y))) {
        buffer++;
      }
    }
  }
  
  if (buffer == 0) return true;
  else return false;

}

function updateTheme(t) {
  SETTING_THEME = t;
  var body = document.getElementsByClassName("body")[0];
  var container = document.getElementsByClassName("container")[0];
  var canvas = document.getElementById("gameCanvas");

  if (SETTING_THEME == "light") {
    document.getElementById("radioDark").checked = false;
    document.getElementById("radioLight").checked = true;

    body.style.backgroundColor = "#979797";
    body.style.color = "black";
    container.style.backgroundColor = "#e2e2e2";
    canvas.style.backgroundColor = "white";
  }
  else {
    document.getElementById("radioLight").checked = false;
    document.getElementById("radioDark").checked = true;

    body.style.backgroundColor = "#353535";
    body.style.color = "white";
    container.style.backgroundColor = "#1f1f1f";
    canvas.style.backgroundColor = "black";
  }
  update();
}

function solver(inp) {
  if (nsearches > solveLimit) return false;
  ++nsearches;

  //console.log(nsearches);
  var g = copyArray(g, inp);
  var x = 0;
  var y = 0;

  //console.log("g" + g);
  
  // If no empty cell is found, return false as board is solved
  var res = getEmptyCell(g);
  if (!res) return g;
  else {
    x = res[0];
    y = res[1];
  }

  for (var num = 1; num <= 9; num++) {  
    if (checkValidNumber(g, num, x, y)) {
      //console.log("Number: " + num + " at (" + x + ", " + y + ")");
      g[x][y] = num;
      history[nsearches] = copyArray(history[nsearches], g);
      var result = solver(g);
      if (result) return result;
      //console.log("Insterted " + num + " at (" + x + ", " + y + ")");

      //console.log("I give up");
      g[x][y] = 0;
    }
  }

  return false;
}


function solver2(inp) {
  var g = copyArray(g, inp);
  console.log("g: " + g);
  ++nsearches;
  var buffer = 0;
  for (var i = 0; i < g.length; i++) {
    for (var j = 0; j < g[i].length; j++) {
      if (typeof(g[i][j]) == "object") {
        if (g[i][j].length == 1) {
          g[i][j] = Number(g[i][j]);
        }
        buffer++;
      } 
    }
  }
  if (buffer == 0) return g;

  console.log(g);

  //console.log(searchGrid);
  var lowestCord = [];
  for (var l = 2; l <= 9; l++) {
    for (var i = 0; i < g.length; i++) {
      for (var j = 0; j < g[i].length; j++) {
        if (typeof(g[i][j]) == "object") {
          if (g[i][j].length == l) {
            for (var h = 0; h < l; h++) {
              if (checkValidNumber(g, g[i][j][h], i, j)) {
                var updated = copyArray(updated, g);
                updated[i][j] = updated[i][j][h];
                //alert(typeof(updated[i][j]));
                g[i][j].splice(h, 1);
                //console.log(i + " " + j);
                //console.log(g[i][j]);
                //console.log(updated[i][j]);
                //alert(updated);
                //console.log("Prøver " + searchGrid[i][j][h] + " på punkt " + i + ", " + j + "");
  
                if (solver2(g)) return g;
                //g[i][j].splice(h, 1, h);
              }
            }
          }
        }
      }
    }
  }
  return false;
}

function getEmptyCell(inp) {
  var g = copyArray(g, inp);
  for (x = 0; x < g.length; x++) {
    for (y = 0; y < g[x].length; y++) {
      //console.log("Value: " + g[x][y] + " at (" + x + ", " + y + ")");
      if (g[x][y] == 0) {
        return [x, y];
      }
    }
  }
  return false;
}

function copyArray(a1, a2) {
  for (i = 0; i < a2.length; i++) {
    if (a1 == undefined) a1 = [];
    a1[i] = [];
    a1[i] = Array.from(a2[i]);
  }
  return a1;
}

function resetArrays() {
  grid = copyArray(grid, emptyGrid);
  tempGrid = copyArray(tempGrid, emptyGrid);
  oldGrid = copyArray(oldGrid, emptyGrid);
  solution = copyArray(solution, emptyGrid);
  oldSolution = copyArray(oldSolution, emptyGrid);
}

canvas.addEventListener("click", function(event) {
  var rect = canvas.getBoundingClientRect();
  var x = event.clientX - rect.left;
  var y = event.clientY - rect.top;

  var cellX = Math.floor(x / SETTING_SIZE / 12);
  var cellY = Math.floor(y / SETTING_SIZE / 12);

  selected[0] = cellX;
  selected[1] = cellY;
  update();


}, false);

document.addEventListener("keydown", function(event) {
  if (event.keyCode == "38") {  // UP
    if (selected[1] > 0) {
      selected[1] -= 1;
      update();
    }
  }
  else if (event.keyCode == "37") { // LEFT
    if (selected[0] > 0) {
      selected[0] -= 1;
      update();
    }
  }
  else if (event.keyCode == "40") { // DOWN
    if (selected[1] < 8) {
      selected[1] += 1;
      update();
    }
  }
  else if (event.keyCode == "39") { // RIGHT
    if (selected[0] < 8) {
      selected[0] += 1;
      update();
    }
  }
  else if (event.keyCode == "49") insertNumber(1);
  else if (event.keyCode == "50") insertNumber(2);
  else if (event.keyCode == "51") insertNumber(3);
  else if (event.keyCode == "52") insertNumber(4);
  else if (event.keyCode == "53") insertNumber(5);
  else if (event.keyCode == "54") insertNumber(6);
  else if (event.keyCode == "55") insertNumber(7);
  else if (event.keyCode == "56") insertNumber(8);
  else if (event.keyCode == "57") insertNumber(9);
  else if (event.keyCode == "8" || event.keyCode == "32") insertNumber(0);
});

function selectCell(x, y) {
  var rx = x * SETTING_SIZE * 12;
  var ry = y * SETTING_SIZE * 12;
  ctx.beginPath();
  ctx.moveTo(rx, ry);
  ctx.lineTo(rx + SETTING_SIZE * 12, ry);
  ctx.lineTo(rx + SETTING_SIZE * 12, ry + SETTING_SIZE * 12);
  ctx.lineTo(rx, ry + SETTING_SIZE * 12);
  ctx.lineTo(rx, ry);
  ctx.lineWidth = 8;
  if (SETTING_THEME == "light") ctx.strokeStyle = "black";
  else ctx.strokeStyle = "white";
  ctx.stroke();
}

function insertNumber(num) {
  if (oldGrid[selected[1]][selected[0]] == 0) {
    if (checkValidNumber(grid, num, selected[1], selected[0])) {
      grid[selected[1]][selected[0]] = num;
    }
    else if (num == 0) {
      grid[selected[1]][selected[0]] = num;
    }
    else {
      console.log("Illegal number placement");
    }
  }

  update();
}

function runGenerator() {
  updateLog("Lager nytt brett");
  grid = generator2();
  oldGrid = copyArray(oldGrid, grid);
  update();
}

function runSolver1() {
  nsearches = 0;
  var t0 = performance.now();
  updateLog("Prøver å løse brett...");
  solution = solver(grid);
  t1 = performance.now();
  timeToSolve = (Math.round(((t1 - t0) / 1000) * 1000) / 1000);
  if (!solution) updateLog("Tok for lang tid å løse");
  else updateLog("Tok " + timeToSolve + " sekunder å løse (" + nsearches + " søk)");
}

function runSolver2() {
  nsearches = 0;
  var g = copyArray(g, grid);
  for (var i = 0; i < g.length; i++) {
    for (var j = 0; j < g[i].length; j++) {
      if (g[i][j] == 0) {
        var valids = [];
        for (var h = 1; h <= 9; h++) {
          if (checkValidNumber(g, h, i, j)) {
            valids.push(h);
          }
        }
        g[i][j] = valids;
      }
    }
  }
  updateLog("Prøver å løse brett...");
  solution = solver2(g);
  if (!solution) updateLog("Tok for lang tid å løse");
  else updateLog("Tok " + nsearches + " forsøk for å løse");
}

function updateVisualize() {
  if (document.getElementById("checkVisualize").checked) visualize = true;
  else visualize = false;
}

function showProcess() {
  var limit = nsearches;
  if (processState == 0) {
    processState = 1;
    document.getElementById("btnProcess").value = "Løs nå";

    updateLog("Løser: ");
    var i = 0;
    var timer = 3600 / nsearches;
    var interval = setInterval(() => {
      grid = copyArray(grid, history[++i]);
      update();
      updateLogFirstLine("Løser: " + (Math.floor((i / limit) * 100)) + "% ferdig")  ;
      if (i >= limit - 1) {
        document.getElementById("btnProcess").value = "Vis prosess";
        updateLogFirstLine("Løser: 100% ferdig");
        clearInterval(interval);
      }
    }, timer);
  }
  else if (processState == 1) {
    processState = 0;
    document.getElementById("btnProcess").value = "Vis prosess";
    limit = 0;  
    var l = history.length;
    console.log(history);
    grid = copyArray(grid, history[nsearches - 1]);
    update();
    updateLogFirstLine("Løser: 100% ferdig");
  }

}

function updateLog(txt) {
  var l = [];
  for (var i = 0; i < 5; i++) {
    l[i] = document.getElementById("log" + (i + 1)).innerHTML;
  }
  for (var i = 4; i >= 0; i--) {
    if (i == 0) {
      l[i] = txt;
    }
    else if (l[i] != undefined) {
      l[i] = l[i - 1];
    }
  }
  for (var i = 0; i < 5; i++) {
    document.getElementById("log" + (i + 1)).innerHTML = l[i];
  }
}

function updateLogFirstLine(txt) {
  document.getElementById("log1").innerHTML = txt;
}

setup();