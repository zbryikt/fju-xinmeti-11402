// DOM Elements
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const btnAction = document.getElementById('btn-action');
const btnActionText = document.getElementById('btn-action-text');
const btnReset = document.getElementById('btn-reset');
const btnNextStep = document.getElementById('btn-next-step');
const btnOverlayAction = document.getElementById('btn-overlay-action');
const btnAiConsult = document.getElementById('btn-ai-consult');
const btnAiClose = document.getElementById('btn-ai-close');
const btnAudio = document.getElementById('btn-audio');
const audioIcon = document.getElementById('audio-icon');

const sliderDemand = document.getElementById('slider-demand');
const sliderRatio = document.getElementById('slider-ratio');
const valDemand = document.getElementById('val-demand');
const valRatio = document.getElementById('val-ratio');
const simStatus = document.getElementById('sim-status');

const statSatisfaction = document.getElementById('stat-satisfaction');
const statSegregation = document.getElementById('stat-segregation');
const statUnhappy = document.getElementById('stat-unhappy');

const sliderPanel = document.getElementById('slider-panel');
const stepNumber = document.getElementById('step-number');
const stepTitle = document.getElementById('step-title');
const stepDesc = document.getElementById('step-desc');
const stepTask = document.getElementById('step-task');
const nextStepName = document.getElementById('next-step-name');
const narrativeOverlay = document.getElementById('narrative-overlay');
const aiPanel = document.getElementById('ai-panel');
const aiResponseBox = document.getElementById('ai-response-box');

// Audio Context & Synth Setup
let audioCtx = null;
let isMuted = false;

function initAudio() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}

function playSound(freq, duration, type = 'sine', volume = 0.08) {
    if (isMuted) return;
    try {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        const filter = audioCtx.createBiquadFilter();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(freq * 1.5, audioCtx.currentTime);

        gainNode.gain.setValueAtTime(volume, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

        osc.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
        console.warn('Audio playback failed', e);
    }
}

function playPop() {
    playSound(140 + Math.random() * 80, 0.15, 'triangle', 0.15);
}

function playChime() {
    playSound(523.25, 0.4, 'sine', 0.08); // C5
    setTimeout(() => {
        playSound(659.25, 0.4, 'sine', 0.06); // E5
    }, 100);
    setTimeout(() => {
        playSound(783.99, 0.5, 'sine', 0.05); // G5
    }, 200);
}

// Mute button logic
btnAudio.addEventListener('click', () => {
    isMuted = !isMuted;
    if (isMuted) {
        audioIcon.className = 'fa-solid fa-volume-xmark';
        btnAudio.style.color = '#ef4444';
    } else {
        audioIcon.className = 'fa-solid fa-volume-high';
        btnAudio.style.color = 'var(--color-text-main)';
        playPop();
    }
});

// Generative Ambient Music Controls
let ambientMusicPlaying = false;
let ambientSynthNodes = [];
let ambientTimeout = null;
const btnAmbientMusic = document.getElementById('btn-ambient-music');

// Chords definition (Muted twilight pads)
const CHORDS = [
    [130.81, 164.81, 196.00, 246.94, 293.66], // Cmaj9 (C3, E3, G3, B3, D4)
    [110.00, 130.81, 164.81, 196.00, 246.94], // Am9 (A2, C3, E3, G3, B3)
    [87.31, 130.81, 164.81, 220.00, 261.63],  // Fmaj7 (F2, C3, E3, A3, C4)
    [98.00, 123.47, 146.83, 164.81, 196.00]   // G6 (G2, B2, D3, E3, G3)
];
let currentChordIndex = 0;

function playGenerativeChord() {
    if (!ambientMusicPlaying) return;
    
    try {
        initAudio();
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        
        const chord = CHORDS[currentChordIndex];
        const now = audioCtx.currentTime;
        
        // Clean up finished node references
        ambientSynthNodes = ambientSynthNodes.filter(n => {
            if (now > n.endTime) {
                try { n.osc.stop(); } catch(e){}
                return false;
            }
            return true;
        });
        
        // Play each chord element with slow attack
        chord.forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const filter = audioCtx.createBiquadFilter();
            
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(freq, now);
            
            const attack = 2.5 + Math.random() * 0.8;
            const decay = 5.5 + Math.random() * 1.5;
            
            gain.gain.setValueAtTime(0, now);
            gain.gain.linearRampToValueAtTime(0.012, now + attack);
            gain.gain.exponentialRampToValueAtTime(0.0001, now + attack + decay);
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(350, now);
            filter.frequency.exponentialRampToValueAtTime(120, now + attack + decay);
            
            osc.connect(filter);
            filter.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start(now);
            osc.stop(now + attack + decay + 0.1);
            
            ambientSynthNodes.push({
                osc,
                endTime: now + attack + decay + 0.1
            });
        });
        
        currentChordIndex = (currentChordIndex + 1) % CHORDS.length;
        ambientTimeout = setTimeout(playGenerativeChord, 7500);
    } catch(e) {
        console.warn("Generative synth failure", e);
    }
}

