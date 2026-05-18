// --- HERRAMIENTA DE DEPURACIÓN GLOBAL ---
// logToScreen
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

// --- DATOS GLOBALES ---
const teamsCollection = [
  { name: 'México', icon: '🇲🇽' }, { name: 'Alemania', icon: '🇩🇪' }, { name: 'Canadá', icon: '🇨🇦' },
  { name: 'Corea del Sur', icon: '🇰🇷' }, { name: 'España', icon: '🇪🇸' }, { name: 'Francia', icon: '🇫🇷' },
  { name: 'Argentina', icon: '🇦🇷' }, { name: 'Japón', icon: '🇯🇵' }, { name: 'Portugal', icon: '🇵🇹' },
  { name: 'USA', icon: '🇺🇸' }
];

const teamsData = [
  { name: 'México', continent: 'Norteamérica', group: 'A', cups: '0 copas ganadas', model: 'assets/Modelos/M00_Mexico_comp.glb', video: 'assets/videos/resumen_mexico.mp4' },
  { name: 'Alemania', continent: 'Europeo', group: 'E', cups: '4 copas varoniles ganadas', model: 'assets/Modelos/M01_Alemania.glb', video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { name: 'Canadá', continent: 'Norteamérica', group: 'B', cups: '0 copas ganadas', model: 'assets/Modelos/M02_Canada.glb', video: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4' },
  { name: 'Corea del Sur', continent: 'Asiático', group: 'A', cups: '0 copas ganadas', model: 'assets/Modelos/M03_CoreaDelSur.glb', video: 'https://www.w3schools.com/html/movie.mp4' },
  { name: 'España', continent: 'Europeo', group: 'H', cups: '1 copa varonil ganada', model: 'assets/Modelos/M04_Espania.glb', video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { name: 'Francia', continent: 'Europeo', group: 'I', cups: '2 copas varoniles ganadas', model: 'assets/Modelos/M05_Francia.glb', video: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4' },
  { name: 'Argentina', continent: 'Sudamérica', group: 'J', cups: '3 copas varoniles ganadas', model: 'assets/Modelos/M06_Argentina.glb', video: 'https://www.w3schools.com/html/movie.mp4' },
  { name: 'Japón', continent: 'Asiático', group: 'F', cups: '0 copas ganadas', model: 'assets/Modelos/M07_Japon.glb', video: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { name: 'Portugal', continent: 'Europeo', group: 'K', cups: '0 copas ganadas', model: 'assets/Modelos/M08_Portugal.glb', video: 'https://samplelib.com/lib/preview/mp4/sample-5s.mp4' },
  { name: 'USA', continent: 'Norteamérica', group: 'B', cups: '4 copas femeniles, 0 var.', model: 'assets/Modelos/M09_USA.glb', video: 'assets/videos/final_2026.mp4' }
];
// model-loaded
// --- COMPONENTE A-FRAME PARA DETECCIÓN ---
if (typeof AFRAME !== 'undefined') {
  AFRAME.registerComponent('target-monitor', {
    init: function () {
      this.el.addEventListener('mindar-image-target-found', () => {

        let index;
        const targetData = this.el.getAttribute('mindar-image-target');
        if (typeof targetData === 'object' && targetData !== null) {
          index = targetData.targetIndex ?? targetData.index;
        } else {
          // A-Frame devolvió el atributo como string: "targetIndex: 0"
          const match = String(targetData).match(/targetIndex\s*:\s*(\d+)/);
          index = match ? parseInt(match[1]) : undefined;
        }
        
        window.logToScreen('1. Escudo detectado. Índice: ' + index, '#0f0'); 

        // CORRECCIÓN: Usar teamsData que contiene las rutas de los modelos .glb
        const data = teamsData[index];
        
        if (!data) {
          window.logToScreen('ERROR: No hay datos en teamsData para el índice ' + index, '#f00');
          return; 
        }
        
        window.logToScreen('2. Cargando modelo: ' + data.name, '#0f0');
        
        if (index !== undefined) {
          document.body.dispatchEvent(new CustomEvent('game-target-found', { 
            detail: { targetIndex: parseInt(index), el: this.el }
          }));
        }
      });

      this.el.addEventListener('mindar-image-target-lost', (e) => {
        let index;
        const targetData = this.el.getAttribute('mindar-image-target');
        if (typeof targetData === 'object' && targetData !== null) {
          index = targetData.targetIndex ?? targetData.index;
        } else {
          // A-Frame devolvió el atributo como string: "targetIndex: 0"
          const match = String(targetData).match(/targetIndex\s*:\s*(\d+)/);
          index = match ? parseInt(match[1]) : undefined;
        }
        if (index !== undefined) {
          document.body.dispatchEvent(new CustomEvent('game-target-lost', { 
            detail: { targetIndex: parseInt(index), el: this.el } 
          }));
        }
      });
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  window.logToScreen('DOMContentLoaded iniciado', '#ffff00'); // ← agrega esto
  const startScanBtn = document.getElementById('startScanBtn');
  const stopScanBtn = document.getElementById('stopScanBtn');
  const qrStatus = document.getElementById('qrStatus');
  const qrValue = document.getElementById('qrValue');
  const topbarTitle = document.getElementById('topbarTitle');
  const arScene = document.getElementById('arScene');
  const playerCard = document.getElementById('playerCard');

  // Get references to player card elements once
  const playerNameSpan = document.getElementById('playerName');
  const teamContinentSpan = document.getElementById('teamContinent');
  const teamGroupSpan = document.getElementById('teamGroup');
  const teamCupsSpan = document.getElementById('teamCups');

  // --- EFECTOS DE SONIDO ---
  const soundSuccess = new Audio('https://assets.mixkit.co/active_storage/sfx/2571/2571-preview.mp3');
  const soundCelebration = new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3');

  // Referencias del editor de video (Movidas al inicio para evitar errores de referencia)
  const videoInput = document.getElementById('videoInput'); 
  const selectedVideo = document.getElementById('selectedVideo');
  const selectedVideoContainer = document.getElementById('selectedVideoContainer');

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

  // --- MEJORA DE FILTROS: Manejo de Interacción y Controles Personalizados ---
  // Agrega una clase 'interacting' para desactivar filtros mientras se usan los controles
  const initCustomControls = (video) => {
    // Evitar inicializar múltiples veces
    if (!video || video.dataset.controlsSet === "true") return;

    const container = video.parentElement;
    const playBtn = container.querySelector('.play-btn');
    const seekBar = container.querySelector('.seek-bar');
    const timeDisplay = container.querySelector('.time-display');
    
    if (!playBtn || !seekBar || !timeDisplay) return;

    video.dataset.controlsSet = "true"; // Marcar que los controles ya fueron configurados
    video.removeAttribute('controls'); // Eliminar controles nativos

    // Estado inicial
    video.setAttribute('data-playing', video.paused ? 'false' : 'true');

    // Alternar Play/Pause
    playBtn.addEventListener('click', () => {
      if (video.paused) video.play();
      else video.pause();
    });
    video.addEventListener('play', () => {
      playBtn.textContent = '⏸';
      video.setAttribute('data-playing', 'true');
    });
    video.addEventListener('pause', () => {
      playBtn.textContent = '▶';
      video.setAttribute('data-playing', 'false');
    });

    // Actualizar barra de progreso
    video.addEventListener('timeupdate', () => {
      const value = (100 / video.duration) * video.currentTime;
      seekBar.value = value || 0;
      let mins = Math.floor(video.currentTime / 60);
      let secs = Math.floor(video.currentTime % 60);
      timeDisplay.textContent = `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    });
    seekBar.addEventListener('input', () => { video.currentTime = video.duration * (seekBar.value / 100); });
    video.addEventListener('click', () => { if (video.paused) video.play(); else video.pause(); });
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
    total: 50
  };

  function reiniciarTrivia() {
    preguntasAleatorias = shuffleArray([...todasLasPreguntas]);
    triviaState.currentIndex = 0;
    triviaState.correctCount = 0;
    triviaState.incorrectCount = 0;
    triviaState.answered = false;
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

    pregunta.options.forEach((option, index) => {
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
    const isCorrect = selectedIndex === pregunta.correct;
    const feedback = document.getElementById('feedbackMessage');
    const selectedBtn = document.querySelector(`.trivia-btn[data-index="${selectedIndex}"]`);
    const correctBtn = document.querySelector(`.trivia-btn[data-index="${pregunta.correct}"]`);

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
//  
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
  const context = canvas.getContext('2d', { willReadFrequently: true });

  const scanQRCode = () => {
    // Buscamos el video de la cámara (MindAR crea uno sin ID)
    // Evitamos agarrar los videos de los perfiles/feed que sí tienen ID o clase
    const allVideos = Array.from(document.querySelectorAll('video'));
    const cameraVideo = allVideos.find(v => !v.id && !v.classList.contains('feed-card__video')) || allVideos[0];
    
    if (!cameraVideo || cameraVideo.readyState !== cameraVideo.HAVE_ENOUGH_DATA) return;
    const video = cameraVideo;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    if (window.jsQR) {
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: "dontInvert" });
      if (code) {
        console.log("QR Encontrado:", code.data);
        qrStatus.textContent = '¡QR Detectado!';
        qrStatus.style.color = '#00ffff';
        qrValue.textContent = code.data;
      }
    }
  };

  const getARSystem = () => {
    if (!arScene) return null;
    // Intento 1: Vía sistemas de la escena
    let system = arScene.systems && arScene.systems["mindar-image-system"];
    if (system) return system;
    // Intento 2: Vía componente (algunas versiones lo exponen aquí)
    if (arScene.components && arScene.components["mindar-image"]) {
      return arScene.components["mindar-image"].system;
    }
    return null;
  };

  if (arScene) {
    arScene.addEventListener('mindar-image-ready', () => {
      console.log("MindAR: Ready event received");
      if (qrStatus) qrStatus.textContent = 'Motor AR cargado. Pulsa iniciar.';
    });
    arScene.addEventListener('mindar-image-error', (e) => {
      console.error("MindAR Error:", e);
      if (qrStatus) qrStatus.textContent = 'Error: No se pudo cargar targets.mind';
    });
  }

  window.logToScreen('Registrando startScanBtn listener...', '#ffff00'); // ← agrega esto
  
  startScanBtn.addEventListener('click', async () => {
    window.logToScreen('CLICK RECIBIDO', '#ff0000');
    window.logToScreen('Click en iniciar. arScene: ' + (arScene ? 'OK' : 'NULL') + ' hasLoaded: ' + (arScene && arScene.hasLoaded), '#ffff00');

    const initAR = async () => {
      // Intentar obtener el sistema
      arSystem = getARSystem();

      // Si no está, esperar un poco (re-intento por timing de inicialización)
      if (!arSystem) {
        window.logToScreen("Motor AR no listo, reintentando...", "#ff9900");
        await new Promise(r => setTimeout(r, 600));
        arSystem = getARSystem();
      }

      if (!arSystem) {
        window.logToScreen("Error: Motor AR no encontrado.", "#ff4444");
        alert("El motor de Realidad Aumentada no ha cargado. Esto sucede si la conexión es lenta. Por favor, refresca la página e intenta de nuevo.");
        startScanBtn.disabled = false;
        return;
      }
      
      // Desbloquear audio
      await soundSuccess.play().then(() => { soundSuccess.pause(); soundSuccess.currentTime = 0; }).catch(() => {});
      await soundCelebration.play().then(() => { soundCelebration.pause(); soundCelebration.currentTime = 0; }).catch(() => {});

    window.logToScreen("Iniciando motor AR...");
      if (qrStatus) qrStatus.textContent = 'Iniciando motor AR...';
      startScanBtn.disabled = true;
      
      try {
        if (!arSystem.ui) {
          arSystem.ui = { showLoading: () => {}, removeLoading: () => {}, showScanning: () => {}, showError: () => {} };
        }
        await arSystem.start();

        document.body.classList.add('ar-active');

        arScene.style.display = 'block';
        arScene.style.pointerEvents = 'none'; // los botones siguen funcionando
        document.querySelector('[data-screen="s4"]').style.background = 'transparent';

        window.logToScreen("¡Cámara activa! Buscando escudos...", "#4fe0b5");
        if (qrStatus) qrStatus.textContent = 'Cámara activa. Buscando...';

        if (qrScanInterval) clearInterval(qrScanInterval);
        qrScanInterval = setInterval(scanQRCode, 500);

        const arTargets = Array.from(document.querySelectorAll('[mindar-image-target]'));
        setTimeout(() => {
          if (arCheckInterval) clearInterval(arCheckInterval);
          arCheckInterval = setInterval(() => {
            arTargets.forEach((target, index) => {
              if (target.object3D && target.object3D.visible) {
                if (activeTargetIndex !== index) {
                  document.body.dispatchEvent(new CustomEvent('game-target-found', {
                    detail: { targetIndex: index, el: target }
                  }));
                }
              } else {
                if (activeTargetIndex === index) {
                  document.body.dispatchEvent(new CustomEvent('game-target-lost', {
                    detail: { targetIndex: index, el: target }
                  }));
                }
              }
            });
          }, 250);
        }, 1000);

        stopScanBtn.disabled = false;
      } catch (err) {
        console.error(err);
        if (qrStatus) qrStatus.textContent = 'Error: ' + err.message;
        startScanBtn.disabled = false;
      }
    };

    if (!arScene.hasLoaded) {
      window.logToScreen("Cargando escena...", "#ff9900");
      arScene.addEventListener('loaded', initAR, { once: true });
    } else {
      await initAR();
    }
  });

  stopScanBtn.addEventListener('click', () => {
    arSystem = arSystem || getARSystem();
    if (arSystem) arSystem.stop();
    arScene.style.display = 'none';
    document.body.classList.remove('ar-active');
    // Resetear estado
    startScanBtn.disabled = false;
    stopScanBtn.disabled = true;
    activeModel = null;
    activeTargetIndex = -1;
    if (playerCard) playerCard.hidden = true;
    document.querySelectorAll('[data-player-action]').forEach(btn => btn.disabled = true);
    if (qrScanInterval) { clearInterval(qrScanInterval); qrScanInterval = null; }
    if (arCheckInterval) { clearInterval(arCheckInterval); arCheckInterval = null; }
    if (qrStatus) qrStatus.textContent = 'Cámara detenida. Recarga para usar de nuevo.';
  });

  // Inicializar controles personalizados para videos existentes en el feed
  document.querySelectorAll('.feed-card .video').forEach(video => initCustomControls(video));
  if (selectedVideo) initCustomControls(selectedVideo);

  document.body.addEventListener('game-target-found', (e) => {
    try {
      const detail = e.detail;
      if (detail.targetIndex === undefined || isNaN(detail.targetIndex)) return;
      
      if (activeTargetIndex === detail.targetIndex && activeModel) return;

      activeTargetIndex = detail.targetIndex;
      document.querySelectorAll('[data-player-action]').forEach(btn => btn.disabled = false);
      if (detail.el) detail.el.setAttribute('visible', true);

      soundSuccess.play().catch(() => {});

      if (qrStatus) {
        qrStatus.textContent = `¡Escudo #${detail.targetIndex} Detectado!`;
        qrStatus.style.color = '#4caf50';
      }
      if (qrValue) qrValue.textContent = 'ID: ' + detail.targetIndex;

      const data = teamsData[detail.targetIndex];
      if (!data) {
          window.logToScreen(`Sin datos para ID ${detail.targetIndex}`, "#ff4444");
          return;
      }

      let model = detail.el.querySelector('.ar-model');
      if (!model) {
        model = document.createElement('a-gltf-model');
        model.setAttribute('src', data.model);
        model.setAttribute('class', 'ar-model');
        model.setAttribute('rotation', '90 0 0');
        detail.el.appendChild(model);
        model.addEventListener('model-loaded', () => {
          window.logToScreen('✅ Modelo cargado: ' + data.name, '#4fe0b5');
          // Forzar re-render
          model.object3D.visible = false;
          setTimeout(() => { model.object3D.visible = true; }, 50);
        });

        model.addEventListener('model-error', (err) => {
          window.logToScreen('❌ Error modelo: ' + err.detail.message, '#ff4444');
        });
      }
      activeModel = model;

      if (playerCard) playerCard.hidden = false;
      if (playerNameSpan) playerNameSpan.textContent = data.name;
      if (teamContinentSpan) teamContinentSpan.textContent = data.continent;
      if (teamGroupSpan) teamGroupSpan.textContent = data.group;
      if (teamCupsSpan) teamCupsSpan.textContent = data.cups;

      // Desbloqueo
      actualizarDesbloqueo(detail.targetIndex);
    } catch (err) {
      window.logToScreen("Error en Found: " + err.message, "#ff4444");
    }
  });

  function actualizarDesbloqueo(index) {
    if (teamsCollection && teamsCollection[index]) {
      let unlocked = JSON.parse(localStorage.getItem('walletUnlocked') || '[]');
      if (!unlocked.includes(index)) {
        unlocked.push(index);
        localStorage.setItem('walletUnlocked', JSON.stringify(unlocked));
        updateUnlockedVisuals();
        const toast = document.createElement('div');
        toast.textContent = `🏆 ¡${teamsCollection[index].name} desbloqueado!`;
        toast.style.cssText = 'position:fixed; bottom:80px; left:20px; background:#4fe0b5; color:#0b1020; padding:8px 16px; border-radius:40px; font-weight:bold; z-index:9999;';
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 2500);
      }
    }
  }

  document.body.addEventListener('game-target-lost', (e) => {
    const detail = e.detail;
    console.log("❌ AR Target Lost:", detail.targetIndex);
    if (activeTargetIndex === detail.targetIndex) {
      activeModel = null;
      activeTargetIndex = -1;
      document.querySelectorAll('[data-player-action]').forEach(btn => btn.disabled = true);
      if (qrStatus) qrStatus.textContent = 'Buscando escudo...';
    }
  });

  // --- FUNCIONES PARA EFECTOS 3D (DENTRO DEL AR) ---
  const trigger3DConfetti = (target) => {
    const colors = ['#4fe0b5', '#ffffff', '#1a2b6a', '#ffeb3b'];
    for (let i = 0; i < 40; i++) {
      const p = document.createElement('a-plane');
      p.setAttribute('color', colors[Math.floor(Math.random() * colors.length)]);
      p.setAttribute('width', '0.04');
      p.setAttribute('height', '0.04');
      p.setAttribute('position', '0 0.2 0'); // Salen desde el centro del escudo
      
      const dest = {
        x: (Math.random() - 0.5) * 2,
        y: Math.random() * 2,
        z: (Math.random() - 0.5) * 2
      };
      
      // Animaciones de movimiento, rotación y desvanecimiento
      p.setAttribute('animation__pos', `property: position; to: ${dest.x} ${dest.y} ${dest.z}; dur: ${1500 + Math.random()*1000}; easing: easeOutQuad`);
      p.setAttribute('animation__rot', `property: rotation; to: ${Math.random()*360} ${Math.random()*360} ${Math.random()*360}; dur: 2000; loop: true`);
      p.setAttribute('animation__op', `property: opacity; from: 1; to: 0; dur: 2000; easing: easeInQuad`);
      
      target.appendChild(p);
      setTimeout(() => { if(p.parentNode) p.remove(); }, 2100);
    }
  };

  const trigger3DFireworks = (target) => {
    for (let f = 0; f < 3; f++) {
      setTimeout(() => {
        const burst = document.createElement('a-entity');
        burst.setAttribute('position', `${(Math.random()-0.5)} 0 ${(Math.random()-0.5)}`);
        target.appendChild(burst);
        
        const rocket = document.createElement('a-sphere');
        rocket.setAttribute('radius', '0.02');
        rocket.setAttribute('color', 'white');
        rocket.setAttribute('animation', 'property: position; to: 0 1.5 0; dur: 600; easing: easeOutQuad');
        burst.appendChild(rocket);
        
        setTimeout(() => {
          if (rocket.parentNode) rocket.remove();
          const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
          const burstColor = colors[Math.floor(Math.random()*colors.length)];
          for (let i = 0; i < 20; i++) {
            const spark = document.createElement('a-sphere');
            spark.setAttribute('radius', '0.015');
            spark.setAttribute('color', burstColor);
            spark.setAttribute('position', '0 1.5 0');
            const dx = (Math.random()-0.5)*1.5;
            const dy = (Math.random()-0.5)*1.5 + 1.5;
            const dz = (Math.random()-0.5)*1.5;
            spark.setAttribute('animation__pos', `property: position; to: ${dx} ${dy} ${dz}; dur: 800; easing: easeOutQuad`);
            spark.setAttribute('animation__op', 'property: opacity; to: 0; dur: 800');
            burst.appendChild(spark);
          }
          setTimeout(() => { if(burst.parentNode) burst.remove(); }, 1000);
        }, 600);
      }, f * 400);
    }
  };

  const trigger3DGolText = (target) => {
    const golText = document.createElement('a-text');
    golText.setAttribute('value', '¡GOL!');
    golText.setAttribute('color', '#4fe0b5');
    golText.setAttribute('align', 'center');
    golText.setAttribute('position', '0 0.8 0');
    golText.setAttribute('scale', '0 0 0');
    golText.setAttribute('animation', 'property: scale; to: 2 2 2; dur: 500; easing: easeOutBack');
    golText.setAttribute('animation__out', 'property: opacity; from: 1; to: 0; dur: 500; delay: 1200');
    target.appendChild(golText);
    setTimeout(() => { if(golText.parentNode) golText.remove(); }, 1800);
  };

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
          document.querySelector('[data-nav="s2"]').click();
        }
      }
      if (action === 'rotate-left' || action === 'rotate-right') {
        if (!model.object3D) return; 
        const rotation = model.object3D.rotation;
        const currentZ = THREE.MathUtils.radToDeg(rotation.z) || 0;
        const offset = (action === 'rotate-left') ? -45 : 45;
        
        // Eliminar animación previa para evitar conflictos de interpolación
        model.removeAttribute('animation__rot');
        
        // Forzar un pequeño delay para que A-Frame registre el cambio de atributo
        model.setAttribute('animation__rot', {
          property: 'rotation',
          to: `90 0 ${currentZ + offset}`,
          dur: 300,
          easing: 'easeOutQuad'
        });
      }
      if (action === 'fx') {
        // Disparar efectos 3D
        trigger3DConfetti(model.parentElement);
        trigger3DFireworks(model.parentElement);
        trigger3DGolText(model.parentElement);

        soundCelebration.play().catch(() => {
          console.log("Audio play blocked");
        });
      }
    });
  });

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

  const clearBtn = document.getElementById('clearUnlockedBtn');
  if (clearBtn) clearBtn.addEventListener('click', () => {
    localStorage.removeItem('walletUnlocked');
    updateUnlockedVisuals();
  });

  // --- NAVEGACIÓN ---
  function handleNavigation(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('screen--active'));
    const target = document.querySelector(`[data-screen="${screenId}"]`);
    if (target) target.classList.add('screen--active');

    const arSceneEl = document.getElementById('arScene');
    if (arSceneEl) {
      if (screenId === 's4') {
        arSceneEl.style.visibility = 'visible';
        arSceneEl.style.pointerEvents = 'auto';
      } else {
        arScene.style.display = 'none';
        document.body.classList.remove('ar-active');
        document.querySelectorAll('.mindar-ui-overlay, .mindar-ui-scanning, .mindar-ui-loading')
          .forEach(el => el.style.display = 'none');
        // NO llamar arSystem.stop() aquí
        if (arCheckInterval) { clearInterval(arCheckInterval); arCheckInterval = null; }
        if (qrScanInterval) { clearInterval(qrScanInterval); qrScanInterval = null; }
        startScanBtn.disabled = false;
        stopScanBtn.disabled = true;
        activeModel = null;
        activeTargetIndex = -1;
      }
    }

    if (screenId === 's5') {
      if (preguntasAleatorias.length === 0) reiniciarTrivia();
      else initTriviaEvents();
    }
    if (screenId === 's8') updateUnlockedVisuals();
  }

  // Listener global para todos los botones de navegación
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-nav]');
    if (btn) {
      const dest = btn.getAttribute('data-nav');
      handleNavigation(dest);
    }
  });
});