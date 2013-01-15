var columnCountNames = [
  'webkitColumnCount',
  'mozColumnCount',
  'columnCount'];
function changeListColumns(numcols) {
  var style = document.getElementById('liststyle').sheet.cssRules[0].style;
  for(var i = 0; i < columnCountNames.length; i++){
    if(style[columnCountNames[i]] !== undefined) {
      style[columnCountNames[i]] = numcols;
    }
  }
}
var scrollInterval = null;
var scrollMs = 75, scrollPx=1;
function scrollByVar() {
  scrollBy(0,scrollPx);
}
function scrollPage(checked) {
  if(checked === null || checked === false) {
    clearInterval(scrollInterval);
    scrollInterval = null;
  } else {
    scrollInterval = setInterval(scrollByVar,scrollMs);
  }
}
function setScrollSize(value){
  scrollPx = +value;
}
function setScrollInterval(value){
  if(scrollInterval){
    clearInterval(scrollInterval);
    scrollInterval = setInterval(scrollByVar,value);
  }
  scrollMs=value;
}