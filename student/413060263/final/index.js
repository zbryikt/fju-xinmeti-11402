// ==========================================================================
// 聲音合成引擎 (Web Audio API)
// ==========================================================================

const soundEngine = {
    audioCtx: null,
    isMuted: false,

    init() {
        // 延遲初始化，直到使用者點擊網頁
        if (!this.audioCtx) {
            this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        const muteBtn = document.getElementById('mute-btn');
        if (this.isMuted) {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-xmark"></i>';
            muteBtn.style.color = 'var(--color-alarm)';
        } else {
            muteBtn.innerHTML = '<i class="fa-solid fa-volume-high"></i>';
            muteBtn.style.color = 'var(--text-light)';
        }
        this.play('click');
    },

    play(type) {
        if (this.isMuted) return;
        this.init();
        if (this.audioCtx.state === 'suspended') {
            this.audioCtx.resume();
        }

        try {
            const now = this.audioCtx.currentTime;

            if (type === 'click') {
                // 微弱清脆點擊聲
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.type = 'sine';
                osc.frequency.setValueAtTime(800, now);
                osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
                gain.gain.setValueAtTime(0.015, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
                osc.start(now);
                osc.stop(now + 0.1);
            } 
            else if (type === 'success') {
                // 上升溫暖的和弦聲
                const frequencies = [349.23, 440.00, 523.25, 659.25]; // F4, A4, C5, E5
                frequencies.forEach((f, index) => {
                    const osc = this.audioCtx.createOscillator();
                    const gain = this.audioCtx.createGain();
                    osc.connect(gain);
                    gain.connect(this.audioCtx.destination);
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(f, now + index * 0.08);
                    gain.gain.setValueAtTime(0.02, now + index * 0.08);
                    gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 0.3);
                    osc.start(now + index * 0.08);
                    osc.stop(now + index * 0.08 + 0.35);
                });
            } 
            else if (type === 'warning') {
                // 下沉的警示聲
                const osc1 = this.audioCtx.createOscillator();
                const osc2 = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                
                osc1.connect(gain);
                osc2.connect(gain);
                gain.connect(this.audioCtx.destination);
                
                osc1.type = 'sawtooth';
                osc2.type = 'sine';
                
                osc1.frequency.setValueAtTime(220, now);
                osc1.frequency.linearRampToValueAtTime(147, now + 0.25);
                osc2.frequency.setValueAtTime(223, now);
                osc2.frequency.linearRampToValueAtTime(149, now + 0.25);
                
                gain.gain.setValueAtTime(0.025, now);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.28);
                
                osc1.start(now);
                osc2.start(now);
                osc1.stop(now + 0.3);
                osc2.stop(now + 0.3);
            } 
            else if (type === 'earthquake') {
                // 持續低頻地動聲
                const bufferSize = this.audioCtx.sampleRate * 1.2; // 1.2 秒
                const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
                const data = buffer.getChannelData(0);
                
                // 產生低頻雜訊與紅噪聲的感覺
                let lastOut = 0.0;
                for (let i = 0; i < bufferSize; i++) {
                    const white = Math.random() * 2 - 1;
                    // 一階低通濾波器
                    data[i] = (lastOut + (0.05 * white)) / 1.05;
                    lastOut = data[i];
                    data[i] *= 2.5; // 增益放大
                }
                
                const noiseNode = this.audioCtx.createBufferSource();
                noiseNode.buffer = buffer;
                
                const filter = this.audioCtx.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(80, now);
                filter.frequency.linearRampToValueAtTime(40, now + 1.2);
                
                const gainNode = this.audioCtx.createGain();
                gainNode.gain.setValueAtTime(0.4, now);
                gainNode.gain.linearRampToValueAtTime(0.001, now + 1.2);
                
                noiseNode.connect(filter);
                filter.connect(gainNode);
                gainNode.connect(this.audioCtx.destination);
                
                noiseNode.start(now);
                noiseNode.stop(now + 1.2);

                // 添加超低頻鋸齒波地鳴
                const osc = this.audioCtx.createOscillator();
                const oscGain = this.audioCtx.createGain();
                osc.type = 'sawtooth';
                osc.frequency.setValueAtTime(45, now);
                osc.frequency.linearRampToValueAtTime(20, now + 1.2);
                oscGain.gain.setValueAtTime(0.15, now);
                oscGain.gain.linearRampToValueAtTime(0.001, now + 1.2);
                osc.connect(oscGain);
                oscGain.connect(this.audioCtx.destination);
                osc.start(now);
                osc.stop(now + 1.2);
            }
            else if (type === 'alarm') {
                // 警報聲 (高低頻交替)
                const osc = this.audioCtx.createOscillator();
                const gain = this.audioCtx.createGain();
                osc.connect(gain);
                gain.connect(this.audioCtx.destination);
                osc.type = 'sine';
                
                osc.frequency.setValueAtTime(440, now);
                osc.frequency.linearRampToValueAtTime(880, now + 0.4);
                osc.frequency.linearRampToValueAtTime(440, now + 0.8);
                osc.frequency.linearRampToValueAtTime(880, now + 1.2);
                osc.frequency.linearRampToValueAtTime(440, now + 1.6);
                
                gain.gain.setValueAtTime(0.02, now);
                gain.gain.linearRampToValueAtTime(0.02, now + 1.6);
                gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
                
                osc.start(now);
                osc.stop(now + 1.8);
            }
        } catch (e) {
            console.warn("音訊播放在此瀏覽器中受限:", e);
        }
    }
};

