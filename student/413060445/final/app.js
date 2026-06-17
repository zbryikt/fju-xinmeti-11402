// ==========================================
// 《千絲網絡》多聊天室系統 - 核心邏輯
// ==========================================

// --- 故事狀態樹 ---
const storyFlow = {
    // 階段一：誘惑與掙扎
    start: {
        type: "narrative",
        contact: "媽媽",
        messages: [
            { sender: "in", text: "阿豪，在學校上課嗎？" },
            { sender: "in", text: "媽媽剛下班...學校導師打來，問說你這學期的註冊費 12,000 元什麼時候能繳？" },
            { sender: "in", text: "對不起啊...媽媽這個月的餐廳薪水又被老闆拖到了，加上阿嬤這週的醫藥費..." },
            { sender: "in", text: "媽媽會再去想辦法跟親戚周轉，你乖乖上課，不要擔心喔。" }
        ],
        choices: [
            { text: "「媽，不要跟親戚借了，註冊費我自己會想辦法，我去打工。」", nextState: "mom_chat_reply" },
            { text: "「好，我知道了。媽妳辛苦了。」", nextState: "mom_chat_reply" }
        ]
    },
    mom_chat_reply: {
        type: "narrative",
        contact: "媽媽",
        messages: [
            { sender: "in", text: "打工不要耽誤課業喔，而且外面很多偏門打工的廣告，千萬不要去做壞事，知道嗎？" }
        ],
        choices: [
            { text: "（關閉與媽媽的對話，回到 LINE 列表）", nextState: "friend_ate_start" }
        ]
    },
    friend_ate_start: {
        type: "narrative",
        contact: "同學 阿德",
        messages: [
            { sender: "in", text: "臥槽阿豪！你今天有看到偉偉騎那台新買的 JET SL 來學校嗎？超爆帥的！" },
            { sender: "in", text: "他還換了最新的 iPhone 16 Pro。我問他哪來的錢，他說他幫一個學長做『偏門跑腿』，一天就賺五千塊！" },
            { sender: "in", text: "他說工作超級簡單，就是去 ATM 幫忙客戶提款而已，完全合法無風險。" }
        ],
        choices: [
            { text: "「一天五千？怎麼可能...阿德，你知道是哪種跑腿嗎？我很缺錢。」", nextState: "friend_ate_give_contact" },
            { text: "「去 ATM 幫人提款？這聽起來很像詐騙車手，要小心。」", nextState: "friend_ate_warning" }
        ]
    },
    friend_ate_warning: {
        type: "narrative",
        contact: "同學 阿德",
        messages: [
            { sender: "in", text: "我也覺得怪怪的，但偉偉說未成年犯罪又不會怎樣，法官頂多警告一下，根本沒事。" },
            { sender: "in", text: "那個介紹工作的學長阿翔還問我，身邊有沒有缺錢的朋友想一起做。你要他的聯絡方式嗎？" }
        ],
        choices: [
            { text: "「...好吧，你把學長阿翔的 LINE 推給我，我問問看。」", nextState: "friend_ate_give_contact" },
            { text: "「不要，太危險了，我打算去找輔導室老師問問有沒有工讀機會。」", nextState: "escape_early" }
        ]
    },
    friend_ate_give_contact: {
        type: "narrative",
        contact: "同學 阿德",
        messages: [
            { sender: "in", text: "那我把阿翔學長的 LINE 推給你。你直接加他，跟他聊聊看吧。" }
        ],
        choices: [
            { text: "（加學長好友，等候訊息）", nextState: "xiang_lure" }
        ]
    },
    xiang_lure: {
        type: "cognitive",
        contact: "學長 阿翔",
        messages: [
            { sender: "in", text: "阿豪是吧？阿德推薦你來的。聽說你急需用錢繳註冊費？" },
            { sender: "in", text: "我這邊有份博弈公司的資金助理工作。有些 VIP 客戶玩牌贏錢想避稅，我們幫忙把錢從 ATM 領出來。" },
            { sender: "in", text: "你只要去 ATM 領錢，領十萬分你三千，當天現領。工作絕對安全，有興趣嗎？" }
        ],
        choices: [
            { 
                text: "「太棒了，幫博弈網站領錢只是避稅而已，不算犯法吧？」", 
                nextState: "xiang_explains",
                isCorrect: false,
                warning: "「答錯了！持卡至ATM提款即觸犯洗錢罪與加重詐欺罪，帳戶會被列警示凍結。」"
            },
            { 
                text: "「這根本是騙人的話術，幫忙領錢就是詐騙集團的提款車手。」", 
                nextState: "xiang_explains",
                isCorrect: true
            }
        ]
    },
    xiang_explains: {
        type: "cognitive",
        contact: "學長 阿翔",
        messages: [
            { sender: "in", text: "哈哈，你想太多了。我們這是正當博弈出金，又不是騙人的。" },
            { sender: "in", text: "退一萬步說，你才 16 歲，在台灣法律裡未成年沒事啦！法院頂多叫你寫個悔過書，連案底都不會留。" },
            { sender: "in", text: "明天下午，我把卡跟密碼用置物櫃交給你，你去學校旁邊的超商 ATM 領十萬出來，做完當場拿三千，如何？" }
        ],
        choices: [
            { 
                text: "「也是，反正我還沒成年，就算被抓也只是口頭訓誡，不會被關也不會有前科。」", 
                nextState: "decide_first_job",
                isCorrect: false,
                warning: "「答錯了！未成年當車手仍會被送感化教育失去自由，且父母負全額民事賠償。」"
            },
            { 
                text: "「這完全是騙局，未成年一樣會被送少觀所收容，而且爸媽要連帶賠償。」", 
                nextState: "decide_first_job",
                isCorrect: true
            }
        ]
    },
    decide_first_job: {
        type: "narrative",
        contact: "學長 阿翔",
        messages: [
            { sender: "in", text: "到底要不要？爽快一點。卡片密碼我都準備好了，明天放學立刻開工。" }
        ],
        choices: [
            { text: "「學長抱歉，我真的覺得這不對勁，我不做了。」", nextState: "escape_early" },
            { text: "「好...那明天放學我去領。學長一定要保證安全喔。」", nextState: "mule_done" }
        ]
    },

    // 階段二：失控與威脅 (後果反饋一)
    mule_done: {
        type: "narrative",
        contact: "系統訊息", // 會渲染在當前聊天室
        messages: [
            { sender: "sys", text: "隔天放學，你拿著學長提供的卡片，在超商 ATM 順利提領了 10 萬元，並交給接頭人。你拿到了 3,000 元佣金。" },
            { sender: "sys", text: "你把 2,000 元塞給媽媽，騙她說是幫同學搬家賺的。看著媽媽鬆了一口氣的笑容，你心裡卻充滿了不安..." }
        ],
        choices: [
            { text: "（三天后，你感覺手機猛烈震動了一下）", nextState: "friend_ate_bad_news" }
        ]
    },
    friend_ate_bad_news: {
        type: "narrative",
        contact: "同學 阿德",
        messages: [
            { sender: "in", text: "阿豪！出大事了！你今天沒來學校不知道，偉偉今天早上在校門口直接被警察抓走了！" },
            { sender: "in", text: "聽說是之前領錢被超商監視器拍到。而且被害人告他，法院判他爸媽要連帶賠償 120 萬元！" },
            { sender: "in", text: "我傳新聞截圖給你，你千萬不要再跟那個學長聯絡了！" },
            { 
                sender: "card", 
                cardType: "news",
                title: "高職車手買酷炫機車 提款被逮父母判賠120萬",
                snippet: "【新聞截圖】16歲陳姓少年擔任詐騙車手，提領120萬遭逮捕。法院裁定感化教育，並判決其父母負民事連帶賠償120萬元全額...",
                caption: "阿德發送了一張新聞截圖照片"
            }
        ],
        choices: [
            { text: "（此時，你又收到一條來自官方帳號的新推播訊息）", nextState: "official_alert" }
        ]
    },
    official_alert: {
        type: "narrative",
        contact: "165防詐宣導官方帳號",
        messages: [
            { sender: "in", text: "【警政防詐週報】近年少年涉詐犯罪人數急遽飆升。許多青少年因輕信同儕或網路「輕鬆賺、免風險」之偏門廣告，出借帳戶或提款，因而淪為詐騙集團的犯罪工具。" },
            { sender: "in", text: "【真實數據】依據司法院統計，詐欺已連續數年蟬聯台灣少年犯罪原因之首，占比超過三成，且持續呈現上升趨勢。許多受害者因一生的積蓄被騙，對車手提出民事求償。" },
            { sender: "in", text: "【法律明鏡】依民法第 187 條，未成年人侵害他人權利者，法定代理人（父母）須負連帶賠償責任。車手通常僅分得 1%~5% 的微薄佣金，卻須背負 100% 的百萬賠償債務，導致家庭破碎。" }
        ],
        choices: [
            { text: "（看著官方警示，你的心跳加速。此時，學長阿翔發來了催促訊息）", nextState: "xiang_threat_start" }
        ]
    },
    xiang_threat_start: {
        type: "cognitive",
        contact: "學長 阿翔",
        messages: [
            { sender: "in", text: "阿豪，昨天表現不錯。老大很欣賞你。" },
            { sender: "in", text: "明天下午，有個重要任務。你要穿西裝，假扮成投資公司的理財專員，去板橋的一家咖啡廳，跟一個客戶拿 150 萬元現金。" },
            { sender: "in", text: "這單很大，老大說直接分你 2 萬元佣金！合約和假工作證我們都幫你準備好了。" }
        ],
        choices: [
            { 
                text: "「拿別人的假識別證去拿錢，只要我不承認我是假的，警察就拿我沒辦法吧？」", 
                nextState: "xiang_confront",
                isCorrect: false,
                warning: "「答錯了！假冒理專面交觸犯加重詐欺重罪，處一年以上重刑，且無法易科罰金。」"
            },
            { 
                text: "「假冒專員、出示偽造合約面交是『加重詐欺罪』，最輕本刑一年以上，會被判重刑！」", 
                nextState: "xiang_confront",
                isCorrect: true
            }
        ]
    },
    xiang_confront: {
        type: "narrative",
        contact: "學長 阿翔",
        messages: [
            { sender: "in", text: "少廢話，合約印好了。明天放學立刻去，兩萬塊現拿。" }
        ],
        choices: [
            { text: "「學長，偉偉今天被警察抓了，我不要做了！我要退出！」", nextState: "xiang_threaten_hao" },
            { text: "「兩萬塊...！好，我去做，但這是我最後一次幫你們跑腿。」", nextState: "mace_arrest" }
        ]
    },
    xiang_threaten_hao: {
        type: "cognitive",
        contact: "學長 阿翔",
        messages: [
            { sender: "in", text: "退出？哈哈，你以為是在辦家家酒嗎？" },
            { sender: "in", text: "別忘了，你之前領錢的卡片上有你的指紋，ATM 也有拍到你的臉。你已經是共犯了。" },
            { sender: "in", text: "而且你留給我們的身分證影本，還有你家餐廳的地址，老大都收好了。你要是敢放鴿子，明天我們就去餐廳找你媽收債。" },
            { sender: "in", text: "乖乖去把明天的錢拿回來，不然你全家準備完蛋。" }
        ],
        choices: [
            { 
                text: "「要是被他們找上門就糟了，我只能乖乖聽話，幫他們把明天的面交完成...」", 
                nextState: "mace_arrest",
                isCorrect: false,
                warning: "「答錯了！恐嚇為集團逼迫話術，向校方或警方求助即可獲得人身安全保護。」"
            },
            { 
                text: "「我不怕你威脅，我現在就去跟學校教官和警方坦白，我絕不去面交！」", 
                nextState: "escape_late",
                isCorrect: true
            }
        ]
    },

    // 終局狀態
    mace_arrest: {
        type: "narrative",
        contact: "系統訊息",
        messages: [
            { sender: "sys", text: "隔天下午，你穿著不合身的廉價西裝，手裡拿著偽造的投顧合約書，在板橋咖啡廳跟一名神色焦急的婦人碰面。" },
            { sender: "sys", text: "當你剛接過裝有 150 萬元現金的紙袋時，旁邊突然衝出四名便衣警察將你反手壓制在桌上！" },
            { sender: "sys", text: "「不許動！警察！你涉嫌加重詐欺現行犯被逮捕了！」" },
            { sender: "sys", text: "咖啡廳的客人都驚恐地看著你，手手銬冰冷的觸感讓你瞬間崩潰大哭..." }
        ],
        choices: [
            { text: "（在警局裡，警察准許你打一通電話給家屬。你剛開機就收到了媽媽的催促簡訊）", nextState: "mom_crying_chat" }
        ]
    },
    mom_crying_chat: {
        type: "narrative",
        contact: "媽媽",
        messages: [
            { sender: "in", text: "阿豪...你放學了嗎？你在哪裡？" },
            { sender: "in", text: "剛才警局打電話給媽媽，說你當詐騙車手在板橋被抓了，要媽媽立刻過去配合做筆錄..." },
            { sender: "in", text: "阿豪...你怎麼會去幫詐騙集團領錢...？警察說被害人被騙了 150 萬，說我們必須連帶賠償..." },
            { sender: "in", text: "媽媽的餐廳薪水跟戶頭剛剛被律師說會被扣押...媽媽快要活不下去了...嗚嗚嗚..." }
        ],
        choices: [
            { text: "「媽...對不起...我真的知道錯了...對不起...」", nextState: "court_judgment_chat" }
        ]
    },
    court_judgment_chat: {
        type: "narrative",
        contact: "臺灣板橋地方法院",
        messages: [
            { 
                sender: "card", 
                cardType: "summons",
                title: "臺灣板橋地方法院民事判決書",
                snippet: "【民事判決】被告林阿豪因加重詐欺損害賠償案件，法院判定：被告及其法定代理人（母親）應連帶賠償原告新台幣150萬元整...",
                caption: "你收到來自法院的連帶損害賠償判決"
            }
        ],
        choices: [
            { text: "（觀看模擬結局與代價結算）", nextState: "show_ending_abyss" }
        ]
    },

    // 避開早期結局
    escape_early: {
        type: "narrative",
        contact: "系統訊息",
        messages: [
            { sender: "sys", text: "你及時警醒，拒絕了高薪誘惑。你走進了學校輔導室向老師坦白。教官與少輔會介入，引導你參與合法的工讀計畫。" },
            { sender: "sys", text: "阿翔學長等犯罪集團成員在不久後被警方全面逮捕，因為你的警覺，你和你的父母免於背負百萬債務的命運。" }
        ],
        choices: [
            { text: "（觀看模擬結局與自救總結）", nextState: "show_ending_escape" }
        ]
    },
    escape_late: {
        type: "narrative",
        contact: "系統訊息",
        messages: [
            { sender: "sys", text: "你做出了正確抉擇，在學長的威脅下沒有妥協。你主動走進了學校輔導處，向教官與輔導老師全盤托出。" },
            { sender: "sys", text: "學校立刻啟動安全保護機制並通報警方，警方迅速立案並將學長阿翔等犯罪成員繩之以法。" }
        ],
        choices: [
            { text: "（觀看模擬結局與自救總結）", nextState: "show_ending_escape" }
        ]
    }
};

