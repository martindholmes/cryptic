/* Code for the TEI file generator; creates a crossword 
   framework file through a simple GUI on a web page. */

var xmlTemplateUrl = 'https://raw.githubusercontent.com/martindholmes/cryptic/master/xml/template/crossword.xml';
var teiNS = 'http://www.tei-c.org/ns/1.0';
var grid = null;

//Validate the input is an integer within range.
var minGridSize = 8;
var maxGridSize = 32;
var black = 'rgb(0, 0, 0)';
var white = 'rgb(255, 255, 255)';
var blackRegExp = /^rgb\(\s*0,\s*0,\s*0\s*\)$/i;
var whiteRegExp = /^rgb\(\s*255,\s*255,\s*255\s*\)$/i;
var lenRegExp = /^[0-9]+(,[0-9]+)*$/;
var lenNotCorrect = 'The stated length of this answer is not correct; it should be ';

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
      td.style.backgroundColor = white;
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
  document.getElementById('btnGenerateTei').style.visibility = 'visible';
  document.getElementById('clues').style.visibility = 'visible';
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

//Two utility functions for navigating the grid.
//These functions return the number of lights (white cells) starting
//from the current clue; in other words the length of the possible 
//answer; a value of 1 or less means that this is not the start of 
//a clue.
function numHorizontalLights(rowNum, colNum, row, cell){
  if (blackRegExp.test(cell.style.backgroundColor) || (cell.previousSibling && whiteRegExp.test(cell.previousSibling.style.backgroundColor))){
    return 0;
  }
  var lights = 1;
  while (cell.nextSibling && whiteRegExp.test(cell.nextSibling.style.backgroundColor)){
    lights += 1;
    cell = cell.nextSibling;
  }
  return lights;
}

function numVerticalLights(rowNum, colNum, row, cell){
  if (blackRegExp.test(cell.style.backgroundColor) || (row.previousSibling && whiteRegExp.test(row.previousSibling.childNodes[colNum].style.backgroundColor))){
    return 0;
  }
  var lights = 1;
  while (row.nextSibling && whiteRegExp.test(row.nextSibling.childNodes[colNum].style.backgroundColor)){
    lights += 1;
    row = row.nextSibling;
    cell = row.childNodes[colNum];
  }
  return lights;
}

/* This function parses the grid to determine where words start, and 
   creates a blank clue for each word it finds. */
function fillClues(){
  if (grid != null){
    var clueNum = 0;
    tbody = grid.getElementsByTagName('tbody')[0];
    var rows = tbody.getElementsByTagName('tr');
    if (clearClues() == false){
      return false;
    }
    var acrossList = document.createElement('ol');
    document.getElementById('across').appendChild(acrossList);
    var downList = document.createElement('ol');
    document.getElementById('down').appendChild(downList);
    for (var rowNum = 0; rowNum<rows.length; rowNum++){
      var cells = rows[rowNum].getElementsByTagName('td');
      for (var colNum = 0; colNum<cells.length; colNum++){
        while (cells[colNum].firstChild){
          cells[colNum].removeChild(cells[colNum].firstChild);
        }
        cells[colNum].setAttribute('title', '');
        var horLights = numHorizontalLights(rowNum, colNum, rows[rowNum], cells[colNum]);
        var verLights = numVerticalLights(rowNum, colNum, rows[rowNum], cells[colNum]);
        if (horLights > 1 || verLights > 1){
          clueNum++;
          cells[colNum].setAttribute('title', clueNum);
          var n = document.createElement('span');
          n.setAttribute('class', 'clueNum');
          var t = document.createTextNode(clueNum);
          n.appendChild(t);
          cells[colNum].appendChild(n);
          if (horLights > 1){
            createClue(acrossList, clueNum, horLights);
          }
          if (verLights > 1){
            createClue(downList, clueNum, verLights);
          }
        }
      }
    }
  }
  return false;
}

function clearClues(){
  var clues = document.getElementById('clues').getElementsByTagName('ol');
  if ((clues.length < 1)||(confirm('Are you sure you want to delete existing clues?'))){
    for (var i=clues.length-1; i>=0; i--){
      clues[i].parentNode.removeChild(clues[i]);
    }
    return true;
  }
  else{
    return false;
  }
}

