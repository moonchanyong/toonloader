# **ToonLoader**

chrome and while extention (made by chrome api)


### Purpose

* 웹툰 정주행시 다음버튼을 누르는 동작을 없애자
* 웹툰을 볼 때 이름으로 검색하여 로드한다.
* 원하는 회차로 갈 수 있다.
* 돔에서 일정개수의 이미지를 유지한다(메모리 최적화 관련)
* 호환 플랫폼순서는 네이버-다음-레진 순으로 개발

### 마주친 고난

* html 파싱위기
  + 네이버.. 웹툰검색하면 서버사이드렌더링.. 검색하면 잘찾아지는 이유가있었다...(ssr이 seo에 좋다고 들어서..)
  + 다음은 json으로 데이터 제공해주고..
  + 간단하게 데이터로만 처리 할 생각이었는데..
    - 어차피 html도 데이터니까 그냥 진행한다.. 파싱한다
* cors
  + 또 cors문제를 마주쳣다.
  + 서버사이드 해결 말고 클라이언트 사이드에서 해결해보고싶어서 찾아본결과 프록시를 작성해야한다 한다(아이오닉에서 한번 해본적 있는거같다.)
  + 어차피 flask로 서버하나 짜고싶었으니까 서버사이드를 추가해서 해결할까싶다...
    - cors 문제 popup view를 로컬에서 키고있다는걸 깨닫고 따로 chrome extention 실행하면서 debug과정으로 옮겻다.
    - 정답이었던게, manifes파일에 permission에 url을 추가 할 수 있는데
    By adding hosts or host match patterns (or both) to the permissions section of the manifest file, the extension can request access to remote servers outside of its origin
    외부 원격서버에 접근할 수 있게해준다.
    - 클라이언트 사이드에서 해결하는게 이상해서 검색해본 결과 permission에 프록시를 추가해서 해결하는 방식이다.
    - 현재까지 클라이언트 사이드에서의 대응은 프록시를 추가하여 해결하는 방법밖에 못본거같다. (백엔드 개입없이)
* 이미지 크롤링
  + naver: 엔드포인트에서 직접 가져오려고 했지만, 엔드포인트 uri가 다르다.
    - 하지만 웹툰 뷰어에서의 uri는 동일하므로 여기서 html파싱을 이미지 주소만 가져오자
    - 볼 수 있는 권한이 없으면 302code 그리고 redirect to list
  + daum: 다음같은 경우는 서버사이드 렌더링이 아니라 우선 뷰어를 주고 데이터 요청으로 띄우기 때문에 article id를 찾고, article 띄우면 가능
    - 두번의 절차.
    - 먼저 각 화에 대한 정보를 리퀘스트, 그리고 그 정보로 이미지가 저장된 주소 가져올수있음.(timestamp를 수집하는거같으니까 찍어주자)
