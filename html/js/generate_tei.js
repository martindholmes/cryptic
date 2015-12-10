/* Code for the TEI file generator; creates a crossword 
   framework file through a simple GUI on a web page. */

var grid = null;

//Validate the input is an integer within range.
var minGridSize = 8;
var maxGridSize = 32;
var black = 'rgb(0, 0, 0)';
var white = 'rgb(255, 255, 255)';
var blackRegExp = /^rgb\(\s*0,\s*0,\s*0\s*\)$/i;
var whiteRegExp = /^rgb\(\s*255,\s*255,\s*255\s*\)$/i;

function validateInteger(sender){
    if ((sender.value.match('^[0-9]{1,2}')) && (parseInt(sender.value) >= minGridSize) && (parseInt(sender.value) <= maxGridSize)){
        sender.style.backgroundColor = '#ffffff';
        return true;
    }
    else{
        sender.style.backgroundColor = '#ffdddd';
    }
}

//Generate the grid in the form of a table with its own built-in functionality.
var cellTitle = 'Click on a cell to make it (and its matching cells) black or white.';
function generateGrid(){
  if (grid != null){
    if (confirm('Delete the existing grid and start again?')){
      grid.parentNode.removeChild(grid);
    }
    else{
      return;
    }
  }
  var gridSize = document.getElementById('gridSize').value;
  var table = document.createElement('table');
  table.setAttribute('class', 'grid');
  table.setAttribute('id', 'gridTable');
  var tbody = document.createElement('tbody');
  table.appendChild(tbody);
  for (var row = 1; row <= gridSize; row++){
    var tr = document.createElement('tr');
    for (var cell = 1; cell <= gridSize; cell++){
      var td = document.createElement('td');
      td.setAttribute('title', 'cellTitle');
      td.setAttribute('onclick', 'switchBlack(this)');
      var text = document.createTextNode('\u00a0');
      td.appendChild(text);
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  var gridDiv = document.getElementById('grid');
  while (gridDiv.firstChild){
      gridDiv.removeChild(gridDiv.firstChild);
  }
  gridDiv.appendChild(table);
  grid = table;
  document.getElementById('btnFillClues').style.visibility = 'visible';
}

//Switch the sender cell (and possibly its matching cells) between black and white.
function switchBlack(sender){
  if (!blackRegExp.test(sender.style.backgroundColor)){
    newColor = black;
  }
  else{
    newColor = white;
  }
  sender.style.backgroundColor = newColor;
  if (document.getElementById('symmetricalGrid').checked){
//We need to find the matching cell at the opposite corner.  
    var col = Array.prototype.indexOf.call(sender.parentNode.childNodes, sender);
    var symCol = sender.parentNode.childNodes.length - (col + 1);
    var row = Array.prototype.indexOf.call(sender.parentNode.parentNode.childNodes, sender.parentNode);
    var symRow = sender.parentNode.parentNode.childNodes.length - (row + 1);
    sender.parentNode.parentNode.childNodes[symRow].childNodes[symCol].style.backgroundColor = newColor;
  }
}

//Utility functions for navigating the grid.
function isStartOfHorizontalClue(rowNum, colNum, row, cell){
  if ((blackRegExp.test(cell.style.backgroundColor)) || !(cell.nextSibling) || (blackRegExp.test(cell.nextSibling.style.backgroundColor))){
    return false;
  }
  else{
    if ((colNum == 0)||(blackRegExp.test(cell.previousSibling.style.backgroundColor))){
      return true;
    }
    else{
      return false;
    }
  }
}

function isStartOfVerticalClue(rowNum, colNum, row, cell){
  if ((blackRegExp.test(cell.style.backgroundColor))||!(row.nextSibling) || (blackRegExp.test(row.nextSibling.childNodes[colNum].style.backgroundColor))){
    return false;
  }
  else{
    if ((rowNum == 0)||(blackRegExp.test(row.previousSibling.childNodes[colNum].style.backgroundColor))){
      return true;
    }
    else{
      return false;
    }
  }
}

function fillClues(){
  if (grid != null){
    var clueNum = 0;
    tbody = grid.getElementsByTagName('tbody')[0];
    var rows = tbody.getElementsByTagName('tr');
    for (var rowNum = 0; rowNum<rows.length; rowNum++){
      var cells = rows[rowNum].getElementsByTagName('td');
      for (var colNum = 0; colNum<cells.length; colNum++){
        while (cells[colNum].firstChild){
          cells[colNum].removeChild(cells[colNum].firstChild);
        }
        cells[colNum].setAttribute('title', '');
        if ((isStartOfHorizontalClue(rowNum, colNum, rows[rowNum], cells[colNum])) || (isStartOfVerticalClue(rowNum, colNum, rows[rowNum], cells[colNum]))){
          clueNum++;
          cells[colNum].setAttribute('title', clueNum);
          var n = document.createElement('span');
          n.setAttribute('class', 'clueNum');
          var t = document.createTextNode(clueNum);
          n.appendChild(t);
          cells[colNum].appendChild(n);
        }
      }
    }
  }
  return false;
}