function toggleAmbientMusic() {
    ambientMusicPlaying = !ambientMusicPlaying;
    if (ambientMusicPlaying) {
        btnAmbientMusic.classList.add('playing');
        btnAmbientMusic.querySelector('span').innerText = "音樂開啟";
        playGenerativeChord();
        playPop();
    } else {
        btnAmbientMusic.classList.remove('playing');
        btnAmbientMusic.querySelector('span').innerText = "音樂關閉";
        if (ambientTimeout) clearTimeout(ambientTimeout);
        
        const now = audioCtx ? audioCtx.currentTime : 0;
        ambientSynthNodes.forEach(n => {
            try {
                n.osc.stop(now + 0.8);
            } catch(e){}
        });
        ambientSynthNodes = [];
        playPop();
    }
}

btnAmbientMusic.addEventListener('click', () => {
    initAudio();
    toggleAmbientMusic();
});

// Simulation Constants & States
const CANVAS_VIRTUAL_SIZE = 800;
let currentStep = 1;
let gridSize = 6;
let cells = []; 
let emptyRatio = 0.24; 
let minorityRatio = 0.20; 
let demandRatio = 0.33; 

let isSimulating = false;
let animationLoopActive = false;
let particles = [];
let movingAgents = []; // Track agents currently mid-slide animation

// Setup Canvas with DPI Scaling
function resizeCanvas() {
    const dpi = window.devicePixelRatio || 1;
    const styleWidth = canvas.clientWidth;
    const styleHeight = canvas.clientHeight;
    
    canvas.width = styleWidth * dpi;
    canvas.height = styleHeight * dpi;
    ctx.scale(dpi * (styleWidth / CANVAS_VIRTUAL_SIZE), dpi * (styleHeight / CANVAS_VIRTUAL_SIZE));
}

// Initialize Schelling Grid
function initGrid() {
    cells = [];
    for (let r = 0; r < gridSize; r++) {
        cells[r] = [];
        for (let c = 0; c < gridSize; c++) {
            if (Math.random() < emptyRatio) {
                cells[r][c] = 0; // Empty
            } else {
                cells[r][c] = (Math.random() < minorityRatio) ? 2 : 1; // 2=minority(rainbow), 1=majority(blue)
            }
        }
    }
    particles = [];
    movingAgents = [];
    updateMetrics();
    draw();
}

// Calculate satisfaction status for a single cell
function getAgentStatus(r, c) {
    const type = cells[r][c];
    if (type === 0) return { isUnhappy: false, sameCount: 0, neighborCount: 0 };
    
    let sameCount = 0;
    let neighborCount = 0;
    
    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const nr = r + dr;
            const nc = c + dc;
            
            if (nr >= 0 && nr < gridSize && nc >= 0 && nc < gridSize) {
                const neighborType = cells[nr][nc];
                if (neighborType !== 0) {
                    neighborCount++;
                    if (neighborType === type) {
                        sameCount++;
                    }
                }
            }
        }
    }
    
    // Schelling criteria
    const isUnhappy = neighborCount > 0 && (sameCount / neighborCount) < demandRatio;
    return { isUnhappy, sameCount, neighborCount };
}

