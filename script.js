// 전역 변수
let currentPage = 'landing';
let userName = '';
let generatedImages = [];

// 페이지 전환
function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    currentPage = pageId;
    window.scrollTo(0, 0);
}

// 회고 시작
function startRetrospect() {
    const nameInput = document.getElementById('user-name');
    const name = nameInput.value.trim();
    
    if (!name) {
        alert('이름을 입력해주세요!');
        nameInput.focus();
        return;
    }
    
    userName = name;
    localStorage.setItem('userName', userName);
    showPage('page1');
}

// 다음 페이지
function nextPage(pageNum) {
    showPage('page' + pageNum);
}

// 이전 페이지
function goBack() {
    const pageNumbers = {
        'page1': 'landing',
        'page2': 'page1',
        'page3': 'page2',
        'page4': 'page3',
        'page5': 'page4',
        'page6': 'page5',
        'page7': 'page6',
        'page8': 'page7',
        'page9': 'page8',
        'result': 'page9'
    };
    
    const prevPage = pageNumbers[currentPage];
    if (prevPage) {
        showPage(prevPage);
    }
}

// 이미지 미리보기
function previewImage(input, previewId) {
    try {
        const preview = document.getElementById(previewId);
        if (!preview) {
            console.error('Preview element not found:', previewId);
            return;
        }
        
        const file = input.files[0];
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.style.backgroundImage = 'url(' + e.target.result + ')';
                const span = preview.querySelector('span');
                if (span) span.style.display = 'none';
                preview.classList.add('has-image');
            };
            reader.onerror = function(error) {
                console.error('File reading error:', error);
            };
            reader.readAsDataURL(file);
        }
    } catch (error) {
        console.error('Preview image error:', error);
    }
}

// 다중 이미지 미리보기
function previewMultipleImages(input, previewId) {
    const preview = document.getElementById(previewId);
    const files = input.files;
    
    if (files.length > 0) {
        preview.innerHTML = '';
        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                preview.appendChild(img);
            };
            reader.readAsDataURL(file);
        });
    }
}

// 비율 업데이트
function updateRatio(value) {
    const godlife = value;
    const normal = 100 - value;
    
    document.getElementById('godlife-percent').textContent = godlife;
    document.getElementById('normal-percent').textContent = normal;
}

// Canvas에 이미지를 비율 유지하며 그리기
function drawImageCover(ctx, img, x, y, width, height) {
    const imgRatio = img.width / img.height;
    const boxRatio = width / height;
    
    let sx, sy, sWidth, sHeight;
    
    if (imgRatio > boxRatio) {
        // 이미지가 더 넓음 - 높이 맞춤, 좌우 크롭
        sHeight = img.height;
        sWidth = img.height * boxRatio;
        sx = (img.width - sWidth) / 2;
        sy = 0;
    } else {
        // 이미지가 더 좁음 - 너비 맞춤, 상하 크롭
        sWidth = img.width;
        sHeight = img.width / boxRatio;
        sx = 0;
        sy = (img.height - sHeight) / 2;
    }
    
    ctx.drawImage(img, sx, sy, sWidth, sHeight, x, y, width, height);
}

// Canvas에 텍스트 그리기 (자동 줄바꿈)
function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split('');
    let line = '';
    let testLine = '';
    
    for (let n = 0; n < words.length; n++) {
        testLine += words[n];
        const metrics = ctx.measureText(testLine);
        
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n];
            testLine = words[n];
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
    return y;
}

// 이미지를 Canvas에 로드하는 헬퍼 함수
function loadImageToCanvas(inputId) {
    return new Promise(function(resolve, reject) {
        const input = document.getElementById(inputId);
        if (!input.files || !input.files[0]) {
            resolve(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                resolve(img);
            };
            img.onerror = function(error) {
                console.error('이미지 로드 실패:', error);
                resolve(null); // 에러 발생 시 null 반환하여 계속 진행
            };
            img.src = e.target.result;
        };
        reader.onerror = function(error) {
            console.error('파일 읽기 실패:', error);
            resolve(null); // 에러 발생 시 null 반환하여 계속 진행
        };
        reader.readAsDataURL(input.files[0]);
    });
}

