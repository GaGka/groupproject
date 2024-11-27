
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('map-container');
    const mapImage = document.getElementById('map-image');
    const resetButton = document.getElementById('reset-button');

    let containerRect = mapContainer.getBoundingClientRect();
    let imageRect = mapImage.getBoundingClientRect();
    let originX = 0;
    let originY = 0;
    let startX, startY;
    let velocityX = 0;
    let velocityY = 0;
    let friction = 0.9;
    let scale = 1; // 이미지 확대/축소 비율
    let isDragging = false; // 드래그 상태 추적 변수
    let infoBox = null;

    let markers = []; // 실제 마커 요소들을 저장할 배열

    // 이미지 초기화 함수: 이미지를 중앙에 배치
    function initializeImagePosition() {

        // 초기 위치를 컨테이너의 정중앙에 설정
        originX = (containerRect.width - imageRect.width * scale) / 2;
        originY = (containerRect.height - imageRect.height * scale) / 2;

        mapImage.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
        updateAllMarkers(); // 마커 위치 업데이트
    }

    // 마커 추가 함수
    function addMarkers() {
        let today = new Date();
        let curHour = today.getHours();
        markersData.forEach(markerData => {
            const marker = document.createElement('div');
            marker.classList.add('marker');
            if (markerData.flag != 2){ //화장실, 건물이름
                marker.innerHTML = markerData.markerContent;
            }
            else{ //출입구
                if (curHour > markerData.stime && curHour < markerData.etime){
                    marker.innerHTML = '✅';
                }
                else{
                    marker.innerHTML = '❌';
                }
            }
            marker.dataset.xRatio = markerData.xRatio;
            marker.dataset.yRatio = markerData.yRatio;
            marker.dataset.size = markerData.size;

            mapContainer.appendChild(marker);
            markers.push(marker); // 마커 배열에 추가

            // 초기 마커 위치 설정
            updateMarkerPosition(marker);

            // 말풍선이 필요한 경우에만 클릭 이벤트 추가
            if (markerData.flag != 0) {
                marker.addEventListener('click', (e) => {
                    e.stopPropagation(); // 클릭 이벤트 전파 방지
                    showInfoBox(markerData, e.clientX, e.clientY);
                });
            }
        });
    }

    // 말풍선 닫기 함수
    function closeInfoBox() {
        if (infoBox) {
            infoBox.remove();
            infoBox = null;

            // 맵 클릭 이벤트 제거
            mapContainer.removeEventListener('click', closeInfoBoxOnMapClick);
        }
    }

    function showInfoBox(markerData, clickX, clickY) {
        if (infoBox) {
            infoBox.remove(); // 기존의 말풍선 제거
        }

        infoBox = document.createElement('div');
        infoBox.classList.add('info-box');
        if (markerData.flag == 1){  //화장실 마커
            infoBox.innerHTML = `
            <h4>${markerData.info}</h4>
            <p>성별: ${markerData.gender}<\p>
            <p>${markerData.description}</p>
            <p><strong>비밀번호:</strong> ${markerData.password}</p>
        `;
        }
        else if (markerData.flag == 2){ //출입구 마커
            infoBox.innerHTML =`
            <h4>${markerData.info}</h4>
            <p>시간: ${markerData.stime}:00-${markerData.etime}:00</p>
            <p>${markerData.description}</p>
            <p><strong>비밀번호:</strong> ${markerData.password}</p>
        `;
        }

        // 말풍선을 클릭된 위치 근처에 표시
        infoBox.style.left = `${clickX}px`;
        infoBox.style.top = `${clickY}px`;
        infoBox.style.display = 'block';

        mapContainer.appendChild(infoBox);
    }

    // 맵 클릭 시 말풍선 닫기 함수
    mapContainer.addEventListener('click', (e) => {
        if (infoBox && !e.target.classList.contains('marker') && !e.target.closest('.info-box')) {
            closeInfoBox();
        }
    
        // 클릭한 위치의 xRatio와 yRatio 계산하여 콘솔에 출력
        const imgWidth = mapImage.clientWidth * scale;
        const imgHeight = mapImage.clientHeight * scale;
        const clickX = e.clientX - containerRect.left - originX;
        const clickY = e.clientY - containerRect.top - originY;
        const xRatio = clickX / imgWidth;
        const yRatio = clickY / imgHeight;

        if (xRatio >= 0 && xRatio <= 1 && yRatio >= 0 && yRatio <= 1) {
            console.log(`xRatio: ${xRatio}, yRatio: ${yRatio}`);
        }
    });

    // 마커 위치 업데이트 함수
    function updateMarkerPosition(marker) {
        const imgWidth = mapImage.clientWidth * scale; // 현재 이미지의 너비에 스케일 적용
        const imgHeight = mapImage.clientHeight * scale; // 현재 이미지의 높이에 스케일 적용

        const xRatio = parseFloat(marker.dataset.xRatio);
        const yRatio = parseFloat(marker.dataset.yRatio);

        const offsetX = originX + xRatio * imgWidth;
        const offsetY = originY + yRatio * imgHeight;

        marker.style.left = `${offsetX}px`;
        marker.style.top = `${offsetY}px`;

        // 마커의 크기를 이미지 확대/축소 비율에 맞춰 조정
        const maxMarkerSize = 12;
        const adjustedMarkerSize = Math.max(marker.dataset.size * scale, maxMarkerSize); // 최소 크기보다 작아지지 않게
        marker.style.fontSize = `${adjustedMarkerSize}px`;
    }

    // 모든 마커 위치 업데이트 함수
    function updateAllMarkers() {
        markers.forEach(marker => {
            updateMarkerPosition(marker);
        });
    }

    // 드래그 시작
    mapContainer.addEventListener('mousedown', (e) => {
        startX = e.clientX - originX;
        startY = e.clientY - originY;
        mapContainer.style.cursor = 'all-scroll';
        isDragging = true; // 드래그 상태 설정
        velocityX = 0;
        velocityY = 0;

        const mouseMoveHandler = (e) => {
            if (!isDragging) return; // 드래그 중이 아닐 경우 함수 종료

            // 드래그 이동량 계산
            let newOriginX = e.clientX - startX;
            let newOriginY = e.clientY - startY;
    
            velocityX = newOriginX - originX;
            velocityY = newOriginY - originY;
    
            originX = newOriginX;
            originY = newOriginY;

            // 이미지 이동
        
            mapImage.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;

            // 모든 마커 위치 업데이트
            updateAllMarkers();
            closeInfoBox(); // 드래그 중에는 말풍선 닫기
        };

        const mouseUpHandler = () => {
            mapContainer.style.cursor = 'default';
            isDragging = false; // 드래그 상태 해제
            mapContainer.removeEventListener('mousemove', mouseMoveHandler);
            mapContainer.removeEventListener('mouseup', mouseUpHandler);
            requestAnimationFrame(applyInertia);
        };
        
        mapContainer.addEventListener('mousemove', mouseMoveHandler);
        mapContainer.addEventListener('mouseup', mouseUpHandler);
    });

    function applyInertia() {
        if (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1) {
            originX += velocityX;
            originY += velocityY;
    
            velocityX *= friction;
            velocityY *= friction;
    
            mapImage.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;
            updateAllMarkers();
    
            requestAnimationFrame(applyInertia); // 계속해서 애니메이션 적용
        }
    }

    // 마우스 휠로 확대/축소 기능 구현 (화면 중앙 기준)
    mapContainer.addEventListener('wheel', (e) => {
        e.preventDefault(); // 기본 스크롤 방지

        const zoomAmount = 0.1; // 확대/축소 비율
        const minScale = 0.6; // 최소 스케일 설정
        const maxScale = 3; // 최대 스케일 설정
        let newScale;
        // 확대/축소 계산
        if (e.deltaY < 0) {
            // 휠을 위로 굴릴 때 확대
            newScale = Math.min(maxScale, scale + zoomAmount);
        } else {
            // 휠을 아래로 굴릴 때 축소
            newScale = Math.max(minScale, scale - zoomAmount);
        }

        // 화면의 중심 좌표 계산
        containerRect = mapContainer.getBoundingClientRect();
        const centerX = containerRect.width / 2;
        const centerY = containerRect.height / 2;

        // 이미지의 현재 중심 좌표 계산
        const imageCenterX = centerX - originX;
        const imageCenterY = centerY - originY;

        // 비율 변화에 따른 이동량 계산
        originX -= (imageCenterX * (newScale/scale - 1));
        originY -= (imageCenterY * (newScale/scale - 1));

        scale = newScale;

        // 새로운 스케일 적용
        mapImage.style.transform = `translate(${originX}px, ${originY}px) scale(${scale})`;

        // 모든 마커 위치 업데이트
        updateAllMarkers();
        closeInfoBox(); // 확대,축소 시 말풍선 닫기
    });

    // 창 크기 변경 시 초기 위치 설정
    window.addEventListener('resize', () => {
        containerRect = mapContainer.getBoundingClientRect();
        imageRect = mapImage.getBoundingClientRect();
        initializeImagePosition();
    });

    // 이미지가 로드된 후에 초기 위치 설정
    mapImage.addEventListener('load', () => {
        initializeImagePosition();
    });

    // 초기 위치로 돌아가는 버튼 클릭 이벤트 핸들러
    resetButton.addEventListener('click', () => {
        scale = 1; // 스케일도 초기화
        initializeImagePosition();
    });

    // 초기 이미지 위치 설정 (이미지가 캐시된 경우 대비)
    if (mapImage.complete) {
        initializeImagePosition();
    }

    // 초기 마커 추가
    addMarkers();
});