// 監聽音量按鈕點擊
document.getElementById('mute-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    soundEngine.toggleMute();
});

// 任何網頁互動皆啟動音訊環境
document.addEventListener('click', () => {
    soundEngine.init();
}, { once: true });


// ==========================================================================
// 核心狀態管理與資料庫
// ==========================================================================

let state = {
    currentScreen: 'intro1',
    role: null, // 'A' (阿源) 或 'B' (Kevin)
    round: 1,
    maxRounds: 4,
    integrity: 30,
    consensus: 10,
    funds: 50000
};

// 抉擇事件資料庫
const eventsData = {
    'A': [
        {
            title: "一樓的水泥斜向裂縫",
            desc: "你家一樓是「阿義水果行」，李老闆愁容滿面地指著梁柱。柏油路面因長期重車擠壓已下陷數公分。水果行挑高主柱上赫然出現了一道呈現 45 度的剪力裂縫，這正是地層下陷與軟腳前兆。該如何處置？",
            options: [
                {
                    text: "自掏腰包 NT$ 15,000 聘請土木技師到場評估，用科學鑑定向全體住戶示警。",
                    cost: 15000,
                    effect: { integrity: 15, consensus: 15 },
                    log: "技師鑑定書白紙黑字寫明結構隱憂。看到專業鑑定的章，原本鐵齒的鄰居終於開始動搖、感到不安。"
                },
                {
                    text: "打 1999 通報工務局。等待公部門排期派員會勘，節省手頭預算。",
                    cost: 0,
                    effect: { integrity: 5, consensus: 0 },
                    log: "冗長的行政公文程序耗費數月。在遙遙無期的等待中，門前卡車經過帶來的震動，依然在日復一日地撕裂地基。"
                },
                {
                    text: "買來便宜油漆與補土（NT$ 1,500）抹平裂縫，免得引起恐慌影響房價。",
                    cost: 1500,
                    effect: { integrity: -10, consensus: -5 },
                    log: "表面裂縫雖然被掩蓋了，但水泥柱內部的鋼筋剪切應力仍在無聲惡化。鄰居對結構危機一無所知，房價看似保住了，但危險指數已然飆升。"
                }
            ],
            footnote: "【真實報導】阿義水果行李老闆住在這裡三十年，對周遭道路凹凸不平與重車震動早已習以為常，對身處高度土壤液化區毫無所覺。土木技師指出，一樓挑高的老公寓缺乏牆體，是典型的「軟腳層」危險型態。"
        },
        {
            title: "一坪換一坪的算盤",
            desc: "你召開住戶會議推動結構加固，然而鄰居翁先生不耐煩地反駁：『都更建商不給一坪換一坪我絕不簽字！反正這房子都住了四十年，哪那麼容易倒？』會議室隨即被利益得失的爭吵淹沒。你該怎麼做？",
            options: [
                {
                    text: "自掏腰包 NT$ 10,000 舉辦茶會，挨家挨戶低頭遊說鄰居，主打安全重於資產利益。",
                    cost: 10000,
                    effect: { integrity: 0, consensus: 20 },
                    log: "你的真誠與熱茶點心打動了幾位老鄰居。雖然還沒正式簽約，但防震安全的話題開始被鄰里重視，整合共識有了微幅進展。"
                },
                {
                    text: "順應大流，承諾自己會去代表住戶跟建商爭取到最優厚、最不可能實施的補償方案。",
                    cost: 0,
                    effect: { integrity: -10, consensus: 10 },
                    log: "鄰居雖然高興地支持你，但超乎常理的補償期望讓建商望而卻步，都更談判陷入無限期卡死，老房結構危機持續擱置。"
                },
                {
                    text: "當場和鄰居大吵：『命都沒了還管幾坪！』不歡而散。",
                    cost: 0,
                    effect: { integrity: 0, consensus: -20 },
                    log: "談判徹底破裂。你被貼上「想撈都更油水、多管閒事」的標籤，鄰居對你產生極深的防備心，後續遊說大門被徹底關上。"
                }
            ],
            footnote: "【真實報導】西盛里里長陳金田感嘆，里內老公寓比例超過70%卻從無都更成功案例。多數里民只關注能拿到多少補貼，避險意識消極，推廣防災防震非常困難。"
        },
        {
            title: "工務局的 100% 同意高牆",
            desc: "新北市政府工務局宣佈提供高達數百萬的「弱層補強補助」，但致命申請門檻為：**「必須取得整棟公寓所有權人 100% 簽字同意」**。四樓房東早已移居，對老屋毫不在意，也拒接電話。你該怎麼做？",
            options: [
                {
                    text: "自費火車票與重禮（NT$ 15,000），親自南下房東老家登門拜訪，用毅力遊說簽字。",
                    cost: 15000,
                    effect: { integrity: 35, consensus: 40 },
                    log: "房東被你鍥而不捨的誠意打動，終於簽下了同意書。這在現實老屋整合中是萬分之一的奇蹟！你終於成功解鎖政府補助的耐震補強工程！"
                },
                {
                    text: "將傳單塞進信箱，期待租客能幫你轉達。自己回水果行忙碌度日。",
                    cost: 0,
                    effect: { integrity: 5, consensus: 5 },
                    log: "文件被當作廣告信扔掉。因為無法取得 100% 同意，補強案在行政高牆前宣告夭折，大樓只能以原樣繼續承受地動風險。"
                }
            ],
            footnote: "【真實法規】新北市工務局證實，推動安全加固與都更最大瓶頸是「住戶意願整合難」。全台有大量耐震有隱憂的老舊公寓，因少數所有權人反對或失聯而深陷結構死衚衕。"
        },
        {
            title: "最後的防災防禦準備",
            desc: "強震警報風聲漸緊，地殼深處頻頻傳來微弱地動。眼看結構補強工程遲遲難以落地，看著手頭僅剩的微薄資金，你決定做最後的個人應急準備：",
            options: [
                {
                    text: "拿出 NT$ 8,000 為全家購買專業避難包、緩降繩與堅固的安全帽，並演練逃生動線。",
                    cost: 8000,
                    effect: { integrity: 15, consensus: 0 },
                    log: "你準備了緊急求生物資並熟稔了逃生路徑。雖然無法阻止房屋結構的悲劇，但這套裝備極有可能在傾倒的廢墟中挽救生命。"
                },
                {
                    text: "把資金留存在身邊，相信四十年來都沒倒過的房子，這次也一定能撐過去。",
                    cost: 0,
                    effect: { integrity: 0, consensus: 0 },
                    log: "你沒有採取額外的防災防禦開銷。在大漢溪萬年古河道的流砂之上，老房子的耐震極限在靜默中逼近零界點。"
                }
            ],
            footnote: "【專家建議】面對無法推動都更的困局，技師賴俊安建議居民應主動加強家中的非結構抗震，如固定重型傢俱、準備防災包。儘管這無法解決主梁危局，卻是無奈之下的最後防線。"
        }
    ],
    'B': [
        {
            title: "公積金與阻尼器維護",
            desc: "你住在新莊副都心新建大樓。管委會本月依據建案規章，規劃提撥社區公積金，聘請原廠廠商對大樓地下連續壁與阻尼防震系統進行年度例行安檢。你需要表態投票：",
            options: [
                {
                    text: "於社區手機 App 一鍵點選「同意覆議」。整個過程無須你額外自掏腰包。",
                    cost: 0,
                    effect: { integrity: 10, consensus: 5 },
                    log: "管委會專業秘書迅速彙整選票，大樓抗震設備與阻尼器通過原廠檢驗，維持在完美抗震狀態。"
                }
            ],
            footnote: "【真實法規】現行建築法規對新建案有著嚴格的地質鑽探與抗震規範。新大樓在規劃階段，建商就已被強制要求透過樁基礎、筏式基礎等昂貴工程，將液化及斷層衝擊在建造期就化解。"
        },
        {
            title: "精裝防震室內規劃",
            desc: "裝潢設計師詢問你：是否要額外花費經費，加裝「重型櫃體與家電壁面膨脹螺絲防震固定」？這可以確保強震時家具不會傾倒砸傷人。",
            options: [
                {
                    text: "同意。自費 NT$ 12,000 進行最高規格的室內防震固定防護施工。",
                    cost: 12000,
                    effect: { integrity: 15, consensus: 0 },
                    log: "所有高大櫥櫃、重型電器均透過金屬錨栓牢牢嵌入大樓實心結構牆，徹底杜絕地震家具傾倒造成的砸傷風險。"
                },
                {
                    text: "拒絕。為了室內美觀，且新大樓耐震性強，不需破壞精美的石膏背景牆。",
                    cost: 0,
                    effect: { integrity: 0, consensus: 0 },
                    log: "你保留了精緻奢華的背景牆面。然而若遭遇劇烈高頻晃動，高層大樓產生的共振依然可能讓沉重衣櫃與家電倒塌傾瀉。"
                }
            ],
            footnote: "【工程實務】新建案的牆體採用鋼筋混凝土澆灌，具有良好的防傾力。相較於老公寓疏鬆的水泥砂漿，新建案的承重牆更容易施作最高規的非結構抗震防護。"
        },
        {
            title: "地震險與財產防禦",
            desc: "保險經理向你推薦「擴大地震災害保險與建物傾斜損失險」，年保費需自付，能為在液化區高價購置的房屋提供最周全的財務後盾：",
            options: [
                {
                    text: "同意投保（NT$ 6,000）。替高達數千萬的房產買一份心安與徹底的風險轉移工具。",
                    cost: 6000,
                    effect: { integrity: 10, consensus: 0 },
                    log: "投保完成。你利用健全的保險避險工具，將地質液化沉陷帶來的千萬資產貶值風險順利轉嫁給跨國金融機構。"
                },
                {
                    text: "拒絕。認為大樓結構完美，且連續壁已打入岩盤，不需繳納額外的保費。",
                    cost: 0,
                    effect: { integrity: 0, consensus: 0 },
                    log: "你保留了手頭的保費資金。雖然大樓結構足以保命，但地基微幅沉陷所導致的房產價值波動風險，仍需由您個人完全承擔。"
                }
            ],
            footnote: "【社會現實】高收入階層能靈活地藉由保險、信託等金融商品規避天災帶來的巨大財務風險。然而，這樣的抗風險門檻，卻是老公寓居民根本無法企及的奢求。"
        },
        {
            title: "老鄰里的防災演習請求",
            desc: "對面大觀街老公寓自救會會長找上門，詢問副都心大樓管委會：能否在防災演習中，開放你們新大樓的耐震防空避難大廳與廣場，作為對面老住戶在地震時的臨時救災安置處？",
            options: [
                {
                    text: "同意。積極推動大樓管委會簽字協調，將新大樓資源共享給周遭缺乏防衛力的老鄰居。",
                    cost: 0,
                    effect: { integrity: 0, consensus: 20 },
                    log: "新舊大樓正式簽署防災聯防協議。這是一次跨越社區階級的高尚防災行動，贏得社會輿論的高度稱讚。"
                },
                {
                    text: "拒絕。以維護社區隱私、避免外人影響房價與大樓出入安全為由，予以婉拒。",
                    cost: 0,
                    effect: { integrity: 0, consensus: -10 },
                    log: "管委會發出委婉謝絕信。大街兩側，一邊是銅牆鐵壁的安全重劃區，一邊是隨時有崩塌風險的老巷弄，階層線在此涇渭分明。"
                }
            ],
            footnote: "【社會不平等】在高度發達的現代重劃區，許多豪宅型大樓與周遭老舊聚落形成「防禦割裂」。資源與高牆將安全的富人區包圍，老舊巷弄的脆弱防線則被遠遠排除在外。"
        }
    ]
};

