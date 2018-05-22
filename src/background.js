const naverSerarchURI= 'http://comic.naver.com/search.nhn?keyword=';
const parser=new DOMParser();
const parseList = {
  'naver':parseNaverList
}
let platform = 'naver';
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', search);
});

let test = '';

// 구조적문법 지려버렷고
function search() {
  let value = document.getElementById('query').value;
  let uri = `${naverSerarchURI}${encodeURI(value)}`;

  httpGet(uri).then(({currentTarget})=>{
    let response = currentTarget.response;
    parseList[platform](response).then((list) => {
      console.log(list);
    })
  })
}

function parseNaverList(htmlText) {
  return new Promise((resolve, reject) => {
    let ret = [];
      let lists = Array.from(parser.parseFromString(htmlText, "text/html")
      .getElementsByClassName('resultList'))
      .splice(0,3);

      // parsing atag
      lists.forEach(({children}) => {
        Array.from(children).forEach(({children}) => {
          Array.from(children[0].getElementsByTagName('a'))
            .forEach(({search, innerText}) => {
              ret.push({search, innerText});
            });
        });
      });
    resolve(ret);
  });
}

function opennewTab() {
  return new Promise((resolve, reject) => {
    resolve()
  })
}

function httpGet(uri) {
  let oReq = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
        oReq.addEventListener("load", resolve);
        oReq.open("GET", uri);
        oReq.send();
  })
}
