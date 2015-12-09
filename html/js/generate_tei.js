/* Code for the TEI file generator; creates a crossword 
   framework file through a simple GUI on a web page. */

//Validate the input is an integer within range.
var minGridSize = 8;
var maxGridSize = 32;
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
    var gridSize = document.getElementById('gridSize').value;
    var table = document.createElement('table');
    table.setAttribute('class', 'grid');
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
}

//Switch the sender cell (and possibly its matching cells) between black and white.
function switchBlack(sender){
  if (sender.style.backgroundColor != '#000000'){
    newColor = '#000000';
  }
  else{
    newColor = '#ffffff';
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