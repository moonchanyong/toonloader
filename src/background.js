const naverSerarchURI = 'http://comic.naver.com/search.nhn?keyword=';
const naverToonURI = 'http://comic.naver.com/webtoon/detail.nhn';
const naverReferer = 'http://comic.naver.com/webtoon/list.nhn';
const daumSearchURI = 'http://webtoon.daum.net/data/pc/search/suggest?q=';
const parser=new DOMParser();
const parseList = [
  { parser: parseNaverList, uri :naverSerarchURI },
  { parser: parseDaumList, uri: daumSearchURI },
]

// used to deguging
let test;
let resultBox;
let currentView = {
  no: 1,
  id:'',
  platform:'',
  loading: false,
  containningCount: 0,
}

// search button listener
document.addEventListener('DOMContentLoaded', function () {
  document.getElementById('search-btn').addEventListener('click', search);
  document.getElementById('remove-btn').addEventListener('click', closeSearchBox);

  resultBox = document.getElementById('resultBox');
  resultBox.addEventListener('click', ({target}) => {
    currentView.no = 1;
    currentView.containningCount+=1;
    currentView.id = target.getAttribute('id');
    currentView.platform = target.getAttribute('platform');

    setNaverReferer(`${naverReferer}${currentView.id}`);
    loadToon(`${naverToonURI}${currentView.id}&no=${currentView.no}`);
  });

  document.addEventListener("scroll", function (event) {
    if(window.scrollY / document.body.scrollHeight * 100 > 85 && !currentView.loading) {
      currentView.loading = true;
      currentView.no+=1;
      currentView.containningCount+=1;
      if(currentView.containningCount > 3) (unloadToon(currentView.no - currentView.containningCount + 1))? currentView.containningCount-=1:console.log('fail to unload');
      console.log(currentView.no);
      loadToon(`${naverToonURI}${currentView.id}&no=${currentView.no}`)
        .then(() => {currentView.loading = false});
    } 
  });
});

function closeSearchBox() {
  // remoce all result
  Array.from(resultBox.children).forEach((item)=>{resultBox.removeChild(item)});
}

function setNaverReferer(referer) {
  chrome.webRequest.onBeforeSendHeaders.addListener(function(details){
    var newRef = referer;
    var hasRef = false;
    for(var n in details.requestHeaders){
      hasRef = details.requestHeaders[n].name == "Referer";
      if(hasRef){
          details.requestHeaders[n].value = newRef;
       break;
      }
    }
    if(!hasRef){
      details.requestHeaders.push({name:"Referer",value:newRef});
    }
    return {requestHeaders:details.requestHeaders};
  },
  {
    urls:["http://imgcomic.naver.net/*"]
  },
  [
    "requestHeaders",
    "blocking"
  ]);
}

function unloadToon(no) {
  let exist = document.getElementById(no);
  if(exist) exist.remove();
  console.log(`unload${no}`);
  return true;
}

function loadToon(uri) {
  return new Promise((resolve, reeject) => {
    httpGet(uri).then(({currentTarget}) => {
      let response = currentTarget.response;
      // TODO: naver에만 종속되는 코드
      let lists = Array.from(parser.parseFromString(response, "text/html")
        .getElementsByClassName('wt_viewer')[0].children);
      closeSearchBox();

      let toonBox = document.createElement('div');
      toonBox.setAttribute('id', currentView.no);
      lists.forEach((img) => {
        let imgEl = document.createElement('img');
        imgEl.setAttribute('src', img.src);
        imgEl.classList.add('toon-img');
        toonBox.appendChild(imgEl);
      })

      document.body.appendChild(toonBox);
      resolve(true);
    });
  })
}

function search() {
  closeSearchBox();

  let keyword = encodeURI(document.getElementById('query').value);
  parseList.forEach(({parser, uri}) => {
    httpGet(`${uri}${keyword}`).then(({currentTarget})=> {
      let response = currentTarget.response;
      parser(response).then((list) => {
        list.forEach(appendDom);
      });
    });
  });
}

function appendDom({id, title, platform}) {
  // undefined는 보여주지 않음
  if(!title) return;

  let spanEl = document.createElement('span');
  spanEl.setAttribute('id', id);
  spanEl.setAttribute('title', title);
  spanEl.setAttribute('platform', platform);
  spanEl.innerText = `${title} / ${platform}`;
  spanEl.classList.add('resultItem');
  resultBox.appendChild(spanEl);
}

function parseDaumList(dataString) {
  let parsingData = JSON.parse(dataString).data;
  return new Promise((resolve, reject) => {
    let ret = [];
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
      .splice(0,1);

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
  test = oReq;
  return new Promise((resolve, reject) => {
        oReq.addEventListener("load", resolve);
        oReq.open("GET", uri);
        oReq.send();
  })
}