// Update UI dashboard metrics
function updateMetrics() {
    let totalAgents = 0;
    let unhappyAgents = 0;
    let sameNeighborSum = 0;
    let neighborCountSum = 0;
    
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (cells[r][c] === 0) continue;
            
            // Exclude agents currently moving to avoid stats glitching
            const isMoving = movingAgents.some(a => a.toR === r && a.toC === c);
            if (isMoving) continue;
            
            totalAgents++;
            const status = getAgentStatus(r, c);
            if (status.isUnhappy) unhappyAgents++;
            
            sameNeighborSum += status.sameCount;
            neighborCountSum += status.neighborCount;
        }
    }
    
    const satisfaction = totalAgents ? ((totalAgents - unhappyAgents) / totalAgents) * 100 : 100;
    const segregation = neighborCountSum ? (sameNeighborSum / neighborCountSum) * 100 : 0;
    
    statSatisfaction.innerText = `${satisfaction.toFixed(0)}%`;
    statSegregation.innerText = `${segregation.toFixed(0)}%`;
    statUnhappy.innerText = unhappyAgents;
    
    return unhappyAgents;
}

// Draw Grid and Agents
let rotationOffset = 0; // Rotate the dashed unhappy outline
function draw() {
    ctx.clearRect(0, 0, CANVAS_VIRTUAL_SIZE, CANVAS_VIRTUAL_SIZE);
    
    const cellSize = CANVAS_VIRTUAL_SIZE / gridSize;
    
    // Draw Grid Lines
    ctx.strokeStyle = 'rgba(236, 72, 153, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, CANVAS_VIRTUAL_SIZE);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(CANVAS_VIRTUAL_SIZE, i * cellSize);
        ctx.stroke();
    }
    
    rotationOffset += 0.03;
    
    // Draw Static Agents
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const type = cells[r][c];
            if (type === 0) continue;
            
            // If this agent is sliding, let the animation loop handle drawing it
            if (movingAgents.some(a => a.fromR === r && a.fromC === c)) {
                continue;
            }
            
            const x = c * cellSize + cellSize / 2;
            const y = r * cellSize + cellSize / 2;
            const radius = (cellSize / 2) * 0.72;
            const status = getAgentStatus(r, c);
            
            // Draw Pulsing/Rotating Unhappy Ring
            if (status.isUnhappy) {
                ctx.save();
                ctx.strokeStyle = 'rgba(239, 68, 68, 0.8)';
                ctx.lineWidth = Math.max(1.5, cellSize * 0.04);
                ctx.setLineDash([cellSize * 0.12, cellSize * 0.08]);
                ctx.lineDashOffset = rotationOffset * 10;
                ctx.beginPath();
                // Slowly pulse the radius
                const pulse = Math.sin(Date.now() / 150) * (cellSize * 0.03);
                ctx.arc(x, y, radius + cellSize * 0.08 + pulse, 0, Math.PI * 2);
                ctx.stroke();
                ctx.restore();
            }
            
            drawAgentCircle(ctx, x, y, radius, type);
        }
    }
    
    // Draw Sliding Agents
    for (let i = movingAgents.length - 1; i >= 0; i--) {
        const agent = movingAgents[i];
        agent.progress += agent.speed;
        
        // Linear interpolation for smooth slide
        const currentX = agent.startX + (agent.endX - agent.startX) * agent.progress;
        const currentY = agent.startY + (agent.endY - agent.startY) * agent.progress;
        const cellSize = CANVAS_VIRTUAL_SIZE / gridSize;
        const radius = (cellSize / 2) * 0.72;
        
        // Add movement trailing particles
        if (Math.random() < 0.3) {
            particles.push({
                x: currentX + (Math.random() - 0.5) * 6,
                y: currentY + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                color: agent.type === 1 ? 'rgba(56, 189, 248, 0.5)' : 'rgba(236, 72, 153, 0.5)',
                size: Math.random() * 3 + 1,
                alpha: 1,
                decay: 0.03
            });
        }
        
        drawAgentCircle(ctx, currentX, currentY, radius, agent.type);
        
        if (agent.progress >= 1) {
            // Arrived! Commit value to target cell
            cells[agent.toR][agent.toC] = agent.type;
            
            // Create landing wave ripple particles
            createSplashRipple(agent.endX, agent.endY, agent.type);
            
            // Remove from moving queue
            movingAgents.splice(i, 1);
            
            playPop();
            updateMetrics();
            
            // Check convergence when the last moving agent lands
            if (movingAgents.length === 0 && !isSimulating) {
                checkCompletion();
            }
        }
    }
    
    // Draw Dust Particles
    updateAndDrawParticles();
}