// --- 專案狀態變數 ---
let currentState = "start";
let currentContact = null;
let isTransitioning = false;
let disabledChoices = [];

// --- 輔助函數：取得當前格式化時間 ---
function getFormattedTime() {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, "0");
    const mm = String(now.getMinutes()).padStart(2, "0");
    return hh + ":" + mm;
}

// 聊天室獨立歷史紀錄數據結構
let chatHistories = {
    "媽媽": [],
    "同學 阿德": [],
    "學長 阿翔": [],
    "165防詐宣導官方帳號": [],
    "臺灣板橋地方法院": [],
    "系統訊息": []
};

// --- DOM 元素獲取 ---
const welcomeScreen = document.getElementById("welcome-screen");
const gameScreen = document.getElementById("game-screen");
const endingScreen = document.getElementById("ending-screen");

const startBtn = document.getElementById("start-btn");
const restartGameBtn = document.getElementById("restart-game-btn");

const chatHistory = document.getElementById("chat-history");
const choicesContainer = document.getElementById("choices-container");
const contactNameDisplay = document.getElementById("contact-name");

// Push Banner Elements
const pushNotification = document.getElementById("push-notification");
const pushSender = document.getElementById("push-sender");
const pushPreview = document.getElementById("push-preview");
const pushAvatarIcon = document.getElementById("push-avatar-icon");