// 新莊重點路段液化數據庫 (用於地圖點擊)
const roadDB = {
    '西盛街': {
        risk: '高度液化潛勢區 🔴',
        riskClass: 'text-[#8c251e] bg-[#fdf2f2] border border-[#f5c2c2]',
        desc: '本區域位於古大漢溪沉積核心。地質富含高度飽和細砂且地下水位極高，30年以上老舊公寓密度超過70%。地震時地層極易發生不均勻沉陷，導致建築傾斜或一樓軟腳結構折斷。',
        action: '老舊住宅急需居民凝聚防震安全意識。應優先透過社區管委會或里長，申請政府「耐震設計能力初步評估補助」與「弱層結構性加固補強」，針對一樓軟腳柱包覆鋼鈑。'
    },
    '大觀街': {
        risk: '高度液化潛勢區 🔴',
        riskClass: 'text-[#8c251e] bg-[#fdf2f2] border border-[#f5c2c2]',
        desc: '文德里高齡公寓密集區。多為無地下室、淺基礎的老舊四層步梯公寓。地下水位距離地表僅2~3米，且有許多長輩習慣於舊生活環境，對地盤液化風險毫無警覺。',
        action: '居民應檢視家中柱體大樑是否出現顯著的45度斜向裂縫。若整合困難，可申請免拆除的「弱層補強」補助，用低預算為大樓強行搶下強震時的防倒生存空間。'
    },
    '中正路': {
        risk: '中度至高度液化 🟡/🔴',
        riskClass: 'text-[#b45309] bg-[#fef3c7] border border-[#fde68a]',
        desc: '捷運新莊線沿路幹道，近年興建的大樓與早期民宅交叉並存。新大樓在法規強制下施作了優良地盤改良，但夾雜其中的老舊店鋪基礎防禦依舊脆弱。',
        action: '老舊民房產權所有人應避免因一味等待建商都更談判的一坪換一坪利益，而讓生命安全暴露於防震空窗期中。可主動聯絡技師評估基礎加強。'
    },
    '新北大道': {
        risk: '中度液化潛勢 🟡',
        riskClass: 'text-[#2f6a4f] bg-[#f0fdf4] border border-[#bbf7d0]',
        desc: '副都心重劃區所在地。大部分建案在近年開發，皆嚴格遵守1999年後修訂的新防震設計規範，大樓基礎施作了深大連續壁防滲牆與筏式樁基，直接打入堅硬基岩。',
        action: '大樓管委會應維持社區抗震阻尼器與地下連續壁結構的定期安檢維護。在新建制法規保護下，重劃區具有極佳的地質災害天然抵禦力。'
    },
    '中港路': {
        risk: '高度液化潛勢區 🔴',
        riskClass: 'text-[#8c251e] bg-[#fdf2f2] border border-[#f5c2c2]',
        desc: '歷史上新莊重要的古排水與灌溉沉積帶，地下砂層飽和度極高。地震來襲時剪力傳播極快，是土壤液化沉陷典型好發高危區段。',
        action: '居民可主動向技師公會諮詢，協助凝聚整棟住戶意見，主動施作階段性地盤灌漿加固或一樓挑高支柱強度補強，以防發生嚴重沉陷。'
    }
};