// 1~3번 페이지 합성 이미지 생성
async function generateImage123() {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1440;
        const ctx = canvas.getContext('2d');

        // 배경 - 흰색
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let yPos = 80;

        // 제목
        ctx.fillStyle = '#333';
        ctx.font = 'bold 60px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('2025년 나의 추구미 vs 실제미', canvas.width / 2, yPos);
        yPos += 100;

        // 추구미 섹션
        ctx.fillStyle = 'white';
        ctx.fillRect(60, yPos, canvas.width - 120, 500);

        // 추구미 이미지
        const img1 = await loadImageToCanvas('img-page1');
        if (img1) {
            const imgWidth = 400;
            const imgHeight = 400;
            const imgX = (canvas.width - imgWidth) / 2;
            drawImageCover(ctx, img1, imgX, yPos + 30, imgWidth, imgHeight);
        }

        // 추구미 키워드
        ctx.fillStyle = '#667eea';
        ctx.font = 'bold 40px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        const k1_1 = document.getElementById('keyword1-page1').value || '';
        const k1_2 = document.getElementById('keyword2-page1').value || '';
        const k1_3 = document.getElementById('keyword3-page1').value || '';
        ctx.fillText('#' + k1_1 + ' #' + k1_2 + ' #' + k1_3, canvas.width / 2, yPos + 460);

        yPos += 550;

        // 실제미 섹션
        ctx.fillStyle = 'white';
        ctx.fillRect(60, yPos, canvas.width - 120, 500);

        // 실제미 이미지
        const img2 = await loadImageToCanvas('img-page2');
        if (img2) {
            const imgWidth = 400;
            const imgHeight = 400;
            const imgX = (canvas.width - imgWidth) / 2;
            drawImageCover(ctx, img2, imgX, yPos + 30, imgWidth, imgHeight);
        }

        // 실제미 키워드
        ctx.fillStyle = '#764ba2';
        ctx.font = 'bold 40px Pretendard, sans-serif';
        const k2_1 = document.getElementById('keyword1-page2').value || '';
        const k2_2 = document.getElementById('keyword2-page2').value || '';
        const k2_3 = document.getElementById('keyword3-page2').value || '';
        ctx.fillText('#' + k2_1 + ' #' + k2_2 + ' #' + k2_3, canvas.width / 2, yPos + 460);

        yPos += 550;

        // 갓생 vs 걍생
        const godlife = document.getElementById('godlife-percent').textContent;
        const normal = document.getElementById('normal-percent').textContent;

        ctx.fillStyle = 'white';
        ctx.fillRect(60, yPos, canvas.width - 120, 150);

        ctx.fillStyle = '#333';
        ctx.font = 'bold 50px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('갓생 ' + godlife + '% : 걍생 ' + normal + '%', canvas.width / 2, yPos + 90);

        // 이미지 저장
        generatedImages[0] = canvas.toDataURL('image/png');
        saveToLocalStorage();
    } catch (error) {
        console.error('이미지 생성 중 오류:', error);
    } finally {
        nextPage(4);
    }
}

// 4번 페이지 이미지 생성 (올해의 OO)
async function generateImage4() {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1440;
        const ctx = canvas.getContext('2d');

        // 배경
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 제목
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '300 60px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('2025년 올해의 OO', canvas.width / 2, 100);

        // 7개 이미지 그리드로 배치
        const images = [
            { id: 'img-music', label: '노래/앨범/뮤지션' },
            { id: 'img-movie', label: '영화/드라마/예능' },
            { id: 'img-book', label: '책' },
            { id: 'img-event', label: '사건/추억/도전' },
            { id: 'img-shopping', label: '소비/선물' },
            { id: 'img-food', label: '식당/카페' },
            { id: 'img-etc', label: '기타' }
        ];

        const gridCols = 2;
        const imgSize = 450;
        const gap = 30;
        const startX = (canvas.width - (imgSize * 2 + gap)) / 2;
        let yPos = 180;

        for (let i = 0; i < images.length; i++) {
            const col = i % gridCols;
            const row = Math.floor(i / gridCols);
            const x = startX + col * (imgSize + gap);
            const y = yPos + row * (imgSize + gap + 50);

            // 흰 배경
            ctx.fillStyle = 'white';
            ctx.fillRect(x, y, imgSize, imgSize);

            // 이미지
            const img = await loadImageToCanvas(images[i].id);
            if (img) {
                drawImageCover(ctx, img, x + 10, y + 10, imgSize - 20, imgSize - 20);
            }
        }

        generatedImages[1] = canvas.toDataURL('image/png');
        saveToLocalStorage();
    } catch (error) {
        console.error('이미지 생성 중 오류:', error);
    } finally {
        nextPage(5);
    }
}