// Brief Warning Elements
const briefWarningAlert = document.getElementById("brief-warning-alert");
const alertText = document.getElementById("alert-text");

// Ending Elements
const endingTitle = document.getElementById("ending-title");
const endingTypeBadge = document.getElementById("ending-type-badge");
const billCharge = document.getElementById("bill-charge");
const billSentencing = document.getElementById("bill-sentencing");
const billCompensation = document.getElementById("bill-compensation");
const billCredit = document.getElementById("bill-credit");
const billTotalCost = document.getElementById("bill-total-cost");

// Calculator
const scamAmountInput = document.getElementById("scam-amount");
const commissionRateInput = document.getElementById("commission-rate");
const rateValDisplay = document.getElementById("rate-val");
const calcEarningsDisplay = document.getElementById("calc-earnings");
const calcLiabilityDisplay = document.getElementById("calc-liability");
const calcRatioWarning = document.getElementById("calc-ratio");

// --- 首頁數據動畫效果 ---
function animateNumbers() {
    const target1 = 65.7; // 近五年少年涉詐欺人數增幅 (%)
    const target2 = 34.2; // 少年犯罪類型中詐欺占比 (%)
    
    let count1 = 0;
    let count2 = 0;
    
    const duration = 1500; // 毫秒
    const stepTime = 30;
    const steps = duration / stepTime;
    
    const increment1 = target1 / steps;
    const increment2 = target2 / steps;
    
    const timer = setInterval(() => {
        count1 += increment1;
        count2 += increment2;
        
        if (count1 >= target1) {
            document.getElementById("stat-count-1").innerText = "+" + target1.toFixed(1) + "%";
            document.getElementById("stat-count-2").innerText = target2.toFixed(1) + "%";
            clearInterval(timer);
        } else {
            document.getElementById("stat-count-1").innerText = "+" + count1.toFixed(1) + "%";
            document.getElementById("stat-count-2").innerText = count2.toFixed(1) + "%";
        }
    }, stepTime);
}