// ==========================================================================
// 頁面與流程控制
// ==========================================================================

function changeScreen(screenId) {
    soundEngine.play('click');
    
    // 隱藏所有畫面
    const screens = document.querySelectorAll('.screen-section');
    screens.forEach(s => {
        s.classList.remove('active');
    });

    // 顯示目標畫面
    const target = document.getElementById(`screen-${screenId}`);
    if (target) {
        target.classList.add('active');
    }
    state.currentScreen = screenId;

    // 當切換到角色選擇畫面，重置背景模式
    if (screenId === 'role_select') {
        document.body.classList.remove('emergency-mode');
    }
}

function selectRole(roleType) {
    state.role = roleType;
    state.round = 1;

    // 根據角色初始化不同狀態
    if (roleType === 'A') {
        state.integrity = 30;
        state.consensus = 10;
        state.funds = 50000;
        document.getElementById('player-avatar-icon').innerText = '🏚️';
        document.getElementById('player-display-name').innerText = '阿源 (南新莊老公寓)';
        
        // 更新 SVG 模擬器初始顯示：隱藏新大樓，顯示老公寓，並重置鋼鈑加固與裂縫
        document.getElementById('building-tower').style.display = 'none';
        document.getElementById('building-apartment').style.display = 'block';
        resetApartmentSVG();
    } else {
        state.integrity = 85;
        state.consensus = 100; // 新大樓管委會整合度健全
        state.funds = 150000;
        document.getElementById('player-avatar-icon').innerText = '🏙️';
        document.getElementById('player-display-name').innerText = 'Kevin (副都心新大樓)';
        
        // 更新 SVG 模擬器初始顯示：顯示新大樓，隱藏老公寓
        document.getElementById('building-apartment').style.display = 'none';
        document.getElementById('building-tower').style.display = 'block';
    }

    updateUI();
    loadEvent();
    changeScreen('gameplay');
}