// Utility to draw high-end circular gradient agents
function drawAgentCircle(context, x, y, radius, type) {
    if (type === 1) {
        // Majority: Sleek Sky Blue Gradient
        const grad = context.createRadialGradient(x - radius * 0.25, y - radius * 0.25, radius * 0.05, x, y, radius);
        grad.addColorStop(0, '#bae6fd'); // sky-200
        grad.addColorStop(0.4, '#38bdf8'); // sky-400
        grad.addColorStop(1, '#0284c7'); // sky-700
        context.fillStyle = grad;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        
        // Inner highlight dot for 3D look
        context.fillStyle = 'rgba(255, 255, 255, 0.15)';
        context.beginPath();
        context.arc(x - radius * 0.1, y - radius * 0.1, radius * 0.2, 0, Math.PI * 2);
        context.fill();
    } else if (type === 2) {
        // Minority: Emotional Rose-Violet Rainbow Gradient
        const grad = context.createRadialGradient(x - radius * 0.1, y - radius * 0.1, radius * 0.05, x, y, radius);
        grad.addColorStop(0, '#fdf2f8');
        grad.addColorStop(0.35, '#ec4899'); // rose-500
        grad.addColorStop(0.75, '#8b5cf6'); // purple-500
        grad.addColorStop(1, '#4f46e5'); // indigo-600
        context.fillStyle = grad;
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        
        // Rainbow Core: Subtle heart/star shaped highlight (using a clean small white circle core)
        context.fillStyle = '#ffffff';
        context.beginPath();
        context.arc(x, y, radius * 0.2, 0, Math.PI * 2);
        context.fill();
    }
}

// Particle Systems
function createSplashRipple(x, y, type) {
    const colors = type === 1 ? ['#7dd3fc', '#38bdf8', '#0284c7'] : ['#f472b6', '#c084fc', '#818cf8'];
    for (let i = 0; i < 12; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3 + 1;
        particles.push({
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 4 + 2,
            alpha: 1,
            decay: 0.02
        });
    }
}

function updateAndDrawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;
        
        if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
        }
        
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

// Find empty spot and start slide animation
function moveAgentToEmpty(fromR, fromC) {
    const agentType = cells[fromR][fromC];
    if (agentType === 0) return false;
    
    // Find all currently empty spots
    const empties = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (cells[r][c] === 0) {
                // Confirm no agent is already heading to this spot
                const reserved = movingAgents.some(a => a.toR === r && a.toC === c);
                if (!reserved) {
                    empties.push({ r, c });
                }
            }
        }
    }
    
    if (empties.length === 0) return false;
    
    // Filter empty spots where this agent would become happy
    const happyEmpties = [];
    for (const e of empties) {
        // Temporarily put agent there to calculate potential satisfaction
        cells[e.r][e.c] = agentType;
        cells[fromR][fromC] = 0;
        
        const status = getAgentStatus(e.r, e.c);
        if (!status.isUnhappy) {
            happyEmpties.push(e);
        }
        
        // Revert temporary state
        cells[fromR][fromC] = agentType;
        cells[e.r][e.c] = 0;
    }
    
    // Prefer spots that satisfy the agent, otherwise settle for random empty
    const target = happyEmpties.length > 0
        ? happyEmpties[Math.floor(Math.random() * happyEmpties.length)]
        : empties[Math.floor(Math.random() * empties.length)];
        
    const cellSize = CANVAS_VIRTUAL_SIZE / gridSize;
    
    // Start sliding: vacate source cell immediately, set visual animation
    cells[fromR][fromC] = 0;
    
    movingAgents.push({
        fromR, fromC,
        toR: target.r, toC: target.c,
        startX: fromC * cellSize + cellSize / 2,
        startY: fromR * cellSize + cellSize / 2,
        endX: target.c * cellSize + cellSize / 2,
        endY: target.r * cellSize + cellSize / 2,
        progress: 0,
        type: agentType,
        speed: gridSize > 15 ? 0.15 : 0.08 // Slide faster on larger grids to keep pace
    });
    
    return true;
}

