// 전역 변수
let currentPage = 'landing';
let userName = '';
let generatedImages = [];

// 페이지 전환
function showPage(pageId) {
    console.log('[DEBUG] showPage 호출됨, pageId:', pageId);
    try {
        const targetPage = document.getElementById(pageId);
        if (!targetPage) {
            throw new Error('페이지를 찾을 수 없습니다: ' + pageId);
        }

        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        targetPage.classList.add('active');
        currentPage = pageId;
        window.scrollTo(0, 0);
        console.log('[DEBUG] showPage 성공, currentPage:', currentPage);
    } catch (error) {
        console.error('[ERROR] showPage 실패:', error);
        alert('페이지 전환 중 오류가 발생했습니다: ' + error.message);
    }
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
    console.log('[DEBUG] nextPage 호출됨, pageNum:', pageNum);
    try {
        showPage('page' + pageNum);
        console.log('[DEBUG] nextPage 성공');
    } catch (error) {
        console.error('[ERROR] nextPage 실패:', error);
        alert('페이지 이동 중 오류가 발생했습니다: ' + error.message);
    }
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
    console.log('[DEBUG] showResults 함수 시작');
    try {
        const resultImagesDiv = document.getElementById('result-images');
        if (!resultImagesDiv) {
            throw new Error('result-images 엘리먼트를 찾을 수 없습니다');
        }
        resultImagesDiv.innerHTML = '';

        // 전체 컨테이너
        const container = document.createElement('div');
        container.style.cssText = 'max-width: 800px; margin: 0 auto; padding: 40px 20px;';

    // 타이틀
    const title = document.createElement('h1');
    title.style.cssText = 'text-align: center; font-size: 2.5em; margin-bottom: 20px; font-weight: 300;';
    title.textContent = userName ? userName + '님의 2025년 회고' : '나의 2025년 회고';
    container.appendChild(title);

    const subtitle = document.createElement('p');
    subtitle.style.cssText = 'text-align: center; color: #666; margin-bottom: 60px; font-size: 1.1em;';
    subtitle.textContent = '한 해를 돌아보며 작성한 소중한 기록들';
    container.appendChild(subtitle);

    // 1. 추구미 vs 실제미
    const section1 = createSection('2025년 나의 추구미 vs 실제미', '#667eea');

    const pursue = createCard('추구미 (내가 추구했던 모습)', '#667eea');
    const k1_1 = document.getElementById('keyword1-page1').value || '';
    const k1_2 = document.getElementById('keyword2-page1').value || '';
    const k1_3 = document.getElementById('keyword3-page1').value || '';
    const reason1 = document.getElementById('reason-page1').value || '';
    pursue.innerHTML += `
        <div style="margin-bottom: 15px;">
            <strong style="color: #667eea;">키워드:</strong> #${k1_1} #${k1_2} #${k1_3}
        </div>
        <div style="color: #666; line-height: 1.6;">
            <strong>이유:</strong> ${reason1 || '작성하지 않음'}
        </div>
    `;
    section1.appendChild(pursue);

    const reality = createCard('실제미 (실제 나의 모습)', '#764ba2');
    const k2_1 = document.getElementById('keyword1-page2').value || '';
    const k2_2 = document.getElementById('keyword2-page2').value || '';
    const k2_3 = document.getElementById('keyword3-page2').value || '';
    const reason2 = document.getElementById('reason-page2').value || '';
    reality.innerHTML += `
        <div style="margin-bottom: 15px;">
            <strong style="color: #764ba2;">키워드:</strong> #${k2_1} #${k2_2} #${k2_3}
        </div>
        <div style="color: #666; line-height: 1.6;">
            <strong>이유:</strong> ${reason2 || '작성하지 않음'}
        </div>
    `;
    section1.appendChild(reality);

    container.appendChild(section1);

    // 2. 갓생 vs 걍생
    const section2 = createSection('2025 갓생 vs 걍생', '#f093fb');
    const godlife = document.getElementById('godlife-percent').textContent;
    const normal = document.getElementById('normal-percent').textContent;
    const ratioCard = createCard('올해 나의 갓생 비율', '#f093fb');
    ratioCard.innerHTML += `
        <div style="display: flex; justify-content: space-around; margin-top: 20px;">
            <div style="text-align: center;">
                <div style="font-size: 3em; font-weight: bold; color: #667eea;">${godlife}%</div>
                <div style="margin-top: 10px; color: #666;">갓생</div>
            </div>
            <div style="text-align: center;">
                <div style="font-size: 3em; font-weight: bold; color: #764ba2;">${normal}%</div>
                <div style="margin-top: 10px; color: #666;">걍생</div>
            </div>
        </div>
    `;
    section2.appendChild(ratioCard);
    container.appendChild(section2);

    // 3. 소비 정산
    const section3 = createSection('소비 정산 - Money Log', '#fcb69f');

    const bestBuy = createCard('Best Buy 🏆', '#667eea');
    const bestReason = document.getElementById('reason-best').value || '작성하지 않음';
    bestBuy.innerHTML += `<div style="color: #666; line-height: 1.6;">${bestReason}</div>`;
    section3.appendChild(bestBuy);

    const worstBuy = createCard('Worst Buy 💸', '#764ba2');
    const worstReason = document.getElementById('reason-worst').value || '작성하지 않음';
    worstBuy.innerHTML += `<div style="color: #666; line-height: 1.6;">${worstReason}</div>`;
    section3.appendChild(worstBuy);

    const delivery = createCard('최애 배달음식 🍔', '#fcb69f');
    const deliveryReason = document.getElementById('reason-delivery').value || '작성하지 않음';
    delivery.innerHTML += `<div style="color: #666; line-height: 1.6;">${deliveryReason}</div>`;
    section3.appendChild(delivery);

    container.appendChild(section3);

    // 4. 독서모임
    const section4 = createSection('우리의 본질은 독서모임 📚', '#4facfe');
    const bookCard = createCard('2025 최고의 책', '#4facfe');
    const bookTitle = document.getElementById('book-title').value || '작성하지 않음';
    const bookReason = document.getElementById('book-reason').value || '작성하지 않음';
    const bookChange = document.getElementById('book-change').value || '작성하지 않음';
    const bookOpinion = document.getElementById('book-opinion').value || '작성하지 않음';
    bookCard.innerHTML += `
        <div style="margin-bottom: 20px;">
            <strong style="color: #4facfe; font-size: 1.3em;">${bookTitle}</strong>
        </div>
        <div style="margin-bottom: 15px; color: #666; line-height: 1.6;">
            <strong>📖 선택 이유:</strong><br>${bookReason}
        </div>
        <div style="margin-bottom: 15px; color: #666; line-height: 1.6;">
            <strong>✨ 이후 변화:</strong><br>${bookChange}
        </div>
        <div style="color: #666; line-height: 1.6;">
            <strong>💭 2026년 독서모임에 바라는 점:</strong><br>${bookOpinion}
        </div>
    `;
    section4.appendChild(bookCard);
    container.appendChild(section4);

    // 5. 나쁜 습관
    const section5 = createSection('2025년에 버리고 싶은 나쁜 습관', '#fa709a');
    const habitCard = createCard('버리고 싶은 습관', '#fa709a');
    const habitName = document.getElementById('habit1').value || '작성하지 않음';
    const habitReason = document.getElementById('habit1-reason').value || '작성하지 않음';
    const habitDamage = document.getElementById('habit1-damage').value || '작성하지 않음';
    habitCard.innerHTML += `
        <div style="margin-bottom: 20px;">
            <strong style="color: #fa709a; font-size: 1.5em;">${habitName}</strong>
        </div>
        <div style="margin-bottom: 15px; color: #666; line-height: 1.6;">
            <strong>왜 버리고 싶은가:</strong><br>${habitReason}
        </div>
        <div style="color: #666; line-height: 1.6;">
            <strong>나에게 준 손해:</strong><br>${habitDamage}
        </div>
    `;
    section5.appendChild(habitCard);
    container.appendChild(section5);

    // 6. 2026 스포일러
    const section6 = createSection('스포일러하고 싶은 2026년의 소식 📮', '#30cfd0');
    const spoilerCard = createCard('힌트 키워드', '#30cfd0');
    const spoiler1 = document.getElementById('spoiler1').value || '';
    const spoiler2 = document.getElementById('spoiler2').value || '';
    const spoiler3 = document.getElementById('spoiler3').value || '';
    const spoilers = [spoiler1, spoiler2, spoiler3].filter(s => s);
    spoilerCard.innerHTML += `
        <div style="display: flex; gap: 15px; flex-wrap: wrap; justify-content: center; margin-top: 20px;">
            ${spoilers.map(s => `<span style="background: #30cfd0; color: white; padding: 10px 20px; border-radius: 25px; font-size: 1.2em;">#${s}</span>`).join('')}
        </div>
    `;
    section6.appendChild(spoilerCard);
    container.appendChild(section6);

    // 7. 2026 비전보드
    const section7 = createSection('2026 추구미 비전보드 ✨', '#a8edea');
    const visionCard = createCard('나의 비전', '#a8edea');
    const visionK1 = document.getElementById('vision-keyword1').value || '';
    const visionK2 = document.getElementById('vision-keyword2').value || '';
    const visionK3 = document.getElementById('vision-keyword3').value || '';
    const visionKeywords = [visionK1, visionK2, visionK3].filter(k => k);
    const visionSentence = document.getElementById('vision-sentence').value || '작성하지 않음';
    visionCard.innerHTML += `
        <div style="margin-bottom: 20px;">
            <strong>키워드:</strong><br>
            <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 10px;">
                ${visionKeywords.map(k => `<span style="background: #a8edea; padding: 8px 16px; border-radius: 20px; font-size: 1.1em;">#${k}</span>`).join('')}
            </div>
        </div>
        <div style="color: #666; line-height: 1.6; font-style: italic; font-size: 1.1em; margin-top: 20px;">
            "${visionSentence}"
        </div>
    `;
    section7.appendChild(visionCard);
    container.appendChild(section7);

    // 마무리 메시지
    const footer = document.createElement('div');
    footer.style.cssText = 'text-align: center; margin-top: 60px; padding: 40px 20px; background: #f8f9fa; border-radius: 10px;';
    footer.innerHTML = `
        <h3 style="font-weight: 400; margin-bottom: 15px;">🎉 2025년 회고를 완성했습니다!</h3>
        <p style="color: #666; line-height: 1.8;">
            한 해를 돌아보는 시간을 가지셨습니다.<br>
            2026년에는 더 멋진 한 해를 만들어가세요! 💪
        </p>
    `;
    container.appendChild(footer);

    resultImagesDiv.appendChild(container);
    console.log('[DEBUG] showResults 완료, 결과 페이지로 이동');

    // 직접 DOM 조작으로 페이지 전환
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('result').classList.add('active');
    window.scrollTo(0, 0);

    } catch (error) {
        console.error('[ERROR] showResults 실패:', error);
        alert('결과 페이지 생성 중 오류가 발생했습니다: ' + error.message);
    }
}

// 섹션 생성 헬퍼 함수
function createSection(title, color) {
    const section = document.createElement('div');
    section.style.cssText = 'margin-bottom: 50px;';

    const heading = document.createElement('h2');
    heading.style.cssText = `font-size: 1.8em; margin-bottom: 25px; font-weight: 400; color: ${color}; border-bottom: 2px solid ${color}; padding-bottom: 10px;`;
    heading.textContent = title;
    section.appendChild(heading);

    return section;
}

// 카드 생성 헬퍼 함수
function createCard(title, color) {
    const card = document.createElement('div');
    card.style.cssText = 'background: white; padding: 25px; margin-bottom: 20px; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); border-left: 4px solid ' + color + ';';

    const cardTitle = document.createElement('h3');
    cardTitle.style.cssText = 'font-size: 1.3em; margin-bottom: 15px; font-weight: 400; color: #333;';
    cardTitle.textContent = title;
    card.appendChild(cardTitle);

    return card;
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