function resetApartmentSVG() {
    // 復原老公寓 SVG 狀態
    const apt = document.getElementById('building-apartment');
    apt.setAttribute('transform', 'translate(0, 0) rotate(0)');
    
    // 隱藏加固與裂縫
    document.getElementById('reinforce-left').style.opacity = '0';
    document.getElementById('reinforce-mid').style.opacity = '0';
    document.getElementById('reinforce-right').style.opacity = '0';
    document.getElementById('crack-left').style.opacity = '0';
    document.getElementById('crack-mid').style.opacity = '0';
    document.getElementById('crack-right').style.opacity = '0';
}

function updateUI() {
    state.integrity = Math.max(0, Math.min(100, state.integrity));
    state.consensus = Math.max(0, Math.min(100, state.consensus));

    // 更新數值與進度條
    document.getElementById('val-integrity').innerText = `${state.integrity}%`;
    const barInt = document.getElementById('bar-integrity');
    barInt.style.width = `${state.integrity}%`;
    
    // 安全度進度條配色
    if (state.integrity < 50) {
        barInt.className = 'progress-bar bg-risk';
    } else if (state.integrity < 80) {
        barInt.className = 'progress-bar bg-warning';
    } else {
        barInt.className = 'progress-bar bg-safe';
    }

    document.getElementById('val-consensus').innerText = `${state.consensus}%`;
    const barCon = document.getElementById('bar-consensus');
    barCon.style.width = `${state.consensus}%`;
    if (state.consensus < 40) {
        barCon.className = 'progress-bar bg-risk';
    } else if (state.consensus < 75) {
        barCon.className = 'progress-bar bg-warning';
    } else {
        barCon.className = 'progress-bar bg-safe';
    }

    document.getElementById('player-funds').innerText = `NT$ ${state.funds.toLocaleString()}`;
    document.getElementById('game-round-title').innerText = `階段 ${state.round} / ${state.maxRounds}`;

    // 動態更新 SVG 中房屋加固視覺（僅阿源）
    if (state.role === 'A') {
        const addedIntegrity = state.integrity - 30; // 初始30
        const reinLeft = document.getElementById('reinforce-left');
        const reinMid = document.getElementById('reinforce-mid');
        const reinRight = document.getElementById('reinforce-right');

        // 依據安全度增加程度，動態展現柱子包覆鋼鈑的數量
        if (addedIntegrity >= 15) reinLeft.style.opacity = '1';
        else reinLeft.style.opacity = '0';
        
        if (addedIntegrity >= 30) reinMid.style.opacity = '1';
        else reinMid.style.opacity = '0';
        
        if (addedIntegrity >= 45) reinRight.style.opacity = '1';
        else reinRight.style.opacity = '0';
    }
}