// Perform a single batch simulation step
function runSingleSimulationStep() {
    // Find all unhappy agents
    const unhappyAgents = [];
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (cells[r][c] !== 0) {
                const isMoving = movingAgents.some(a => (a.fromR === r && a.fromC === c) || (a.toR === r && a.toC === c));
                if (!isMoving && getAgentStatus(r, c).isUnhappy) {
                    unhappyAgents.push({ r, c });
                }
            }
        }
    }
    
    if (unhappyAgents.length === 0) {
        isSimulating = false;
        checkCompletion();
        return false;
    }
    
    // Select one random unhappy agent and move it
    const randomAgent = unhappyAgents[Math.floor(Math.random() * unhappyAgents.length)];
    const moved = moveAgentToEmpty(randomAgent.r, randomAgent.c);
    
    if (!moved) {
        isSimulating = false;
        checkCompletion();
        return false;
    }
    
    return true;
}

// Check convergence and trigger narrative cards
function checkCompletion() {
    // Recalculate remaining unhappy agents
    let unhappyCount = 0;
    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            if (cells[r][c] !== 0 && getAgentStatus(r, c).isUnhappy) {
                unhappyCount++;
            }
        }
    }
    
    if (unhappyCount === 0) {
        simStatus.innerText = "已達平衡臨界點";
        simStatus.style.background = '#ecfdf5';
        simStatus.style.color = '#059669';
        simStatus.style.borderColor = '#a7f3d0';
        
        btnActionText.innerText = "模擬結束";
        btnAction.style.opacity = '0.6';
        
        playChime();
        
        // Show narrative overlay for Step 2
        if (currentStep === 2) {
            triggerNarrativeOverlay();
        }
    }
}

// Interactive clicks on manual mode
canvas.addEventListener('click', (e) => {
    initAudio();
    if (currentStep !== 1 || movingAgents.length > 0) return;
    
    // Get mouse coords relative to canvas display size
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert to virtual 800px canvas size
    const virtualX = (x / rect.width) * CANVAS_VIRTUAL_SIZE;
    const virtualY = (y / rect.height) * CANVAS_VIRTUAL_SIZE;
    
    const cellSize = CANVAS_VIRTUAL_SIZE / gridSize;
    const col = Math.floor(virtualX / cellSize);
    const row = Math.floor(virtualY / cellSize);
    
    if (row >= 0 && row < gridSize && col >= 0 && col < gridSize) {
        const type = cells[row][col];
        if (type !== 0) {
            const status = getAgentStatus(row, col);
            if (status.isUnhappy) {
                moveAgentToEmpty(row, col);
            } else {
                // If clicked a happy agent, play a dud sound
                playSound(120, 0.05, 'sine', 0.02);
            }
        }
    }
});

// Canvas render loop
function animationLoop() {
    draw();
    if (isSimulating && movingAgents.length === 0) {
        // Trigger next relocation after previous animation finishes
        const continues = runSingleSimulationStep();
        if (!continues) {
            isSimulating = false;
        }
    }
    
    if (movingAgents.length > 0 || particles.length > 0 || isSimulating || currentStep === 1) {
        requestAnimationFrame(animationLoop);
        animationLoopActive = true;
    } else {
        animationLoopActive = false;
    }
}

function startAnimationLoop() {
    if (!animationLoopActive) {
        animationLoop();
    }
}

