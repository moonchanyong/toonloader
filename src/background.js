const naverSerarchURI = 'http://comic.naver.com/search.nhn?keyword=';
const daumSearchURI = 'http://webtoon.daum.net/data/pc/search/suggest?q='
const parser=new DOMParser();
const parseList = [
  { parser: parseNaverList, uri :naverSerarchURI },
  { parser: parseDaumList, uri: daumSearchURI },
]

let test;
// search button listener
document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('button').addEventListener('click', search);
});

// 구조적문법 지려버렷고
function search() {
  let keyword = encodeURI(document.getElementById('query').value);

  parseList.forEach(({parser, uri}) => {
    httpGet(`${uri}${keyword}`).then(({currentTarget})=> {
      let response = currentTarget.response;
      parser(response).then((list) => {
        list.forEach((item) => {
          console.log(item);
        });
      });
    });
  })
}

function parseDaumList(dataString) {
  let parsingData = JSON.parse(dataString).data;
  return new Promise((resolve, reject) => {
    let ret = [];
    test = parsingData;
    ret.push(...parsingData.map(({title, nickname}) => ({
      id: nickname,
      title: title,
      platform: 'daum',
    })));
    resolve(ret);
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
              ret.push({
                id: search,
                title: innerText,
                platform: 'naver',
              });
            });
        });
      });
    resolve(ret);
  });
}

function httpGet(uri) {
  let oReq = new XMLHttpRequest();
  return new Promise((resolve, reject) => {
        oReq.addEventListener("load", resolve);
        oReq.open("GET", uri);
        oReq.send();
  })
}