function loadEvent() {
    const events = eventsData[state.role];
    const activeEvent = events[state.round - 1];

    if (!activeEvent) {
        // 回合結束，進入強震速報
        triggerEarthquake();
        return;
    }

    document.getElementById('event-title').innerText = activeEvent.title;
    document.getElementById('event-desc').innerText = activeEvent.desc;
    document.getElementById('footnote-text').innerText = activeEvent.footnote;

    // 渲染選項按鈕
    const optionsContainer = document.getElementById('event-options');
    optionsContainer.innerHTML = '';
    
    activeEvent.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = "btn-option";
        if (state.role === 'B') {
            btn.classList.add('option-kevin');
        }
        
        let costTag = opt.cost > 0 
            ? `<span style="color: var(--color-alarm); font-weight: 700; margin-left: 1rem; font-family: monospace;">-NT$ ${opt.cost.toLocaleString()}</span>` 
            : `<span style="color: var(--color-kevin); font-weight: 700; margin-left: 1rem; font-size: 0.75rem;">無須自費</span>`;
        
        btn.innerHTML = `
            <span style="line-height: 1.5; text-align: left;">${idx + 1}. ${opt.text}</span>
            ${costTag}
        `;
        btn.onclick = () => handleDecision(opt);
        optionsContainer.appendChild(btn);
    });
}

function handleDecision(opt) {
    if (state.funds < opt.cost) {
        soundEngine.play('warning');
        showToast("⚠️ 預算不足！在現實的老屋抗震中，往往因為鄰里間幾千元、幾萬元的出資分攤談不攏，最後落得全面擱置，令危樓毫無保障地迎向震災。");
        return;
    }

    // 扣除預算並更新數值
    const oldIntegrity = state.integrity;
    const oldConsensus = state.consensus;

    state.funds -= opt.cost;
    if (opt.effect) {
        if (opt.effect.integrity) state.integrity += opt.effect.integrity;
        if (opt.effect.consensus) state.consensus += opt.effect.consensus;
    }

    // 計算增減幅度以利於回饋頁呈現
    const diffIntVal = state.integrity - oldIntegrity;
    const diffConVal = state.consensus - oldConsensus;

    // 播放提示聲
    if (diffIntVal > 0 || diffConVal > 0) {
        soundEngine.play('success');
    } else {
        soundEngine.play('click');
    }

    // 展現輕微屏幕震動，表示抉擇帶來的微幅衝擊
    const simBox = document.querySelector('.svg-container');
    simBox.classList.add('shake-active');
    setTimeout(() => {
        simBox.classList.remove('shake-active');
    }, 250);

    // 載入決策結果回饋面板
    showFeedbackScreen(opt, diffIntVal, diffConVal, opt.cost);
}

function showFeedbackScreen(opt, diffInt, diffCon, cost) {
    // 設定回饋內容
    const roundLabel = document.getElementById('feedback-round-label');
    roundLabel.innerText = `階段 ${state.round} / ${state.maxRounds} 結束`;
    
    const feedbackTitle = document.getElementById('feedback-title');
    feedbackTitle.innerText = `【執行結果】${document.getElementById('event-title').innerText}`;
    
    const feedbackLog = document.getElementById('feedback-log');
    feedbackLog.innerText = opt.log;

    const diffIntEl = document.getElementById('diff-integrity');
    const diffConEl = document.getElementById('diff-consensus');
    const diffFundsEl = document.getElementById('diff-funds');

    // 設定安全度變化藥丸樣式
    if (diffInt >= 0) {
        diffIntEl.className = 'diff-pill diff-positive';
        diffIntEl.innerText = `+${diffInt}%`;
    } else {
        diffIntEl.className = 'diff-pill diff-negative';
        diffIntEl.innerText = `${diffInt}%`;
    }

    // 設定共識變化藥丸樣式
    if (diffCon >= 0) {
        diffConEl.className = 'diff-pill diff-positive';
        diffConEl.innerText = `+${diffCon}%`;
    } else {
        diffConEl.className = 'diff-pill diff-negative';
        diffConEl.innerText = `${diffCon}%`;
    }

    // 設定預算變化藥丸
    if (cost > 0) {
        diffFundsEl.className = 'diff-pill diff-negative';
        diffFundsEl.innerText = `-NT$ ${cost.toLocaleString()}`;
    } else {
        diffFundsEl.className = 'diff-pill diff-positive';
        diffFundsEl.innerText = `無自費`;
    }

    // 依照角色調整回饋卡邊框主題
    const feedbackCard = document.querySelector('.feedback-card');
    if (state.role === 'B') {
        feedbackCard.classList.add('kevin-feedback');
    } else {
        feedbackCard.classList.remove('kevin-feedback');
    }

    // 設定「繼續」按鈕動作
    const continueBtn = document.getElementById('btn-feedback-continue');
    continueBtn.onclick = () => {
        state.round += 1;
        updateUI();
        loadEvent();
        changeScreen('gameplay');
    };

    changeScreen('feedback');
}