// 5번 페이지 이미지 생성 (소비 정산)
async function generateImage5() {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1440;
        const ctx = canvas.getContext('2d');

        // 배경
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 제목
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '300 55px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('소비 정산 - Money Log', canvas.width / 2, 100);

        let yPos = 200;

        const items = [
            { id: 'best', title: 'Best Buy 🏆', color: '#667eea' },
            { id: 'worst', title: 'Worst Buy 💸', color: '#764ba2' },
            { id: 'delivery', title: '최애 배달음식 🍔', color: '#fcb69f' }
        ];

        for (const item of items) {
            // 섹션 배경
            ctx.fillStyle = 'white';
            ctx.fillRect(60, yPos, canvas.width - 120, 350);

            // 타이틀
            ctx.fillStyle = item.color;
            ctx.font = '400 40px Pretendard, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.title, canvas.width / 2, yPos + 50);

            // 이미지
            const img = await loadImageToCanvas('img-' + item.id);
            if (img) {
                drawImageCover(ctx, img, 150, yPos + 80, 250, 250);
            }

            // 이유
            ctx.fillStyle = '#333';
            ctx.font = '300 28px Pretendard, sans-serif';
            ctx.textAlign = 'left';
            const reason = document.getElementById('reason-' + item.id).value || '';
            wrapText(ctx, reason, 440, yPos + 150, 400, 40);

            yPos += 400;
        }

        generatedImages[2] = canvas.toDataURL('image/png');
        saveToLocalStorage();
    } catch (error) {
        console.error('이미지 생성 중 오류:', error);
    } finally {
        nextPage(6);
    }
}

// 6번 페이지 이미지 생성 (독서모임)
async function generateImage6() {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1440;
        const ctx = canvas.getContext('2d');

        // 배경
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 제목
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '300 50px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('우리의 본질은 독서모임', canvas.width / 2, 100);
        ctx.font = '400 40px Pretendard, sans-serif';
        ctx.fillText('2025 최고의 책', canvas.width / 2, 160);

        // 책 이미지
        const img = await loadImageToCanvas('img-bookclub');
        if (img) {
            drawImageCover(ctx, img, 240, 230, 600, 700);
        }

        // 책 제목
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '400 45px Pretendard, sans-serif';
        const title = document.getElementById('book-title').value || '';
        ctx.fillText(title, canvas.width / 2, 1000);

        // 내용 섹션
        let yPos = 1080;

        ctx.fillStyle = 'white';
        ctx.fillRect(60, yPos, canvas.width - 120, 300);

        ctx.fillStyle = '#333';
        ctx.font = '400 28px Pretendard, sans-serif';
        ctx.textAlign = 'left';

        yPos += 40;
        ctx.fillText('📖 선택 이유', 100, yPos);
        yPos += 10;
        ctx.font = '300 24px Pretendard, sans-serif';
        const reason = document.getElementById('book-reason').value || '';
        yPos = wrapText(ctx, reason, 100, yPos + 30, 880, 35);

        yPos += 50;
        ctx.font = '400 28px Pretendard, sans-serif';
        ctx.fillText('✨ 이후 변화', 100, yPos);
        yPos += 10;
        ctx.font = '300 24px Pretendard, sans-serif';
        const change = document.getElementById('book-change').value || '';
        wrapText(ctx, change, 100, yPos + 30, 880, 35);

        generatedImages[3] = canvas.toDataURL('image/png');
        saveToLocalStorage();
    } catch (error) {
        console.error('이미지 생성 중 오류:', error);
    } finally {
        nextPage(7);
    }
}

