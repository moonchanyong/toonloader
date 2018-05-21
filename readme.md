# **ToonLoader**

chrome and while extention (made by chrome api)

### MVC
- Popup script (view)
- Content script (controller)
- Background script (model)

### Purpose

* 웹툰 정주행시 다음버튼을 누르는 동작을 없애자
* 웹툰을 볼 때 이름으로 검색하여 로드한다.
* 원하는 회차로 갈 수 있다.
* 돔에서 일정개수의 이미지를 유지한다(메모리 최적화 관련)
* 호환 플랫폼순서는 네이버-다음-레진 순으로 개발

### 마주친 고난

* html 파싱위기
  + 네이버.. 웹툰검색하면 서버사이드렌더링.. 검색하면 잘찾아지는 이유가있었다...
  + 다음은 json으로 데이터 제공해주고..
  + 간단하게 데이터로만 처리 할 생각이었는데..