// ==========================================================================
// 地震災難模擬與結局結算
// ==========================================================================

function triggerEarthquake() {
    changeScreen('earthquake');
    
    // 進行微幅震動 (保持原白底，不使用 emergency-mode)
    document.body.classList.add('shake-active');
    
    soundEngine.play('earthquake');
    soundEngine.play('alarm');

    // SVG 模擬器視覺震災動畫：氣泡沸騰與阻尼球擺動
    const simSvg = document.getElementById('sim-svg');
    simSvg.classList.add('shake-active');

    // 顯示液化氣泡
    const bubbles = document.getElementById('liquefaction-bubbles');
    bubbles.style.opacity = '1';

    // 阻尼器開始大力擺動（如果扮演 Kevin）
    if (state.role === 'B') {
        document.getElementById('damper-cable').classList.add('swinging-damper');
        document.getElementById('damper-sphere').classList.add('swinging-damper');
    }

    // 模擬地震速報 1.2 秒倒數
    let percent = 100;
    const bar = document.getElementById('earthquake-bar');
    const interval = setInterval(() => {
        percent -= 10;
        bar.style.width = `${percent}%`;
        if (percent <= 0) {
            clearInterval(interval);
            
            // 地震晃動結束
            document.body.classList.remove('shake-active');
            simSvg.classList.remove('shake-active');
            bubbles.style.opacity = '0';
            
            if (state.role === 'B') {
                document.getElementById('damper-cable').classList.remove('swinging-damper');
                document.getElementById('damper-sphere').classList.remove('swinging-damper');
            }

            evaluateEnding();
        }
    }, 120);
}

function evaluateEnding() {
    const titleEl = document.getElementById('ending-title');
    const narrativeEl = document.getElementById('ending-narrative');
    const apt = document.getElementById('building-apartment');

    if (state.role === 'B') {
        // Kevin 結局
        document.body.classList.remove('emergency-mode');
        titleEl.innerHTML = "強震止息，新大樓在阻尼器的輕微晃動中安然無恙。";
        narrativeEl.innerHTML = `
            <p>「大漢溪古河道深處的飽和砂層在大震中爆發了劇烈的液化作用，大地在瞬間化為一片流沙。然而，你所居住的新大樓地下打入深達數十公尺的地基鑽孔樁基與筏式連續壁，在黑暗的土層中鋼骨死死地支撐了地基。」</p>
            <p>「在 24 樓的精裝客廳裡，Kevin 手中的進口咖啡杯僅僅泛起微弱的漣漪。當他拉開厚實的隔音氣密窗看向南新莊──那裡已是一片死寂，大觀街與西盛街數十棟老公寓因軟腳地基傾斜，像多米諾骨牌般折斷倒塌在漫天飛沙塵土中。」</p>
            <p class="font-bold text-gray-950 mt-2" style="font-weight: 700; margin-top: 1rem;">那一刻他突然醒悟：在這個地質風險平等的城市，生命安全本身也是一種因法規空窗和資本差距決定的『特權』。」</p>
        `;
    } else {
        // 阿源結局
        if (state.integrity >= 75 && state.consensus >= 70) {
            // 奇蹟生還
            document.body.classList.remove('emergency-mode'); // 成功得救恢復白底
            titleEl.innerHTML = "驚險！老公寓在巨震與地基下陷中硬是撐住了。";
            narrativeEl.innerHTML = `
                <p>「地震來襲時地表撕裂，水混著細砂如火山般噴上柏油路面。在你家一樓水果行主梁上，你與鄰居在最後一刻好不容易達成 100% 共識出資加固的鋼鈑包覆層，在巨大的重壓與剪力擠壓下發出尖銳刺耳的鋼鐵摩擦聲。」</p>
                <p>「房屋地基在液化流砂中下陷並嚴重傾斜了，大門卡死，但公寓一樓的『軟腳結構』撐住了，沒有直接折斷崩覆！你與鄰居在黑暗中相互攙扶拉扯，沿著破碎的窗子安全爬出，撤退到避難大廳。看著整條街被夷平的老公寓，你心知肚明──這是你們用無比的退讓與熱情，強行與死神爭取回來的二十幾條性命。」</p>
            `;
            // SVG 公寓僅輕微傾斜，裂縫微開，但柱子屹立
            apt.setAttribute('transform', 'translate(-2, 3) rotate(3)');
            document.getElementById('crack-left').style.opacity = '0.5';
            document.getElementById('crack-right').style.opacity = '0.5';
        } else {
            // 塌樓悲劇
            document.body.classList.add('emergency-mode'); // 塌樓劇變進入黑底紅字災難模式
            titleEl.innerHTML = "你無比努力，但老公寓終究在碎裂聲中轟然崩塌。";
            narrativeEl.innerHTML = `
                <p>「地殼深處傳來沉悶的隆隆地鳴。短短五秒內，古大漢溪古老流砂層瞬間在震波剪力下完全失去承載力。水果行挑高、空曠、沒有剪力牆防衛的一樓承重柱，在幾萬噸的重壓下，混凝土如爆米花般粉碎迸裂。」</p>
                <p>「這根你極力想加固、卻因為鄰居爭執都更一坪換一坪不願出資、或者卡在四樓房東失聯而無法取得『100% 同意書』的脆弱主柱，在千分之一秒內折斷。」</p>
                <p>「整棟公寓像宿醉的巨人朝著馬路重重歪斜傾倒。樓梯間瞬間擠壓扭曲，你被困在二樓的一片漆黑與粉塵中，四周充斥著爆裂水管的水聲與鄰居的驚恐呼喊。」</p>
                <p class="font-bold text-[#8c251e] mt-2" style="font-weight: 700; margin-top: 1rem; color: var(--color-alarm);">這不是你的錯。在『100% 住戶同意』的法規高牆與缺乏防災共識的社會現實前，個人的掙扎，終究無法抵擋自然與制度不平等的無情宣判。」</p>
            `;
            // SVG 公寓劇烈折損傾倒
            apt.setAttribute('transform', 'translate(-12, 18) rotate(14)');
            document.getElementById('crack-left').style.opacity = '1';
            document.getElementById('crack-mid').style.opacity = '1';
            document.getElementById('crack-right').style.opacity = '1';
        }
    }

    changeScreen('ending1');
}