// 7번 페이지 이미지 생성 (나쁜 습관)
async function generateImage7() {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1440;
        const ctx = canvas.getContext('2d');

        // 배경
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 제목
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '300 55px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('2025년에 버리고 싶은', canvas.width / 2, 120);
        ctx.fillText('나쁜 습관', canvas.width / 2, 190);

        let yPos = 350;

        const habitName = document.getElementById('habit1').value;
        const reason = document.getElementById('habit1-reason').value || '';
        const damage = document.getElementById('habit1-damage').value || '';

        // 습관 이름
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '400 60px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(habitName, canvas.width / 2, yPos);

        yPos += 120;

        // 구분선
        ctx.strokeStyle = '#e0e0e0';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(150, yPos);
        ctx.lineTo(canvas.width - 150, yPos);
        ctx.stroke();

        yPos += 100;

        // 이유
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '400 35px Pretendard, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('왜 버리고 싶은가', 150, yPos);
        yPos += 20;
        ctx.fillStyle = '#666';
        ctx.font = '300 30px Pretendard, sans-serif';
        yPos = wrapText(ctx, reason, 150, yPos + 50, 780, 45);

        yPos += 120;

        // 손해
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '400 35px Pretendard, sans-serif';
        ctx.fillText('나에게 준 손해', 150, yPos);
        yPos += 20;
        ctx.fillStyle = '#666';
        ctx.font = '300 30px Pretendard, sans-serif';
        wrapText(ctx, damage, 150, yPos + 50, 780, 45);

        generatedImages[4] = canvas.toDataURL('image/png');
        saveToLocalStorage();
    } catch (error) {
        console.error('이미지 생성 중 오류:', error);
    } finally {
        nextPage(8);
    }
}

// 8번 페이지 이미지 생성 (2026 스포일러)
async function generateImage8() {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1440;
        const ctx = canvas.getContext('2d');

        // 배경
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 제목
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '300 50px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('스포일러하고 싶은', canvas.width / 2, 200);
        ctx.fillText('2026년의 소식', canvas.width / 2, 270);

        // 부제
        ctx.fillStyle = '#666';
        ctx.font = '300 30px Pretendard, sans-serif';
        ctx.fillText('2026년에 어떤 일이 일어날지 맞춰보세요', canvas.width / 2, 360);

        let yPos = 550;

        const spoilers = [
            document.getElementById('spoiler1').value,
            document.getElementById('spoiler2').value,
            document.getElementById('spoiler3').value
        ].filter(function(s) { return s; });

        spoilers.forEach(function(keyword, index) {
            // 키워드 배경
            ctx.fillStyle = '#fafafa';
            ctx.fillRect(150, yPos, canvas.width - 300, 200);

            // 테두리
            ctx.strokeStyle = '#e0e0e0';
            ctx.lineWidth = 1;
            ctx.strokeRect(150, yPos, canvas.width - 300, 200);

            // 키워드
            ctx.fillStyle = '#1a1a1a';
            ctx.font = '400 55px Pretendard, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('#' + keyword, canvas.width / 2, yPos + 120);

            yPos += 280;
        });

        generatedImages[5] = canvas.toDataURL('image/png');
        saveToLocalStorage();
    } catch (error) {
        console.error('이미지 생성 중 오류:', error);
    } finally {
        nextPage(9);
    }
}

// 9번 페이지 이미지 생성 (2026 비전보드)
async function generateImage9() {
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1440;
        const ctx = canvas.getContext('2d');

        // 배경
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 제목
        ctx.fillStyle = '#1a1a1a';
        ctx.font = '300 60px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('2026 추구미 비전보드', canvas.width / 2, 100);

        // 비전 이미지들 (콜라주)
        const input = document.getElementById('vision-imgs');
        if (input.files && input.files.length > 0) {
            const imgCount = Math.min(input.files.length, 6);
            const gridCols = 3;
            const imgSize = 330;
            const gap = 20;
            const startX = (canvas.width - (imgSize * gridCols + gap * 2)) / 2;
            let yPos = 200;

            for (let i = 0; i < imgCount; i++) {
                const file = input.files[i];
                const img = await new Promise(function(resolve) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        const image = new Image();
                        image.onload = function() { resolve(image); };
                        image.src = e.target.result;
                    };
                    reader.readAsDataURL(file);
                });

                const col = i % gridCols;
                const row = Math.floor(i / gridCols);
                const x = startX + col * (imgSize + gap);
                const y = yPos + row * (imgSize + gap);

                drawImageCover(ctx, img, x, y, imgSize, imgSize);
            }

            yPos += Math.ceil(imgCount / gridCols) * (imgSize + gap) + 80;
        } else {
            let yPos = 900;
        }

        // 키워드
        const keywords = [];
        for (let i = 1; i <= 5; i++) {
            const kw = document.getElementById('vision-keyword' + i).value;
            if (kw) keywords.push('#' + kw);
        }

        ctx.fillStyle = '#667eea';
        ctx.font = '400 50px Pretendard, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(keywords.join(' '), canvas.width / 2, 1100);

        // 문장
        ctx.fillStyle = '#333';
        ctx.font = '300 40px Pretendard, sans-serif';
        const sentence = document.getElementById('vision-sentence').value || '';
        wrapText(ctx, '"' + sentence + '"', canvas.width / 2, 1200, 900, 55);

        generatedImages[6] = canvas.toDataURL('image/png');
        saveToLocalStorage();
    } catch (error) {
        console.error('이미지 생성 중 오류:', error);
    } finally {
        // 로딩 페이지 1초만 표시
        showPage('loading');

        // 1초 후 결과 페이지로 이동
        setTimeout(function() {
            showResults();
        }, 1000);
    }
}