// Simulation Control Loop
btnAction.addEventListener('click', () => {
    initAudio();
    if (currentStep === 1) {
        // Step 1: Manual one-step simulation triggered by button
        runSingleSimulationStep();
        startAnimationLoop();
    } else {
        // Step 2 & 3: Auto continuous simulation
        if (isSimulating) {
            isSimulating = false;
            btnActionText.innerText = "繼續模擬";
            simStatus.innerText = "已暫停";
            simStatus.style.background = '#fef3c7';
            simStatus.style.color = '#d97706';
            simStatus.style.borderColor = '#fde68a';
        } else {
            // Reset button styles
            btnAction.style.opacity = '1';
            let unhappyCount = 0;
            for (let r = 0; r < gridSize; r++) {
                for (let c = 0; c < gridSize; c++) {
                    if (cells[r][c] !== 0 && getAgentStatus(r, c).isUnhappy) unhappyCount++;
                }
            }
            if (unhappyCount === 0) {
                // Re-init grid if already converged
                initGrid();
            }
            isSimulating = true;
            btnActionText.innerText = "暫停模擬";
            simStatus.innerText = "自動模擬中";
            simStatus.style.background = '#eff6ff';
            simStatus.style.color = '#2563eb';
            simStatus.style.borderColor = '#bfdbfe';
            startAnimationLoop();
        }
    }
});

btnReset.addEventListener('click', () => {
    initAudio();
    playSound(330, 0.12, 'sawtooth', 0.04);
    goToStep(currentStep);
});

btnNextStep.addEventListener('click', () => {
    initAudio();
    let next = currentStep + 1;
    if (next > 4) next = 1;
    goToStep(next);
});

btnOverlayAction.addEventListener('click', () => {
    narrativeOverlay.classList.remove('active');
    goToStep(3); // Jump straight to sandbox controls
});

// Parameter Sliders Events
sliderDemand.addEventListener('input', (e) => {
    demandRatio = parseInt(e.target.value) / 100;
    valDemand.innerText = `${e.target.value}%`;
    updateMetrics();
    draw();
});

sliderRatio.addEventListener('input', (e) => {
    minorityRatio = parseInt(e.target.value) / 100;
    valRatio.innerText = `${e.target.value}%`;
    initGrid();
});

// Overlay Trigger Panel
function triggerNarrativeOverlay() {
    const isCoexist = demandRatio <= 0.18;
    if (isCoexist) {
        document.getElementById('overlay-title').innerText = "多元共融的平權狀態";
        document.getElementById('overlay-desc').innerHTML = `當大眾內心的不寬容臨界降低至 <b>${(demandRatio * 100).toFixed(0)}%</b>：<br>同性伴侶不再被迫自衛性抱團，而是可以安全自然地嵌入每個社區生活圈。`;
        document.getElementById('overlay-icon-container').innerHTML = '<i class="fa-solid fa-heart-circle-check"></i>';
        document.getElementById('overlay-icon-container').style.color = '#10b981';
        document.getElementById('overlay-icon-container').style.background = '#ecfdf5';
    } else {
        document.getElementById('overlay-title').innerText = "無惡意造成的自動割裂";
        document.getElementById('overlay-desc').innerHTML = `每個人都自認包容，只想保留 33% 的基本同質安全感。但每個人微觀的保持距離，在系統宏觀面<b>自發編織出了巨大的偏見隔離牆</b>。`;
        document.getElementById('overlay-icon-container').innerHTML = '<i class="fa-solid fa-heart-crack"></i>';
        document.getElementById('overlay-icon-container').style.color = 'var(--color-primary)';
        document.getElementById('overlay-icon-container').style.background = 'var(--color-primary-light)';
    }
    narrativeOverlay.classList.add('active');
}