// --- 初始化事件監聽器 ---
window.addEventListener("DOMContentLoaded", () => {
    animateNumbers();
    initCalculator();
});

startBtn.addEventListener("click", () => {
    welcomeScreen.classList.remove("active-screen");
    welcomeScreen.classList.add("hidden-screen");
    gameScreen.classList.remove("hidden-screen");
    gameScreen.classList.add("active-screen");
    startStory();
});

restartGameBtn.addEventListener("click", () => {
    endingScreen.classList.remove("active-screen");
    endingScreen.classList.add("hidden-screen");
    welcomeScreen.classList.remove("hidden-screen");
    welcomeScreen.classList.add("active-screen");
    animateNumbers();
});

// --- 開始故事 ---
function startStory() {
    currentState = "start";
    currentContact = "媽媽";
    disabledChoices = [];
    isTransitioning = false;
    
    // 重設所有聊天歷史
    chatHistories = {
        "媽媽": [],
        "同學 阿德": [],
        "學長 阿翔": [],
        "165防詐宣導官方帳號": [],
        "臺灣板橋地方法院": [],
        "系統訊息": []
    };
    
    chatHistory.innerHTML = "";
    choicesContainer.innerHTML = "";
    pushNotification.classList.remove("active");
    
    loadState("start");
}