// 결과 보여주기
function showResults() {
    const resultImagesDiv = document.getElementById('result-images');
    resultImagesDiv.innerHTML = '';
    
    const titles = [
        '1. 추구미 vs 실제미',
        '2. 올해의 OO',
        '3. 소비 정산',
        '4. 최고의 책',
        '5. 나쁜 습관',
        '6. 2026 스포일러',
        '7. 2026 비전보드'
    ];
    
    generatedImages.forEach(function(imgData, index) {
        if (imgData) {
            const div = document.createElement('div');
            div.className = 'result-item';
            
            const title = document.createElement('h3');
            title.textContent = titles[index];
            div.appendChild(title);
            
            const img = document.createElement('img');
            img.src = imgData;
            div.appendChild(img);
            
            const btn = document.createElement('button');
            btn.className = 'download-btn';
            btn.textContent = '다운로드';
            btn.onclick = function() {
                downloadImage(imgData, '2025-회고-' + (index + 1) + '.png');
            };
            div.appendChild(btn);
            
            resultImagesDiv.appendChild(div);
        }
    });
    
    showPage('result');
}

// 슬라이더 좌우 이동 함수
function slideLeft() {
    const slider = document.getElementById('result-images');
    slider.scrollBy({
        left: -530,
        behavior: 'smooth'
    });
}

function slideRight() {
    const slider = document.getElementById('result-images');
    slider.scrollBy({
        left: 530,
        behavior: 'smooth'
    });
}

// 이미지 다운로드
function downloadImage(dataUrl, filename) {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    link.click();
}

// 전체 다운로드
function downloadAllImages() {
    generatedImages.forEach(function(imgData, index) {
        if (imgData) {
            setTimeout(function() {
                downloadImage(imgData, '2025-회고-' + (index + 1) + '.png');
            }, index * 500);
        }
    });
}

// LocalStorage에 저장
function saveToLocalStorage() {
    if (userName) {
        localStorage.setItem('retrospect_' + userName, JSON.stringify(generatedImages));
    }
}

// LocalStorage에서 불러오기
function loadFromLocalStorage() {
    if (userName) {
        const saved = localStorage.getItem('retrospect_' + userName);
        if (saved) {
            generatedImages = JSON.parse(saved);
        }
    }
}

// 데이터 초기화
function resetData() {
    if (confirm('정말 모든 데이터를 초기화하시겠습니까?')) {
        if (userName) {
            localStorage.removeItem('retrospect_' + userName);
        }
        generatedImages = [];
        userName = '';
        localStorage.removeItem('userName');
        location.reload();
    }
}

// 페이지 로드 시
window.addEventListener('DOMContentLoaded', function() {
    const savedName = localStorage.getItem('userName');
    if (savedName) {
        userName = savedName;
        loadFromLocalStorage();
    }
    
    // 비율 초기화
    updateRatio(50);
    
    // 폴라로이드 프레임 클릭 이벤트 등록
    document.querySelectorAll('.polaroid-frame, .polaroid-frame-small').forEach(function(frame) {
        frame.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            const targetId = this.getAttribute('data-target');
            if (targetId) {
                const input = document.getElementById(targetId);
                if (input) {
                    input.click();
                }
            }
        });
    });
    
    // 이미지 파일 변경 이벤트 등록
    const fileInputs = document.querySelectorAll('input[type="file"]');
    fileInputs.forEach(function(input) {
        input.addEventListener('change', function() {
            const targetId = this.id.replace('img-', 'preview-');
            previewImage(this, targetId);
        });
    });
    
    // 비전보드 다중 이미지 이벤트
    const visionInput = document.getElementById('vision-imgs');
    if (visionInput) {
        visionInput.addEventListener('change', function() {
            previewMultipleImages(this, 'vision-preview');
        });
    }
});
