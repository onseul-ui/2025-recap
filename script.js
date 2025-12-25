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

    // 이름 입력은 선택사항
    userName = name || '익명';
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
// HEIC 포함 파일을 DataURL로 변환
async function fileToDataURL(file) {
  const isHeic =
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    /\.heic$/i.test(file.name) ||
    /\.heif$/i.test(file.name);

  let blob = file;

  if (isHeic) {
    if (typeof heic2any === 'undefined') {
      console.error('heic2any 라이브러리가 로드되지 않았습니다.');
      return null;
    }
    try {
      const converted = await heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 0.9
      });
      blob = Array.isArray(converted) ? converted[0] : converted;
    } catch (e) {
      console.error('HEIC 변환 실패:', e);
      return null;
    }
  }

  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => resolve(null);
    reader.readAsDataURL(blob);
  });
}

// Canvas에서 쓸 수 있는 Image 객체로 로드
function loadImageToCanvas(inputId) {
  return new Promise(async (resolve) => {
    const input = document.getElementById(inputId);
    if (!input || !input.files || !input.files[0]) {
      resolve(null);
      return;
    }

    const file = input.files[0];
    const dataUrl = await fileToDataURL(file);
    if (!dataUrl) {
      resolve(null);
      return;
    }

    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => {
      console.error('이미지 디코딩 실패:', file.name, file.type);
      resolve(null); // ❗ 실패해도 다음 페이지로 넘어가게 함
    };
    img.src = dataUrl;
  });
}

// 1~3번 페이지 합성 이미지 생성
function generateImage123() {
    console.log('generateImage123 호출됨 - 즉시 페이지 이동');
    nextPage(4);
}

// 4번 페이지 이미지 생성 (올해의 OO)
function generateImage4() {
    console.log('generateImage4 호출됨 - 즉시 페이지 이동');
    nextPage(5);
}

// 5번 페이지 이미지 생성 (소비 정산)
function generateImage5() {
    console.log('generateImage5 호출됨 - 즉시 페이지 이동');
    nextPage(6);
}

// 6번 페이지 이미지 생성 (독서모임)
function generateImage6() {
    console.log('generateImage6 호출됨 - 즉시 페이지 이동');
    nextPage(7);
}

// 7번 페이지 이미지 생성 (나쁜 습관)
function generateImage7() {
    console.log('generateImage7 호출됨 - 즉시 페이지 이동');
    nextPage(8);
}

// 8번 페이지 이미지 생성 (2026 스포일러)
function generateImage8() {
    console.log('generateImage8 호출됨 - 즉시 페이지 이동');
    nextPage(9);
}

// 9번 페이지 이미지 생성 (2026 비전보드)
function generateImage9() {
    console.log('generateImage9 호출됨 - 즉시 결과 페이지 이동');
    showPage('loading');
    setTimeout(function() {
        showResults();
    }, 1000);
}

// 결과 보여주기
function showResults() {
    const resultImagesDiv = document.getElementById('result-images');
    resultImagesDiv.innerHTML = '';
    
    const titles = [
        '1. 추구미 vs 실제미',
        '2. 올해의 OO',
        '3. 소비정산',
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

// Enter 키로 다음 입력칸 이동
document.addEventListener('keydown', function (e) {
  if (e.key !== 'Enter') return;

  const target = e.target;

  // textarea도 한 줄 입력용이면 Enter로 이동
  if (target.tagName === 'TEXTAREA') {
    e.preventDefault();
  }

  if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') return;

  const inputs = Array.from(
    document.querySelectorAll(
      'input:not([type="file"]):not([disabled]), textarea:not([disabled])'
    )
  ).filter(el => el.offsetParent !== null); // 보이는 것만

  const index = inputs.indexOf(target);
  if (index > -1 && index < inputs.length - 1) {
    inputs[index + 1].focus();
  }
});
