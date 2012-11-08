function apicall(method,formdata,onok) {
  var xhr = new XMLHttpRequest();
  xhr.open('POST','api/'+method,true)
  xhr.onload=function(e){
    if (xhr.status='200' && onok) {
      onok()
    }
  }
  xhr.send(formdata)
}

function callWithForm(method, callbackConstructor) {
  return function(form) {
    apicall(method,new FormData(form),
      callbackConstructor(form))
  }
}