function createClue(list, num, length){
  var item = document.createElement('li');
  item.setAttribute('value', num);
  var clue = document.createElement('span');
  clue.setAttribute('class', 'clue');
  clue.setAttribute('contenteditable', 'true');
  var t = document.createTextNode('clue');
  clue.appendChild(t);
  item.appendChild(clue);
  var len = document.createElement('span');
  len.setAttribute('class', 'len');
  len.setAttribute('contenteditable', 'true');
  len.setAttribute('onkeyup', 'checkClueLength(this, ' + length + ')');
  var n = document.createTextNode(length);
  len.appendChild(n);
  item.appendChild(len);
  var ans = document.createElement('span');
  ans.setAttribute('class', 'answer');
  ans.setAttribute('contenteditable', 'true');
  ans.appendChild(document.createTextNode('ANSWER'));
  item.appendChild(document.createElement('br'));
  item.appendChild(ans);
  list.appendChild(item);
}

function checkClueLength(sender, length){
  var len = sender.textContent;
  var lenClean = len.replace('\s+', '');
  if (lenClean != len){
    len = lenClean;
    sender.textContent = len;
  }
  var lens = len.split(',');
  var newLen = 0;
  for (var i=0; i<lens.length; i++){newLen += parseInt(lens[i]);}
  if ((!(lenRegExp.test(len))) || (newLen != length)){
    sender.style.backgroundColor = '#ffc0c0';
    sender.setAttribute('title', lenNotCorrect + length + '.');
  }
  else{
    sender.style.backgroundColor = white;
    sender.setAttribute('title', '');
  }
}

/* This function retrieves the template file for a TEI crossword 
   encoding from the code repo of this project on GitHub. 
   We work with responseText because GitHub serves the file as 
   text/plain.
*/
var teiTemplate = '';
var teiDoc = null;

function getXmlTemplate(){
  req = new XMLHttpRequest();
  req.onreadystatechange=function(){
    if (req.readyState === XMLHttpRequest.DONE) {
      if (req.status === 200) {
        teiTemplate = req.responseText;
        teiDoc = new DOMParser().parseFromString(teiTemplate, "application/xml");
        //var teiTables = teiDoc.getElementsByTagNameNS(teiNS, 'table');
        //alert('Found ' + teiTables.length + ' tables in the document.')
      } 
      else {
        alert('Warning: unable to retrieve the TEI template file for the crossword.');
      }
    }
  };
  req.open('GET', xmlTemplateUrl);
  req.send();
}

window.addEventListener('load', getXmlTemplate, false);

function createTeiGrid(){
  var htmlGrid = document.getElementById('grid');
  if (htmlGrid == null){return false;}
  var teiTables = teiDoc.getElementsByTagNameNS(teiNS, 'table');
  if (teiTables.length < 1){return false;}
  var teiGrid = teiDoc.getElementsByTagNameNS(teiNS, 'table')[0];
  for (var i=teiGrid.childNodes.length-1; i>=0; i--){
    teiGrid.removeChild(teiGrid.childNodes[i]);
  }
  var htmlRows = htmlGrid.getElementsByTagName('tr');
  for (var r=0; r<htmlRows.length; r++){
    var htmlCells = htmlRows[r].getElementsByTagName('td');
    var row = teiDoc.createElementNS(teiNS, 'row');
    teiGrid.appendChild(row);
    for (var c=0; c<htmlCells.length; c++){
      var cell = teiDoc.createElementNS(teiNS, 'cell');
      if (blackRegExp.test(htmlCells[c].style.backgroundColor)){
        cell.setAttribute('role', 'black');
      }
      if (htmlCells[c].getElementsByTagName('span').length > 0){
        cell.setAttribute('n', htmlCells[c].getElementsByTagName('span')[0].textContent);
      }
      row.appendChild(cell);
    }
  }
  return false;
}

function generateTei(){
  createTeiGrid();
  alert(new XMLSerializer().serializeToString(teiDoc));
  return false;
}