// --- 切換聊天室視窗 ---
function switchChatRoom(contactName) {
    currentContact = contactName;
    contactNameDisplay.innerText = contactName;
    
    // 清空當前顯示
    chatHistory.innerHTML = "";
    
    // 設定官方與法庭聊天室的特殊視覺樣式
    const container = document.getElementById("game-screen");
    container.className = "";
    if (contactName === "165防詐宣導官方帳號") {
        container.classList.add("contact-official");
    } else if (contactName === "臺灣板橋地方法院") {
        container.classList.add("contact-summons");
    }
    
    // 載入歷史訊息
    const history = chatHistories[contactName] || [];
    history.forEach(msg => {
        appendMessageElement(msg);
    });
    
    chatHistory.scrollTop = chatHistory.scrollHeight;
}

// --- 附加訊息元素到 DOM ---
function appendMessageElement(msg) {
    if (msg.sender === "card") {
        const cardDiv = document.createElement("div");
        cardDiv.className = `msg-card ${msg.cardType === 'news' ? 'news-card' : 'summons-card'}`;
        cardDiv.innerHTML = `
            <div class="card-image-sim ${msg.cardType === 'news' ? 'news-screenshot' : 'summons-screenshot'}">
                <i class="${msg.cardType === 'news' ? 'fa-solid fa-newspaper' : 'fa-solid fa-scale-balanced'} card-icon"></i>
                <div class="card-img-title">${msg.title}</div>
                <div class="card-img-snippet">${msg.snippet}</div>
            </div>
            <div class="card-body">
                <div class="card-caption"><i class="fa-solid fa-image"></i> ${msg.caption}</div>
            </div>
        `;
        chatHistory.appendChild(cardDiv);
    } else {
        const msgDiv = document.createElement("div");
        if (msg.sender === "in") {
            msgDiv.className = "msg msg-in";
            msgDiv.innerHTML = `${msg.text}<span class="msg-meta">${msg.time}</span>`;
        } else if (msg.sender === "out") {
            msgDiv.className = "msg msg-out";
            msgDiv.innerHTML = `${msg.text}<span class="msg-meta">${msg.time}</span>`;
        } else {
            msgDiv.className = "msg msg-system";
            msgDiv.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${msg.text}`;
        }
        chatHistory.appendChild(msgDiv);
    }
}

// --- 載入狀態 ---
function loadState(stateName) {
    currentState = stateName;
    disabledChoices = [];
    const stateInfo = storyFlow[stateName];
    
    // 檢查是否需要觸發跨聊天室推播通知
    // 如果是 start 狀態，或者新狀態的聯絡人與當前聊天室相同，或者新狀態是系統訊息，直接載入
    if (stateName === "start" || stateInfo.contact === currentContact || stateInfo.contact === "系統訊息") {
        if (stateInfo.contact !== "系統訊息") {
            currentContact = stateInfo.contact;
            contactNameDisplay.innerText = stateInfo.contact;
        }
        
        renderStateMessages(stateInfo);
    } else {
        // 需要觸發推播通知
        triggerPushNotification(stateInfo);
    }
}

// --- 觸發推播通知 ---
function triggerPushNotification(stateInfo) {
    // 取得推播預覽文字
    let previewText = "新訊息...";
    const firstMsg = stateInfo.messages[0];
    if (firstMsg) {
        previewText = firstMsg.sender === "card" ? `[圖片] ${firstMsg.title}` : firstMsg.text;
    }
    
    pushSender.innerText = stateInfo.contact;
    pushPreview.innerText = previewText;
    
    // 設定推播圖示
    pushAvatarIcon.className = "fa-solid";
    if (stateInfo.contact === "165防詐宣導官方帳號") {
        pushAvatarIcon.classList.add("fa-shield-halved");
    } else if (stateInfo.contact === "臺灣板橋地方法院") {
        pushAvatarIcon.classList.add("fa-scale-balanced");
    } else if (stateInfo.contact === "同學 阿德") {
        pushAvatarIcon.classList.add("fa-user-group");
    } else if (stateInfo.contact === "學長 阿翔") {
        pushAvatarIcon.classList.add("fa-user-ninja");
    } else {
        pushAvatarIcon.classList.add("fa-bell");
    }
    
    // 顯示推播
    pushNotification.classList.add("active");
    
    // 綁定點擊事件
    function onNotificationClick() {
        pushNotification.classList.remove("active");
        pushNotification.removeEventListener("click", onNotificationClick);
        
        // 切換聊天室視窗
        switchChatRoom(stateInfo.contact);
        
        // 載入訊息
        renderStateMessages(stateInfo);
    }
    
    pushNotification.addEventListener("click", onNotificationClick);
}

// --- 渲染當前狀態的對話訊息 ---
function renderStateMessages(stateInfo) {
    renderMessages(stateInfo.messages, () => {
        // 渲染完畢，顯示該節點的決策選項
        renderChoices(stateInfo.choices);
    });
}

// --- 漸進式渲染對話並保存到歷史中 ---
function renderMessages(messages, onComplete) {
    let msgIndex = 0;
    
    function showNextMessage() {
        if (msgIndex < messages.length) {
            const msg = messages[msgIndex];
            
            // 顯示打字中動畫
            const typing = document.createElement("div");
            typing.className = "typing-indicator";
            typing.innerHTML = `
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            `;
            chatHistory.appendChild(typing);
            chatHistory.scrollTop = chatHistory.scrollHeight;
            
            let delay = msg.sender === "sys" ? 400 : 1000;
            if (msg.sender === "card") delay = 600;
            
            setTimeout(() => {
                chatHistory.removeChild(typing);
                
                // 補齊時間屬性
                const timeStr = getFormattedTime();
                const msgWithTime = { ...msg, time: timeStr };
                
                // 附加到 DOM
                appendMessageElement(msgWithTime);
                
                // 同步寫入對應聯絡人的歷史紀錄中
                const targetHistory = stateInfoContactForHistory(msg);
                chatHistories[targetHistory].push(msgWithTime);
                
                chatHistory.scrollTop = chatHistory.scrollHeight;
                msgIndex++;
                showNextMessage();
            }, delay);
        } else {
            if (onComplete) onComplete();
        }
    }
    
    showNextMessage();
}

// 輔助判斷歷史紀錄儲存位置
function stateInfoContactForHistory(msg) {
    if (msg.sender === "sys") {
        return currentContact; // 系統訊息保存在當前活躍的聊天室中
    }
    return storyFlow[currentState].contact;
}

// --- 渲染決策選擇按鈕 ---
function renderChoices(choices) {
    choicesContainer.innerHTML = "";
    
    choices.forEach((choice, index) => {
        const btn = document.createElement("button");
        btn.className = "phone-choice-btn";
        btn.innerText = choice.text;
        
        if (disabledChoices.includes(index)) {
            btn.classList.add("locked");
            btn.style.opacity = "0.3";
            btn.style.cursor = "not-allowed";
            btn.style.borderColor = "var(--danger-red)";
            btn.innerHTML = `<i class="fa-solid fa-circle-xmark text-red"></i> ${choice.text}`;
            choicesContainer.appendChild(btn);
            return;
        }
        
        btn.addEventListener("click", () => {
            if (isTransitioning) return;
            isTransitioning = true;
            
            choicesContainer.innerHTML = "";
            
            // 玩家的回話訊息
            const userMsg = { sender: "out", text: choice.text, time: getFormattedTime() };
            
            // 附加玩家的話到當前聊天室
            appendMessageElement(userMsg);
            chatHistories[currentContact].push(userMsg);
            chatHistory.scrollTop = chatHistory.scrollHeight;
            
            // 進行狀態轉折判斷
            const stateInfo = storyFlow[currentState];
            
            if (stateInfo.type === "cognitive" && choice.isCorrect === false) {
                disabledChoices.push(index);
                
                showBriefWarning(choice.warning, () => {
                    isTransitioning = false;
                    // 警示泡泡結束後，重新渲染選項，讓玩家重新選擇
                    renderChoices(stateInfo.choices);
                });
            } else {
                isTransitioning = false;
                proceedToState(choice.nextState);
            }
        });
        
        choicesContainer.appendChild(btn);
    });
}

// --- 顯示 30字法律警示泡泡 ---
function showBriefWarning(warningText, onComplete) {
    alertText.innerText = warningText;
    briefWarningAlert.classList.add("active");
    briefWarningAlert.classList.add("shake-alert");
    
    setTimeout(() => {
        briefWarningAlert.classList.remove("active");
        briefWarningAlert.classList.remove("shake-alert");
        if (onComplete) onComplete();
    }, 3500);
}

// --- 前往下一狀態或結局 ---
function proceedToState(nextState) {
    if (nextState === "show_ending_abyss") {
        triggerEnding("abyss");
    } else if (nextState === "show_ending_escape") {
        triggerEnding("escape");
    } else {
        loadState(nextState);
    }
}

// --- 觸發結局與代價結算 ---
function triggerEnding(endingType) {
    gameScreen.classList.remove("active-screen");
    gameScreen.classList.add("hidden-screen");
    endingScreen.classList.remove("hidden-screen");
    endingScreen.classList.add("active-screen");
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    if (endingType === "abyss") {
        endingTypeBadge.innerText = "模擬結局：深淵之路";
        endingTypeBadge.className = "badge";
        endingTypeBadge.style.backgroundColor = "var(--danger-red)";
        endingTypeBadge.style.boxShadow = "0 0 15px rgba(255, 51, 68, 0.4)";
        
        endingTitle.innerText = "阿豪被補：難以挽回的家庭債務";
        billCharge.innerText = "刑法加重詐欺罪、洗錢防制法";
        billSentencing.innerText = "移送少年法庭，裁定收容並交付感化教育二年，留存司法前科。";
        billCompensation.innerText = "NT$ 1,500,000 元";
        billCredit.innerText = "名下銀行帳戶全數被列為警示帳戶，所有資金凍結，信用終身受損。";
        billTotalCost.innerText = "一生信用毀損 + 父母背負 150 萬元債務";
        
        scamAmountInput.value = 1500000;
    } else if (endingType === "escape") {
        endingTypeBadge.innerText = "模擬結局：及時回頭";
        endingTypeBadge.className = "badge";
        endingTypeBadge.style.backgroundColor = "var(--success-green)";
        endingTypeBadge.style.boxShadow = "0 0 15px rgba(0, 230, 118, 0.4)";
        
        endingTitle.innerText = "尋求師長協助，成功退出犯罪網絡";
        billCharge.innerText = "無罪（未完成犯罪，並主動尋求保護）";
        billSentencing.innerText = "學校輔導室介入諮商，警方啟動校園安全保護機制，無任何司法前科。";
        billCompensation.innerText = "NT$ 0 元";
        billCredit.innerText = "個人信用完全正常，無警示帳戶風險。";
        billTotalCost.innerText = "安全退出，重回正常校園生活";
        
        scamAmountInput.value = 0;
    }
    
    updateCalculatorResults();
}

// --- 民事賠償計算器邏輯 ---
function initCalculator() {
    scamAmountInput.addEventListener("input", updateCalculatorResults);
    commissionRateInput.addEventListener("input", () => {
        rateValDisplay.innerText = commissionRateInput.value + "%";
        updateCalculatorResults();
    });
}

function updateCalculatorResults() {
    const scamAmount = parseFloat(scamAmountInput.value) || 0;
    const rate = parseFloat(commissionRateInput.value) || 0;
    
    const earnings = Math.round(scamAmount * (rate / 100));
    const liability = scamAmount;
    
    calcEarningsDisplay.innerText = "NT$ " + earnings.toLocaleString();
    calcLiabilityDisplay.innerText = "NT$ " + liability.toLocaleString();
    
    if (earnings > 0) {
        const ratio = (liability / earnings).toFixed(1);
        calcRatioWarning.innerText = ratio;
        document.querySelector(".calc-ratio-warning").style.display = "block";
    } else {
        document.querySelector(".calc-ratio-warning").style.display = "none";
    }
}