// AI Sociologist Panel Trigger
btnAiConsult.addEventListener('click', () => {
    initAudio();
    btnAiConsult.disabled = true;
    aiResponseBox.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px 0; gap: 12px; color: var(--color-secondary);">
            <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.5rem;"></i>
            <span style="font-weight: 700; font-size: 0.8rem;">對照真實大數據分析中...</span>
        </div>
    `;
    
    setTimeout(() => {
        const tolerance = parseInt(sliderDemand.value);
        const segregation = parseFloat(statSegregation.innerText);
        let reportText = "";
        
        if (tolerance <= 20) {
            reportText = `
                <h5><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> 理想平權共融狀態 (對應2023全面共同收養)</h5>
                <p>當偏好傾向低於 <b>20%</b>，環境隔離度降至非常低，大眾與少數群體混合共處。這投射出台灣在<b>2023年全面開放同志共同收養無血緣子女</b>後的體制進步。當法律給予全面底氣，阿明與點點這樣的家庭不再被迫自衛性聚集，能真正平等融合於日常社區與學校環境中。</p>
            `;
        } else if (tolerance >= 50) {
            reportText = `
                <h5><i class="fa-solid fa-triangle-exclamation" style="color: #ef4444;"></i> 行政體制的封鎖線 (對應兩岸婚姻現狀)</h5>
                <p>當大眾排他需求高達 <b>${tolerance}%</b>，系統會自發割裂出高達 <b>${segregation.toFixed(0)}%</b> 的隔離牆。這精準投射出<b>目前兩岸同性伴侶面臨的實質困境</b>。跨國同婚函釋雖放寬，但唯獨兩岸同性伴侶卡死在《兩岸關係條例》與不對等的行政面談程序紅線中，造成體制面上徹底被孤立與排除的飛地現象。</p>
            `;
        } else {
            reportText = `
                <h5><i class="fa-solid fa-scale-balanced" style="color: #6366f1;"></i> 法律通過後的「隱形天花板」 (對應2024真實民調)</h5>
                <p>在當前 <b>${tolerance}%</b> 的偏好防線下，隔離大牆自發閉合。對照台灣真實民調：支持同婚法律人權高達 <b>62%</b>，但能完全接受親生子女是同志的卻驟降至 <b>35%</b>。這種「大方向支持，但與親人保持距離」的溫和微觀偏好，正是同志家庭在法律平等後，日常生活和醫療空窗期中，依然感到沉重隱形壁壘的主因。</p>
            `;
        }
        
        aiResponseBox.innerHTML = reportText;
        btnAiConsult.disabled = false;
    }, 800);
});

btnAiClose.addEventListener('click', () => {
    aiPanel.classList.remove('active');
    goToStep(3); // Go back to step 3 controls
});

// Scene Navigator
function goToStep(step) {
    currentStep = step;
    isSimulating = false;
    movingAgents = [];
    particles = [];
    
    narrativeOverlay.classList.remove('active');
    aiPanel.classList.remove('active');
    
    // Reset buttons styles
    btnAction.style.opacity = '1';
    btnAction.className = 'btn-main';
    
    if (step === 1) {
        gridSize = 6;
        demandRatio = 0.33;
        minorityRatio = 0.20;
        
        simStatus.innerText = "手動互動模式";
        simStatus.style.background = '#fffbeb';
        simStatus.style.color = '#d97706';
        simStatus.style.borderColor = '#fde68a';
        
        stepNumber.innerText = "實驗 階段 1";
        stepTitle.innerText = "微觀偏好：手動消除不安";
        stepDesc.innerHTML = `請<b>手動點擊右側被紅色虛線圈起的焦慮者</b>幫它隨搬家。這就如同阿明在法律空窗期與法規配套不全時，為了家庭安全在社會邊緣不斷搬移、尋求認同的微觀縮影。`;
        
        stepTask.style.display = "flex";
        sliderPanel.classList.add('opacity-disabled');
        btnActionText.innerText = "手動隨機搬移";
        nextStepName.innerText = "宏觀湧現";
        
        initGrid();
        startAnimationLoop();
    } else if (step === 2) {
        gridSize = 24;
        demandRatio = 0.33;
        minorityRatio = 0.20;
        
        simStatus.innerText = "自動模擬模式";
        simStatus.style.background = '#eff6ff';
        simStatus.style.color = '#2563eb';
        simStatus.style.borderColor = '#bfdbfe';
        
        stepNumber.innerText = "實驗 階段 2";
        stepTitle.innerText = "群體湧現：偏見高牆的崛起";
        stepDesc.innerHTML = `現在將模型人口放大。每個人依然守著相同的防線 (33%)。點擊下方「啟動自動模擬」，親眼見證社會是如何在無形中自動撕裂成完全隔絕的陣營。`;
        
        stepTask.style.display = "none";
        sliderPanel.classList.add('opacity-disabled');
        btnActionText.innerText = "啟動自動模擬";
        nextStepName.innerText = "自由沙盒";
        
        initGrid();
        startAnimationLoop();
    } else if (step === 3) {
        gridSize = 30;
        
        simStatus.innerText = "自由沙盒模式";
        simStatus.style.background = '#ecfdf5';
        simStatus.style.color = '#059669';
        simStatus.style.borderColor = '#a7f3d0';
        
        stepNumber.innerText = "實驗 階段 3";
        stepTitle.innerText = "規則調度：尋找共融臨界點";
        stepDesc.innerHTML = `解鎖控制權。拉動下方滑桿，將排他防線調低（高度包容）或調高（傳統排外），尋找消解偏見高牆的共融臨界點。`;
        
        stepTask.style.display = "none";
        sliderPanel.classList.remove('opacity-disabled');
        btnActionText.innerText = "啟動自訂模擬";
        nextStepName.innerText = "AI 大數據診斷";
        
        initGrid();
        startAnimationLoop();
    } else if (step === 4) {
        stepNumber.innerText = "實驗 階段 4";
        stepTitle.innerText = "大數據之鏡：結構與現實的對照";
        stepDesc.innerHTML = `點擊右側「剖析當前社會結構」開啟數據報告。這將結合台灣真實民調（如接受同志子女比例驟降的隱形牆），為你剖析法律過後依然殘存的微觀疏離。`;
        
        stepTask.style.display = "none";
        sliderPanel.classList.remove('opacity-disabled');
        btnActionText.innerText = "重啟模擬觀察";
        nextStepName.innerText = "返回第一階段";
        
        aiPanel.classList.add('active');
        initGrid();
        startAnimationLoop();
    }
}

// Scroll Intersection Observer for Timeline Cards & Chart Animations
document.addEventListener("DOMContentLoaded", () => {
    resizeCanvas();
    window.addEventListener('resize', () => {
        resizeCanvas();
        draw();
    });
    
    goToStep(1);
    
    // Poll stats progress bars animation
    const bars = [
        { id: 'bar1', val: '62%' },
        { id: 'bar2', val: '55%' },
        { id: 'bar3', val: '35%' }
    ];
    
    const pollCard = document.getElementById('poll-stats-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                bars.forEach(b => {
                    const el = document.getElementById(b.id);
                    if (el) {
                        el.style.width = b.val;
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });
    
    if (pollCard) {
        observer.observe(pollCard);
    }
    
    // Add scroll animation to timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    const timelineObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                timelineObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(40px)';
        item.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        timelineObserver.observe(item);
    });

    // Scroll-driven Ambient Background Color Changes (Scrollytelling)
    const moodSections = [
        { id: 'introduction', className: '' },
        { id: 'card-2017', className: 'bg-mood-2017' },
        { id: 'card-2024', className: 'bg-mood-2024' },
        { id: 'card-cross', className: 'bg-mood-cross' },
        { id: 'simulation-section', className: 'bg-mood-sandbox' }
    ];

    const moodObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const targetId = entry.target.id;
                const match = moodSections.find(m => m.id === targetId);
                if (match) {
                    // Remove all mood classes
                    document.body.classList.remove('bg-mood-2017', 'bg-mood-2024', 'bg-mood-cross', 'bg-mood-sandbox');
                    // Add current mood
                    if (match.className) {
                        document.body.classList.add(match.className);
                    }
                }
            }
        });
    }, {
        threshold: 0.2,
        rootMargin: '-15% 0px -35% 0px'
    });

    moodSections.forEach(sec => {
        const el = document.getElementById(sec.id);
        if (el) moodObserver.observe(el);
    });

    // Vertical Milestones Step Scroll-in and Light-up
    const milestoneNodes = document.querySelectorAll('.milestone-node-item');
    const milestoneObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                
                // Play a tiny, dreamy harmonic chime when a node lights up
                if (ambientMusicPlaying && !isMuted) {
                    const id = entry.target.id;
                    let freq = 440;
                    if (id.includes('2017')) freq = 329.63; // E4
                    else if (id.includes('2019')) freq = 392.00; // G4
                    else if (id.includes('2023')) freq = 440.00; // A4
                    else if (id.includes('2024')) freq = 523.25; // C5
                    
                    playSound(freq, 0.4, 'sine', 0.02);
                }
            }
        });
    }, {
        threshold: 0.25,
        rootMargin: '0px 0px -10% 0px'
    });

    milestoneNodes.forEach(node => {
        milestoneObserver.observe(node);
    });
});
