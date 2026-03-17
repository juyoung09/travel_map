# Travel Map Photo Atlas

여행 사진을 지역 경계 안에 넣어 저장하는 지도 앱입니다.

## 버전

1. 세계 지도
2. 한국 시 단위 지도
3. 일본 도도부현 지도
4. 특별·광역시 구 단위 상세
5. 일반 시·군 및 광역시 구의 동·읍·면 상세

## 바로 실행

### 같은 컴퓨터에서만 보기

```powershell
node scripts/serve.js
```

브라우저에서 `http://localhost:4173`을 엽니다.

### 다른 네트워크의 컴퓨터에서도 바로 보기

```powershell
node scripts/share.js
```

이 명령은 아래를 한 번에 실행합니다.

- 로컬 서버 시작
- 공용 저장 파일 연결
- 인터넷 공개 주소 생성

실행 후 터미널에 `Public share URL`이 출력됩니다. 그 주소를 다른 컴퓨터나 휴대폰에서 열면 됩니다.

공개 주소 정보는 [data/public-share-status.json](C:/Users/amkjy2545/travel_map/data/public-share-status.json)에도 저장됩니다.

중지할 때는 아래 명령을 실행합니다.

```powershell
node scripts/stop-share.js
```

## 저장 방식

- 이제 사진 배치 데이터는 [data/shared-state.json](C:/Users/amkjy2545/travel_map/data/shared-state.json)에 저장됩니다.
- 그래서 같은 공개 주소로 접속한 다른 컴퓨터도 같은 사진 배치를 바로 봅니다.
- 브라우저 `localStorage`는 보조 캐시로만 사용됩니다.

## 백업

- 앱의 `JSON 내보내기` / `JSON 불러오기` 기능은 그대로 사용할 수 있습니다.

## 참고

- `node scripts/share.js`를 실행한 컴퓨터가 켜져 있어야 다른 기기에서도 접속할 수 있습니다.
- 공개 주소는 무료 터널 주소라서 다시 실행하면 바뀔 수 있습니다.

## GitHub에서 다시 받기

```powershell
git clone https://github.com/juyoung09/travel_map.git
cd travel_map
node scripts/serve.js
```

브라우저에서 `http://localhost:4173`을 열면 됩니다.
