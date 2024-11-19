const markersData = [
    {
        xRatio: 0.3,
        yRatio: 0.5,
        info: "화장실 A",
        password: "1234",
        imageUrl: "path/to/toiletA.jpg",
        description: "지상 1층에 위치한 깨끗한 화장실입니다.",
        flag: 1, // 말풍선 표시 (1이면 말풍선이 있는 마커)
        markerContent: "🚻" // 마커의 모양 (이모지 또는 텍스트)
    },
    {
        xRatio: 0.6,
        yRatio: 0.4,
        info: "공원 입구",
        flag: 0, // 말풍선 없음 (0이면 말풍선이 없는 마커)
        markerContent: "공원 입구" // 마커의 모양 (텍스트)
    },
    {
        xRatio: 0.8,
        yRatio: 0.7,
        info: "안내소",
        flag: 0, // 말풍선 없음
        markerContent: "안내소" // 마커의 모양 (텍스트)
    }
];

const boardButton = document.getElementById('board-button');
boardButton.addEventListener('click', () => {
    window.location.href = '/board'; // 게시판 URL
});