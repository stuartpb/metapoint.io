function approve(form,onok) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST','api/merge',true)
  xhr.onload=function(e){
    if (xhr.status='200') {
      onok(form)
    }
  }
  xhr.send(new FormData(form))
}

function drop(form,onok) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST','api/drop',true)
  xhr.onload=function(e){
    if (xhr.status='200') {
      onok(form)
    }
  }
  xhr.send(new FormData(form))
}

