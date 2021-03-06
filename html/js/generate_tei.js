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
var lenRegExp = /^[0-9]+(,\s*[0-9]+)*$/;
var clueNumRegExp = /^(\d+\s?(([AaDd][croswn\.]*)*(,\s*)?)*)+$/;
var intRegExp = /^\d+$/;
var downRegExp = /[dD]/;
var lenNotCorrect = 'The stated length of this answer is not correct; it should be ';
var clueNumNotCorrect = 'This clue number specification is not expected: ';

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
    var acrossList = document.createElement('ul');
    acrossList.setAttribute('class', 'clueList');
    document.getElementById('across').appendChild(acrossList);
    var downList = document.createElement('ul');
    downList.setAttribute('class', 'clueList');
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
            createClue(acrossList, clueNum, horLights, 'a');
          }
          if (verLights > 1){
            createClue(downList, clueNum, verLights, 'd');
          }
        }
      }
    }
  }
  document.getElementById('btnGenerateTei').style.visibility = 'visible';
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

function createClue(list, num, length, prefix){
  var item = document.createElement('li');
  item.setAttribute('data-length', length);
  item.setAttribute('data-num', num);
  item.setAttribute('id', prefix + num);
  var numSpan = document.createElement('span');
  numSpan.setAttribute('class', 'clueNum');
  numSpan.setAttribute('id', prefix + num + '_num');
  numSpan.setAttribute('contenteditable', 'true');
  numSpan.setAttribute('onblur', 'checkClueLength(this, ' + length + ')');
  var t = document.createTextNode(num);
  numSpan.appendChild(t);
  item.appendChild(numSpan);
  var clue = document.createElement('span');
  clue.setAttribute('class', 'clue');
  clue.setAttribute('id', prefix + num + '_clue');
  clue.setAttribute('contenteditable', 'true');
  t = document.createTextNode('clue');
  clue.appendChild(t);
  item.appendChild(clue);
  var len = document.createElement('span');
  len.setAttribute('class', 'len');
  len.setAttribute('id', prefix + num + '_len');
  len.setAttribute('contenteditable', 'true');
  len.setAttribute('onblur', 'checkClueLength(this, ' + length + ')');
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
//First, for annoying Firefox bug, we have to filter out unwanted
//<br> tags (or any tags).
  for (var i=sender.childNodes.length-1; i>=0; i--){
    if (sender.childNodes[i].nodeType === Node.ELEMENT_NODE){
      sender.removeChild(sender.childNodes[i]);
    }
  }
//Get the id prefix from the parent id.
  var idPrefix = sender.parentNode.getAttribute('id');
//If it's the clue number which has been edited:
  if (sender.getAttribute('class') == 'clueNum'){
//Next, we check to ensure the content matches the regex.
    if (!(clueNumRegExp.test(sender.textContent))){
      sender.style.backgroundColor = '#ffc0c0';
      sender.setAttribute('title', clueNumNotCorrect + sender.textContent);
      return;
    }
//Next, we parse the content to see if it's simple or complex.
    if (intRegExp.test(sender.textContent)){
      if (sender.textContent == sender.parentNode.getAttribute('data-num')){
        sender.style.backgroundColor = white;
        sender.setAttribute('title', '');
        return;
      }
      else{
//Set the display back to normal
        sender.style.backgroundColor = '#ffffff';
        sender.setAttribute('title', '');
//We're dealing with a single clue linking multiple answer slots.
        checkMultiAnswerClueLength(sender, sender.parentNode);
        return;
      }
    }
  }
  else{
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
      var clueNum = document.getElementById(idPrefix + '_num');
      if (intRegExp.test(clueNum)){
//This is supposed to be a simple clue, so it's just wrong
        sender.style.backgroundColor = '#ffc0c0';
        sender.setAttribute('title', lenNotCorrect + length + '.');
        return;
      }
      else{
        if (clueNumRegExp.test(sender.textContent)){
//Set the display back to normal
          sender.style.backgroundColor = '#ffc0c0';
          sender.setAttribute('title', clueNumNotCorrect + sender.textContent);
  //We're dealing with a single clue linking multiple answer slots.
          checkMultiAnswerClueLength(sender, sender.parentNode);
          return;
        }
        else{
//This is a mess all round.
          sender.style.backgroundColor = '#ffc0c0';
          sender.setAttribute('title', lenNotCorrect + length + '.');
          return;
        }
      }
    }
    else{
      sender.style.backgroundColor = white;
      sender.setAttribute('title', '');
    }
  }
}

function checkMultiAnswerClueLength(lastEditedComponent, item){
  var idPrefix = item.getAttribute('id');
  var num = document.getElementById(idPrefix + '_num');
  var len = document.getElementById(idPrefix + '_len');
//First we need to get an array of the ids of all the linked elements.
  var nums = num.textContent.split('[,;]\s*');
  var dir = idPrefix.substring(0,1);
  var otherDir = (dir == 'a')?'d':'a';
  var clues = new Array();
  clues.push(item);
  for (var i=1; i<nums.length; i++){
    if (intRegExp.test(nums[i])){
//No dir is specified. This means there's only one, or it inherits from
//the first one.
      var thisNum = parseInt(nums[i]);
      if (document.getElementById(dir + thisNum.toString())){
        clues.push(document.getElementById(dir + thisNum.toString()));
      }
      else{
        if (document.getElementById(otherDir + thisNum.toString())){
          clues.push(document.getElementById(otherDir + thisNum.toString()));
        }
        else{
//Unparseable; we have to fail.
          num.style.backgroundColor = '#ffc0c0';
          num.setAttribute('title', lenNotCorrect + length + '.');
          return false;
        }
      }
    }
    else{
//It has a dir specifier in it.
      var thisNum = parseInt(replace(nums[i], '[^0-9]+', ''));
      if (downRegExp.test(nums[i])){
        if (document.getElementById('d' + thisNum.toString())){
          clues.push(document.getElementById('d' + thisNum.toString()));
        }
        else{
          if (document.getElementById('a' + thisNum.toString())){
            clues.push(document.getElementById('a' + thisNum.toString()));
          }
          else{
//Unparseable; we have to fail.
            num.style.backgroundColor = '#ffc0c0';
            num.setAttribute('title', lenNotCorrect + length + '.');
            return false;            
          }
        }
      }
    }
  }
//Now we total up the length of all the items listed.
  var totalLength = 0;
  for (var i=0; i<clues.length; i++){
    totalLength += parseInt(clues[i].getAttribute('data-length'));
  }
//Now we total up the length of the components of this clue.
  var specifiedLengths = len.textContent.split('\s*[,\-]\s*');
  var totalSpecifiedLength = 0;
  for (var i=0; i<specifiedLengths.length; i++){
    totalSpecifiedLength += parseInt(specifiedLengths[i]);
  }
  if (totalLength != totalSpecifiedLength){
    len.style.backgroundColor = '#ffc0c0';
    len.setAttribute('title', lenNotCorrect + length + '.');
    return false;
  }
  
//No failures or errors found; this passes.
  return true;
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
