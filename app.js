// --- HERRAMIENTA DE DEPURACIÓN GLOBAL ---
window.logToScreen = function(msg, color = '#0f0') {
  let debugDiv = document.getElementById('debugDiv');
  if (!debugDiv) {
    debugDiv = document.createElement('div');
    debugDiv.id = 'debugDiv';
    debugDiv.style.cssText = 'position:fixed; top:60px; left:0; width:100%; max-height:150px; overflow-y:scroll; background:rgba(0,0,0,0.6); color:#0f0; font-family:monospace; font-size:11px; z-index:9999; pointer-events:none; padding:5px;';
    document.body.appendChild(debugDiv);
  }
  const line = document.createElement('div');
  line.style.color = color;
  line.style.borderBottom = '1px solid #333';
  line.textContent = `> ${msg}`;
  debugDiv.prepend(line);
  if (debugDiv.children.length > 8) debugDiv.lastChild.remove();
};

// --- COMPONENTE A-FRAME PARA DETECCIÓN ---
if (typeof AFRAME !== 'undefined') {
  AFRAME.registerComponent('target-monitor', {
    init: function () {
      this.el.addEventListener('mindar-image-target-found', (e) => {
        const evt = new CustomEvent('game-target-found', { detail: { ...e.detail, el: this.el } });
        document.body.dispatchEvent(evt);
      });
      this.el.addEventListener('mindar-image-target-lost', (e) => {
        const evt = new CustomEvent('game-target-lost', { detail: { ...e.detail, el: this.el } });
        document.body.dispatchEvent(evt);
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  const startScanBtn = document.getElementById('startScanBtn');
  const stopScanBtn = document.getElementById('stopScanBtn');
  const qrValue = document.getElementById('qrValue');
  const arScene = document.querySelector('a-scene');
  const playerCard = document.getElementById('playerCard');

  // qrStatus ahora existe en el HTML; se accede por función para evitar referencias stale
  const getQrStatus = () => document.getElementById('qrStatus');

  // Redirigir console.log a la pantalla
  const originalLog = console.log;
  console.log = (...args) => {
    originalLog(...args);
    const text = args.map(a => (typeof a === 'object' && a ? (a.tagName || '[Objeto]') : String(a))).join(' ');
    window.logToScreen(text);
  };
  
  const originalError = console.error;
  console.error = (...args) => {
    originalError(...args);
    window.logToScreen("ERROR: " + args.join(' '), '#ff4444');
  };

  // ========== TRIVIA: 50 PREGUNTAS (5 por cada uno de los 10 equipos) ==========
  
  const preguntasPorEquipo = {
    México: [
      { question: '¿En qué estadio de la CDMX jugará México sus partidos como local en el Mundial 2026?', options: ['Estadio Azteca', 'Estadio Universitario', 'Estadio Jalisco', 'Estadio Cuauhtémoc'], correct: 0 },
      { question: '¿Cuál es el máximo goleador histórico de la selección mexicana?', options: ['Cuauhtémoc Blanco', 'Javier Hernández', 'Luis Hernández', 'Carlos Vela'], correct: 1 },
      { question: '¿En qué año México fue sede de un Mundial por primera vez?', options: ['1970', '1986', '1962', '1994'], correct: 0 },
      { question: '¿Cómo se conoce la famosa "ola" mexicana en los estadios?', options: ['La Ola Mexicana', 'La Víbora', 'El Tri', 'El Grito'], correct: 0 },
      { question: '¿Qué portero mexicano es conocido como "Paco" y jugó en el Real Madrid?', options: ['Oswaldo Sánchez', 'Jorge Campos', 'Francisco Guillermo Ochoa', 'Antonio Carbajal'], correct: 2 }
    ],
    Alemania: [
      { question: '¿Cuántas Copas del Mundo ha ganado Alemania (incluyendo la RFA)?', options: ['4', '3', '5', '2'], correct: 0 },
      { question: '¿Qué delantero alemán es el máximo goleador histórico de los Mundiales?', options: ['Gerd Müller', 'Miroslav Klose', 'Thomas Müller', 'Lothar Matthäus'], correct: 1 },
      { question: '¿En qué año Alemania ganó su último Mundial hasta 2026?', options: ['2014', '2010', '2018', '2006'], correct: 0 },
      { question: '¿Qué equipo de la Bundesliga es conocido como "Los Bávaros"?', options: ['Borussia Dortmund', 'Bayern Múnich', 'Werder Bremen', 'Schalke 04'], correct: 1 },
      { question: '¿Quién fue el capitán de Alemania en el Mundial 2014?', options: ['Manuel Neuer', 'Philipp Lahm', 'Bastian Schweinsteiger', 'Toni Kroos'], correct: 1 }
    ],
    USA: [
      { question: '¿Cuál es el mejor resultado de Estados Unidos en una Copa del Mundo?', options: ['Cuartos de final (2002)', 'Semifinal (1930)', 'Octavos de final (2010)', 'Fase de grupos'], correct: 0 },
      { question: '¿Qué jugador estadounidense es conocido por su apodo "Captain America"?', options: ['Clint Dempsey', 'Landon Donovan', 'Christian Pulisic', 'Tim Howard'], correct: 1 },
      { question: '¿En qué año la MLS (Major League Soccer) comenzó a jugar?', options: ['1996', '1994', '2000', '1998'], correct: 0 },
      { question: '¿Qué portero estadounidense tuvo una actuación récord de 15 atajadas ante Bélgica en 2014?', options: ['Brad Friedel', 'Tim Howard', 'Kasey Keller', 'Matt Turner'], correct: 1 },
      { question: '¿Quién es el máximo goleador histórico de la selección de USA?', options: ['Landon Donovan', 'Clint Dempsey', 'Christian Pulisic', 'Eric Wynalda'], correct: 0 }
    ],
    Canadá: [
      { question: '¿En qué año participó Canadá por primera vez en un Mundial (antes de 2026)?', options: ['1986', '1994', '2002', '2018'], correct: 0 },
      { question: '¿Quién es el máximo anotador histórico de Canadá?', options: ['Cyle Larin', 'Jonathan David', 'Dwayne De Rosario', 'Alphonso Davies'], correct: 0 },
      { question: '¿Cuál es el apodo de la selección canadiense?', options: ['Los Canucks', 'Las Hojas de Arce', 'El Equipo Rojo', 'Los Lobos'], correct: 1 },
      { question: '¿En qué equipo juega Alphonso Davies?', options: ['Bayern Múnich', 'Real Madrid', 'PSG', 'Manchester City'], correct: 0 },
      { question: '¿Canadá co-sede el Mundial 2026 junto con qué países?', options: ['USA y México', 'USA solamente', 'México solamente', 'Inglaterra'], correct: 0 }
    ],
    Argentina: [
      { question: '¿Cuántas Copas del Mundo ha ganado Argentina hasta 2026?', options: ['3', '2', '4', '1'], correct: 0 },
      { question: '¿Quién es el máximo goleador de la historia de Argentina?', options: ['Lionel Messi', 'Gabriel Batistuta', 'Sergio Agüero', 'Diego Maradona'], correct: 0 },
      { question: '¿En qué año ganó Argentina su primer Mundial?', options: ['1978', '1986', '1930', '2014'], correct: 0 },
      { question: '¿Qué estadio es conocido como "La Bombonera"?', options: ['River Plate', 'Boca Juniors', 'Racing Club', 'Independiente'], correct: 1 },
      { question: '¿Quién fue el técnico argentino campeón del mundo en 1986?', options: ['Carlos Bilardo', 'César Luis Menotti', 'Alfio Basile', 'Lionel Scaloni'], correct: 0 }
    ],
    Brasil: [
      { question: '¿Cuántos Mundiales ha ganado Brasil?', options: ['5', '6', '4', '7'], correct: 0 },
      { question: '¿Quién es el máximo goleador histórico de la seleção?', options: ['Pelé', 'Neymar', 'Ronaldo', 'Romário'], correct: 0 },
      { question: '¿En qué año Brasil sufrió el "Maracanazo"?', options: ['1950', '1958', '1962', '1998'], correct: 0 },
      { question: '¿Cuál es el apodo de la selección brasileña?', options: ['Canarinha', 'Verdeamarela', 'Scratch', 'Todas las anteriores'], correct: 3 },
      { question: '¿Qué jugador brasileño es conocido como "O Fenômeno"?', options: ['Ronaldo Nazário', 'Ronaldinho', 'Romário', 'Rivaldo'], correct: 0 }
    ],
    "Corea del Sur": [
      { question: '¿En qué año Corea del Sur alcanzó las semifinales del Mundial como local junto a Japón?', options: ['2002', '2006', '1998', '2010'], correct: 0 },
      { question: '¿Quién es el máximo goleador histórico de Corea del Sur?', options: ['Cha Bum-kun', 'Son Heung-min', 'Park Ji-sung', 'Lee Dong-gook'], correct: 0 },
      { question: '¿Qué jugador surcoreano juega en el Tottenham?', options: ['Son Heung-min', 'Hwang Hee-chan', 'Kim Min-jae', 'Lee Kang-in'], correct: 0 },
      { question: '¿Cómo se llama el famoso "Grito de Guerra" de los fans coreanos?', options: ['Dae-han-min-guk', 'Korea Fighting', 'Red Devils', 'Taegeuk Warriors'], correct: 0 },
      { question: '¿Corea del Sur eliminó a qué potencia europea en octavos de 2002?', options: ['Italia', 'España', 'Portugal', 'Inglaterra'], correct: 0 }
    ],
    España: [
      { question: '¿En qué año España ganó su primer y único Mundial?', options: ['2010', '2008', '2012', '2006'], correct: 0 },
      { question: '¿Qué estilo de juego popularizó la selección española campeona?', options: ['Tiki-taka', 'Falso 9', 'Pressing alto', 'Contragolpe'], correct: 0 },
      { question: '¿Quién es el máximo goleador histórico de España?', options: ['David Villa', 'Raúl González', 'Fernando Torres', 'Luis Suárez'], correct: 0 },
      { question: '¿Qué portero español fue capitán en la final de 2010?', options: ['Iker Casillas', 'Víctor Valdés', 'Pepe Reina', 'David de Gea'], correct: 0 },
      { question: '¿Cuál es el clásico más importante del fútbol español?', options: ['El Clásico (Real Madrid vs Barcelona)', 'Derbi Madrileño', 'Derbi Sevillano', 'Derbi Vasco'], correct: 0 }
    ],
    Portugal: [
      { question: '¿Quién es el máximo goleador histórico de Portugal?', options: ['Cristiano Ronaldo', 'Eusébio', 'Luís Figo', 'Pauleta'], correct: 0 },
      { question: '¿Cuál es el mejor resultado de Portugal en un Mundial?', options: ['Tercer lugar (1966)', 'Subcampeón (2014)', 'Cuartos de final (2006)', 'Octavos (2018)'], correct: 0 },
      { question: '¿En qué año Portugal ganó la Eurocopa?', options: ['2016', '2004', '2012', '2020'], correct: 0 },
      { question: '¿Qué equipo portugués es conocido como "Águilas"?', options: ['Benfica', 'Sporting', 'Porto', 'Braga'], correct: 0 },
      { question: '¿Quién es el segundo máximo goleador histórico de Portugal después de CR7?', options: ['Eusébio', 'Pauleta', 'Luís Figo', 'Bernardo Silva'], correct: 0 }
    ],
    Japón: [
      { question: '¿En qué año Japón co-organizó el Mundial junto a Corea del Sur?', options: ['2002', '2006', '1998', '2010'], correct: 0 },
      { question: '¿Qué jugador japonés jugó en el Manchester United?', options: ['Shinji Kagawa', 'Keisuke Honda', 'Maya Yoshida', 'Takumi Minamino'], correct: 0 },
      { question: '¿Cómo se llama la liga profesional de fútbol de Japón?', options: ['J-League', 'K-League', 'Nippon League', 'Emperor League'], correct: 0 },
      { question: '¿Cuál es el apodo de la selección japonesa?', options: ['Samuráis Azules', 'Guerreros del Sol', 'Leones de Oriente', 'Dragones Rojos'], correct: 0 },
      { question: '¿Qué arquero japonés fue famoso por su peinado y atajadas en los 2000?', options: ['Yoshikatsu Kawaguchi', 'Seigo Narazaki', 'Eiji Kawashima', 'Shusaku Nishikawa'], correct: 0 }
    ]
  };

  // Construir array de 50 preguntas
  let todasLasPreguntas = [];
  for (const equipo in preguntasPorEquipo) {
    todasLasPreguntas.push(...preguntasPorEquipo[equipo]);
  }

  // Mezclar preguntas
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  let preguntasAleatorias = [];
  let triviaState = {
    currentIndex: 0,
    correctCount: 0,
    incorrectCount: 0,
    answered: false,
    total: 50,
    shuffledCorrectIndex: 0
  };

  function reiniciarTrivia() {
    preguntasAleatorias = shuffleArray([...todasLasPreguntas]);
    triviaState.currentIndex = 0;
    triviaState.correctCount = 0;
    triviaState.incorrectCount = 0;
    triviaState.answered = false;
    triviaState.shuffledCorrectIndex = 0;
    actualizarContadores();
    mostrarPregunta();
  }

  function actualizarContadores() {
    const correctSpan = document.getElementById('correctCount');
    const incorrectSpan = document.getElementById('incorrectCount');
    if (correctSpan) correctSpan.textContent = triviaState.correctCount;
    if (incorrectSpan) incorrectSpan.textContent = triviaState.incorrectCount;
  }

  function mostrarPregunta() {
    if (triviaState.currentIndex >= preguntasAleatorias.length) {
      const triviaCard = document.getElementById('triviaCard');
      if (triviaCard) {
        triviaCard.innerHTML = `
          <div style="text-align: center; padding: 20px;">
            <h2>🎉 ¡Trivia Completada! 🎉</h2>
            <div class="trivia-stats" style="margin: 20px 0;">
              <div class="stat-box correct"><span class="label">✓ Correctas</span><span class="number">${triviaState.correctCount}</span></div>
              <div class="stat-box incorrect"><span class="label">✗ Incorrectas</span><span class="number">${triviaState.incorrectCount}</span></div>
            </div>
            <p class="muted">Porcentaje: ${Math.round((triviaState.correctCount / 50) * 100)}%</p>
            <div class="row">
              <button class="btn btn--primary" id="resetTriviaBtn" style="margin-top: 20px;">🔄 Jugar de nuevo</button>
              <button class="btn" data-nav="s2" style="margin-top: 20px;">Volver al Feed</button>
            </div>
          </div>
        `;
        const newResetBtn = document.getElementById('resetTriviaBtn');
        if (newResetBtn) newResetBtn.addEventListener('click', reiniciarTrivia);
      }
      return;
    }

    const pregunta = preguntasAleatorias[triviaState.currentIndex];
    const questionNumberSpan = document.getElementById('questionNumber');
    const questionTextSpan = document.getElementById('questionText');
    const feedbackDiv = document.getElementById('feedbackMessage');
    
    if (questionNumberSpan) questionNumberSpan.textContent = `Pregunta ${triviaState.currentIndex + 1} de 50`;
    if (questionTextSpan) questionTextSpan.textContent = pregunta.question;
    if (feedbackDiv) feedbackDiv.hidden = true;

    // Separar correcta e incorrectas, elegir posición aleatoria garantizada
    const correctText = pregunta.options[pregunta.correct];
    const wrongOptions = shuffleArray(pregunta.options.filter((_, i) => i !== pregunta.correct));
    const correctPosition = Math.floor(Math.random() * 4);
    const finalOptions = [...wrongOptions];
    finalOptions.splice(correctPosition, 0, correctText);
    triviaState.shuffledCorrectIndex = correctPosition;

    finalOptions.forEach((option, index) => {
      const optionSpan = document.getElementById(`option${index}`);
      if (optionSpan) optionSpan.textContent = option;
    });

    const btns = document.querySelectorAll('.trivia-btn');
    btns.forEach((btn, index) => {
      btn.classList.remove('correct', 'incorrect');
      btn.disabled = false;
      btn.setAttribute('data-index', index);
    });

    triviaState.answered = false;
  }

  function handleAnswer(selectedIndex) {
    if (triviaState.answered) return;

    const pregunta = preguntasAleatorias[triviaState.currentIndex];
    const correctIndex = triviaState.shuffledCorrectIndex;
    const isCorrect = selectedIndex === correctIndex;
    const feedback = document.getElementById('feedbackMessage');
    const selectedBtn = document.querySelector(`.trivia-btn[data-index="${selectedIndex}"]`);
    const correctBtn = document.querySelector(`.trivia-btn[data-index="${correctIndex}"]`);

    triviaState.answered = true;

    if (isCorrect) {
      triviaState.correctCount++;
      if (selectedBtn) selectedBtn.classList.add('correct');
      if (feedback) {
        feedback.textContent = '✓ ¡Correcto!';
        feedback.classList.remove('error');
        feedback.classList.add('success');
        feedback.hidden = false;
      }
    } else {
      triviaState.incorrectCount++;
      if (selectedBtn) selectedBtn.classList.add('incorrect');
      if (correctBtn) correctBtn.classList.add('correct');
      if (feedback) {
        feedback.textContent = `✗ Incorrecto. La respuesta era: ${pregunta.options[pregunta.correct]}`;
        feedback.classList.remove('success');
        feedback.classList.add('error');
        feedback.hidden = false;
      }
    }

    actualizarContadores();

    const allBtns = document.querySelectorAll('.trivia-btn');
    allBtns.forEach(btn => btn.disabled = true);

    setTimeout(() => {
      triviaState.currentIndex++;
      mostrarPregunta();
    }, 2000);
  }

  // Inicializar eventos de trivia cuando el DOM esté listo
  function initTriviaEvents() {
    const btns = document.querySelectorAll('.trivia-btn');
    btns.forEach(btn => {
      btn.removeEventListener('click', triviaClickHandler);
      btn.addEventListener('click', triviaClickHandler);
    });
    
    const resetBtn = document.getElementById('resetTriviaBtn');
    if (resetBtn) {
      resetBtn.removeEventListener('click', reiniciarTrivia);
      resetBtn.addEventListener('click', reiniciarTrivia);
    }
  }

  function triviaClickHandler(e) {
    const index = parseInt(e.currentTarget.getAttribute('data-index'));
    handleAnswer(index);
  }

  // Variable global para control
  let activeModel = null;
  let activeTargetIndex = -1;

  // Variable global para controlar la cámara
  let arSystem = null;
  let qrScanInterval = null;
  let arCheckInterval = null;
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  const scanQRCode = () => {
    const video = document.querySelector('video');
    if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    if (window.jsQR) {
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
      if (code) {
        console.log("QR Encontrado:", code.data);
        const qrStatus = getQrStatus();
        if (qrStatus) qrStatus.textContent = '¡QR Detectado!';
        if (qrStatus) qrStatus.style.color = '#00ffff';
        qrValue.textContent = code.data;
      }
    }
  };

  const getARSystem = () => {
    if (arScene && arScene.systems && arScene.systems["mindar-image-system"]) {
      return arScene.systems["mindar-image-system"];
    }
    return null;
  };

  if (arScene) {
    arScene.addEventListener('mindar-image-ready', () => {
      console.log("MindAR: Ready event received");
      const _qs335=getQrStatus(); if (_qs335) _qs335.textContent = 'Motor AR cargado. Pulsa iniciar.';
    });
    arScene.addEventListener('mindar-image-error', (e) => {
      console.error("MindAR Error:", e);
      const _qs339=getQrStatus(); if (_qs339) _qs339.textContent = 'Error: No se pudo cargar targets.mind';
    });
  }

  startScanBtn.addEventListener('click', () => {
    arSystem = getARSystem();
    if (!arSystem) {
      alert("El sistema AR no está listo. Revisa la consola.");
      return;
    }
    console.log('Iniciando MindAR y Scanner QR...');
    const _qs350=getQrStatus(); if (_qs350) _qs350.textContent = 'Cámara activa. Buscando...';
    startScanBtn.disabled = true;
    try {
      if (!arSystem.ui) {
        arSystem.ui = { showLoading: () => {}, removeLoading: () => {}, showScanning: () => {}, showError: () => {} };
      }
      arSystem.start();
      if (qrScanInterval) clearInterval(qrScanInterval);
      qrScanInterval = setInterval(scanQRCode, 500);
      if (arCheckInterval) clearInterval(arCheckInterval);
      arCheckInterval = setInterval(() => {
        const arTargets = document.querySelectorAll('[mindar-image-target]');
        arTargets.forEach((target, index) => {
          if (target.object3D && target.object3D.visible) {
            if (activeTargetIndex !== index) {
              const evt = new CustomEvent('game-target-found', { detail: { targetIndex: index, el: target } });
              document.body.dispatchEvent(evt);
            }
          } else {
            if (activeTargetIndex === index) {
              const evt = new CustomEvent('game-target-lost', { detail: { targetIndex: index, el: target } });
              document.body.dispatchEvent(evt);
            }
          }
        });
      }, 250);
      stopScanBtn.disabled = false;
    } catch (err) {
      console.error(err);
      const _qs379=getQrStatus(); if (_qs379) _qs379.textContent = 'Error al iniciar: ' + err.message;
      startScanBtn.disabled = false;
    }
  });

  stopScanBtn.addEventListener('click', () => {
    arSystem = arSystem || getARSystem();
    if (arSystem) arSystem.stop();
    document.querySelectorAll('[mindar-image-target]').forEach(target => {
      target.setAttribute('visible', false);
      const model = target.querySelector('.ar-model');
      if (model) model.removeAttribute('animation-mixer');
    });
    if (qrScanInterval) { clearInterval(qrScanInterval); qrScanInterval = null; }
    if (arCheckInterval) { clearInterval(arCheckInterval); arCheckInterval = null; }
    const video = document.querySelector('video');
    if (video && video.srcObject) {
      const tracks = video.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      video.srcObject = null;
    }
    startScanBtn.disabled = false;
    stopScanBtn.disabled = true;
    const _qs402=getQrStatus(); if (_qs402) _qs402.textContent = 'Cámara detenida.';
    if (qrValue) qrValue.textContent = '—';
    activeModel = null;
    activeTargetIndex = -1;
    if (playerCard) playerCard.hidden = true;
    document.querySelectorAll('[data-player-action]').forEach(btn => btn.disabled = true);
  });

  const arTargets = document.querySelectorAll('[mindar-image-target]');
  arTargets.forEach(t => t.setAttribute('target-monitor', ''));

  const teamsData = [
    { name: 'México', continent: 'Americano', group: 'A', cups: '0 copas ganadas', model: 'assets/Modelos/M00_Mexico.glb', video: 'assets/videos/Video Mexico.mp4' },
    { name: 'Alemania', continent: 'Europeo', group: 'E', cups: '4 copas varoniles ganadas', model: 'assets/Modelos/M01_Alemania.glb', video: 'assets/videos/Video Alemania.mp4' },
    { name: 'Canadá', continent: 'América', group: 'B', cups: '0 copas ganadas', model: 'assets/Modelos/M02_Canada.glb', video: 'assets/videos/Video Canada.mp4' },
    { name: 'Corea del Sur', continent: 'Asiático', group: 'A', cups: '0 copas ganadas', model: 'assets/Modelos/M03_CoreaDelSur.glb', video: 'assets/videos/Video CoreaDelSur.mp4' },
    { name: 'España', continent: 'Europeo', group: 'H', cups: '1 copa varonil ganada', model: 'assets/Modelos/M04_Espania.glb', video: 'assets/videos/Video Espania.mp4' },
    { name: 'Francia', continent: 'Europeo', group: 'I', cups: '2 copas varoniles ganadas', model: 'assets/Modelos/M05_Francia.glb', video: 'assets/videos/Video Francia.mp4' },
    { name: 'Argentina', continent: 'Sudamérica', group: 'J', cups: '3 copas varoniles ganadas', model: 'assets/Modelos/M06_Argentina.glb', video: 'assets/videos/Video Argentina.mp4' },
    { name: 'Japón', continent: 'Asiático', group: 'F', cups: '0 copas ganadas', model: 'assets/Modelos/M07_Japon.glb', video: 'assets/videos/Video Japon.mp4' },
    { name: 'Portugal', continent: 'Europeo', group: 'K', cups: '0 copas ganadas', model: 'assets/Modelos/M08_Portugal.glb', video: 'assets/videos/Video Portugal.mp4' },
    { name: 'USA', continent: 'América', group: 'B', cups: '4 copas femeniles, 0 var.', model: 'assets/Modelos/M09_USA.glb', video: 'assets/videos/Video USA.mp4' }
  ];

  document.body.addEventListener('game-target-found', (e) => {
    const detail = e.detail;
    console.log("🎯 AR Target Found:", detail.targetIndex);
    activeTargetIndex = detail.targetIndex;
    document.querySelectorAll('[data-player-action]').forEach(btn => btn.disabled = false);
    const _qs431=getQrStatus(); if (_qs431) {
      _qs431.textContent = `¡Escudo #${detail.targetIndex} Detectado!`;
      _qs431.style.color = '#4caf50';
    }
    if (qrValue) qrValue.textContent = 'ID: ' + detail.targetIndex;
    const data = teamsData[detail.targetIndex];
    let model = detail.el.querySelector('.ar-model');
    if (!model && data) {
      console.log(`Cargando modelo bajo demanda: ${data.name}`);
      model = document.createElement('a-gltf-model');
      model.setAttribute('src', data.model);
      model.setAttribute('class', 'ar-model');
      model.setAttribute('position', '0 0 0');
      model.setAttribute('scale', '0.5 0.5 0.5');
      model.setAttribute('rotation', '90 0 0');
      model.addEventListener('model-error', () => {
        console.error(`No se pudo cargar el modelo 3D: ${data.name}`);
        const st = getQrStatus();
        if (st) st.textContent = `⚠️ Modelo de ${data.name} no disponible`;
      });
      model.addEventListener('model-loaded', () => {
        const st = getQrStatus();
        if (st) st.textContent = `✅ ${data.name} cargado`;
      });
      detail.el.appendChild(model);
    }
    activeModel = model;
    if (playerCard) playerCard.hidden = false;
    if (data) {
      const nameSpan = document.getElementById('playerName');
      const continentSpan = document.getElementById('teamContinent');
      const groupSpan = document.getElementById('teamGroup');
      const cupsSpan = document.getElementById('teamCups');
      if (nameSpan) nameSpan.textContent = data.name;
      if (continentSpan) continentSpan.textContent = data.continent;
      if (groupSpan) groupSpan.textContent = data.group;
      if (cupsSpan) cupsSpan.textContent = data.cups;
    }
  });

  document.body.addEventListener('game-target-lost', (e) => {
    const detail = e.detail;
    console.log("❌ AR Target Lost:", detail.targetIndex);
    if (activeTargetIndex === detail.targetIndex) {
      activeModel = null;
      activeTargetIndex = -1;
      document.querySelectorAll('[data-player-action]').forEach(btn => btn.disabled = true);
      const _qs469=getQrStatus(); if (_qs469) _qs469.textContent = 'Buscando escudo...';
    }
  });

  document.querySelectorAll('[data-player-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const action = e.target.getAttribute('data-player-action');
      const model = activeModel;
      if (!model) return;
      if (action === 'anim') {
        const mesh = model.getObject3D('mesh');
        if (!mesh || !mesh.animations || mesh.animations.length === 0) {
          alert("⚠️ El modelo 3D no tiene animaciones.");
          return;
        }
        const currentMixer = model.getAttribute('animation-mixer');
        let nextClip = mesh.animations.length > 0 ? mesh.animations[0].name : '*';
        if (currentMixer) {
          const currentClip = currentMixer.clip;
          const currentIndex = mesh.animations.findIndex(c => c.name === currentClip);
          if (currentIndex >= 0 && currentIndex < mesh.animations.length - 1) {
            nextClip = mesh.animations[currentIndex + 1].name;
          } else {
            nextClip = null;
          }
        }
        if (!nextClip) {
          model.removeAttribute('animation-mixer');
        } else {
          model.setAttribute('animation-mixer', `clip: ${nextClip}; loop: repeat; timeScale: 1`);
        }
      }
      if (action === 'video') {
        const data = teamsData[activeTargetIndex];
        if (data && data.video) {
          const feedVideo = document.getElementById('feedVideo');
          if (feedVideo) {
            feedVideo.src = data.video;
            feedVideo.load();
            feedVideo.play();
          }
          navigateTo('s2');
        }
      }
      if (action === 'info') {
        const currentScale = model.getAttribute('scale') || {x:1, y:1, z:1};
        model.setAttribute('animation', `property: scale; to: ${currentScale.x*1.5} ${currentScale.y*1.5} ${currentScale.z*1.5}; dir: alternate; dur: 200; loop: 2`);
      }
      if (action === 'fx') {
        const currentRot = model.getAttribute('rotation');
        model.setAttribute('animation__rot', { property: 'rotation', to: `${currentRot.x} ${currentRot.y + 90} ${currentRot.z}`, dur: 500, easing: 'easeOutQuad' });
      }
    });
  });

  // Navegación entre pantallas — delegación en document para cubrir elementos dinámicos
  function navigateTo(targetId) {
    const targetScreen = document.querySelector(`[data-screen="${targetId}"]`);
    if (!targetScreen) return;
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('screen--active'));
    targetScreen.classList.add('screen--active');
    const screenTitles = { s1: 'Inicio', s2: 'Feed', s3: 'Editor', s4: 'Escanear QR', s5: 'Trivia', s8: 'Guía' };
    const titleSpan = document.getElementById('topbarTitle');
    if (titleSpan) titleSpan.textContent = screenTitles[targetId] || 'Inicio';
    if (targetId === 's5') {
      initTriviaEvents();
      if (preguntasAleatorias.length === 0) reiniciarTrivia();
      else mostrarPregunta();
    }
    if (targetId === 's4') {
      setTimeout(() => window.dispatchEvent(new Event('resize')), 200);
      if (startScanBtn) startScanBtn.disabled = false;
      const qrStatus = document.getElementById('qrStatus');
      if (qrStatus) qrStatus.textContent = 'Listo. Pulsa iniciar.';
    }
    if (targetId === 's8') {
      updateUnlockedVisuals();
    }
    if (targetId !== 's4' && stopScanBtn && !stopScanBtn.disabled) stopScanBtn.click();
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-nav]');
    if (!btn) return;
    navigateTo(btn.getAttribute('data-nav'));
  });

  // Editor de video
  const videoInput = document.getElementById('videoInput');
  const selectedVideo = document.getElementById('selectedVideo');
  let currentVideoURL = null;
  if (videoInput && selectedVideo) {
    videoInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (currentVideoURL) URL.revokeObjectURL(currentVideoURL);
      currentVideoURL = URL.createObjectURL(file);
      selectedVideo.src = currentVideoURL;
      selectedVideo.load();
      selectedVideo.className = 'video';
    });
  }

  document.querySelectorAll('.btn-thumb').forEach(btn => {
    btn.addEventListener('click', () => {
      const videoSrc = btn.getAttribute('data-vsrc');
      if (selectedVideo) {
        selectedVideo.src = videoSrc;
        selectedVideo.load();
        selectedVideo.className = 'video';
      }
    });
  });

  document.querySelectorAll('.btn--filter').forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      const feedCard = btn.closest('.feed-card');
      if (feedCard) {
        const cardVideo = feedCard.querySelector('.feed-card__video');
        if (!cardVideo) return;
        cardVideo.className = 'video feed-card__video';
        if (filter !== 'none') cardVideo.classList.add(`f-${filter}`);
        feedCard.querySelectorAll('.btn--filter').forEach(b => b.classList.remove('active-filter'));
        btn.classList.add('active-filter');
      } else if (selectedVideo) {
        selectedVideo.className = 'video';
        if (filter !== 'none') selectedVideo.classList.add(`f-${filter}`);
        document.querySelectorAll('.filter-controls:not(.feed-card__filters) .btn--filter').forEach(b => b.classList.remove('active-filter'));
        btn.classList.add('active-filter');
      }
    });
  });

  // Colección de equipos desbloqueados
  const teamsCollection = [
    { name: 'México', icon: '🇲🇽' }, { name: 'Alemania', icon: '🇩🇪' }, { name: 'Canadá', icon: '🇨🇦' },
    { name: 'Corea del Sur', icon: '🇰🇷' }, { name: 'España', icon: '🇪🇸' }, { name: 'Francia', icon: '🇫🇷' },
    { name: 'Argentina', icon: '🇦🇷' }, { name: 'Japón', icon: '🇯🇵' }, { name: 'Portugal', icon: '🇵🇹' },
    { name: 'USA', icon: '🇺🇸' }
  ];

  function updateUnlockedVisuals() {
    let unlocked = JSON.parse(localStorage.getItem('walletUnlocked')) || [];
    const container = document.getElementById('unlockedContainer');
    if (container) {
      container.innerHTML = '';
      unlocked.forEach(teamId => {
        const team = teamsCollection[teamId];
        if (team) {
          const badge = document.createElement('div');
          badge.className = 'achievement-badge';
          badge.innerHTML = `<div class="achievement-icon">${team.icon}</div><div><strong>${team.name}</strong><br><span class="muted" style="font-size:12px">Desbloqueado</span></div>`;
          container.appendChild(badge);
        }
      });
      if (unlocked.length === 0) container.innerHTML = '<div class="muted" style="text-align:center; padding:20px;">Aún no has desbloqueado selecciones. ¡Escanea escudos!</div>';
    }
  }

  document.body.addEventListener('game-target-found', (e) => {
    let idx = e.detail.targetIndex;
    if (idx !== undefined && teamsCollection[idx]) {
      let unlocked = JSON.parse(localStorage.getItem('walletUnlocked') || '[]');
      if (!unlocked.includes(idx)) {
        unlocked.push(idx);
        localStorage.setItem('walletUnlocked', JSON.stringify(unlocked));
        updateUnlockedVisuals();
        const toast = document.createElement('div');
        toast.textContent = `🏆 ¡${teamsCollection[idx].name} desbloqueado!`;
        toast.style.cssText = 'position:fixed; bottom:80px; left:20px; background:#4fe0b5; color:#0b1020; padding:8px 16px; border-radius:40px; font-weight:bold; z-index:9999;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
      }
    }
  });

  const clearBtn = document.getElementById('clearUnlockedBtn');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    localStorage.removeItem('walletUnlocked');
    updateUnlockedVisuals();
  });
  // Carga inicial al arrancar la app
  updateUnlockedVisuals();
});