function restartGame() {
    changeScreen('role_select');
}


// ==========================================================================
// 結局避險地圖與診斷查詢
// ==========================================================================

function selectMapRegion(roadName) {
    soundEngine.play('click');
    const data = roadDB[roadName];
    if (!data) return;

    // 清除其他地區的 Active class
    const regions = document.querySelectorAll('.map-region');
    regions.forEach(r => r.classList.remove('active-region'));

    // 給當前點擊地區加上 Active class
    let targetId = '';
    if (roadName === '西盛街') targetId = 'region-xisheng';
    else if (roadName === '大觀街') targetId = 'region-daguan';
    else if (roadName === '中正路') targetId = 'region-zhongzheng';
    else if (roadName === '新北大道') targetId = 'region-newtaipei';
    else if (roadName === '中港路') targetId = 'region-zhonggang';

    const targetPath = document.getElementById(targetId);
    if (targetPath) {
        targetPath.classList.add('active-region');
    }

    // 渲染診斷結果面板
    const resultBox = document.getElementById('query-result');
    resultBox.style.display = 'block';
    resultBox.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 0.75rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem;">
                <span class="serif-text" style="font-weight: 700; font-size: 0.95rem; color: var(--text-primary);">${roadName} 路段地質潛勢</span>
                <span class="${data.riskClass}" style="font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.4rem; border-radius: 3px;">
                    ${data.risk}
                </span>
            </div>
            <p style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.6; text-align: justify;">
                ${data.desc}
            </p>
            <div style="background-color: var(--bg-primary); border: 1px solid var(--border-color); border-radius: 4px; padding: 0.75rem; margin-top: 0.25rem;">
                <p style="font-size: 0.75rem; color: var(--color-alarm); font-weight: 700; display: flex; align-items: center; gap: 0.25rem; margin-bottom: 0.25rem;">
                    <i class="fa-solid fa-screwdriver-wrench"></i> 專業技師防災避險建議：
                </p>
                <p style="font-size: 0.75rem; color: var(--text-secondary); line-height: 1.5; font-weight: 300;">
                    ${data.action}
                </p>
            </div>
        </div>
    `;
}


// ==========================================================================
// Toast 提示元件與初始化
// ==========================================================================

function showToast(message) {
    const toast = document.createElement('div');
    toast.style.position = 'fixed';
    toast.style.bottom = '1.5rem';
    toast.style.left = '50%';
    toast.style.transform = 'translateX(-50%)';
    toast.style.backgroundColor = 'var(--bg-card)';
    toast.style.border = '1px solid var(--border-color)';
    toast.style.borderTop = '4px solid var(--color-alarm)';
    toast.style.color = 'var(--text-primary)';
    toast.style.padding = '1.25rem';
    toast.style.borderRadius = '4px';
    toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.1)';
    toast.style.zIndex = '999';
    toast.style.maxWidth = '360px';
    toast.style.width = 'calc(100% - 2rem)';
    toast.style.fontSize = '0.8rem';
    toast.style.lineHeight = '1.6';
    toast.style.textAlign = 'justify';
    toast.className = 'serif-text';
    toast.innerHTML = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.5s ease';
        setTimeout(() => toast.remove(), 500);
    }, 6000);
}

// 頁面初始化載入
window.onload = function() {
    // 預設載入封面頁
    changeScreen('cover');
};
