document.addEventListener('DOMContentLoaded', () => {

    // Definición de constantes y variables
    const startBtn = document.querySelector('button');
    const grid = document.querySelector('.grid');
    const scoreDisplay = document.querySelector('.score-display');
    const linesDisplay = document.querySelector('.lines-display');
    const currentSquares = document.querySelectorAll('.grid div');
    const displaySquares = document.querySelectorAll('.previous-grid div'); 
    const width = 10;
    const displayWidth = 4;
    const displayIndex = 0;

    let timerID;
    let currentPosition = 4;
    let currentIndex = 0;
    let nextRandom = 0;
    let score = 0;
    let lines = 0;
    let squares = Array.from(grid.querySelectorAll('div'));


    /**********************
    **    MODEL LOGIC    **
    ***********************/
    // Los tetrominos
    const lTetromino = [
        [1, width+1, width*2+1, 2],
        [width, width+1, width+2, width*2+2],
        [1, width+1, width*2+1, width*2],
        [width, width*2, width*2+1, width*2+2]
    ];

    const jTetromino = [
        [0, 1, width+1, width*2+1],
        [width+2, width*2, width*2+1, width*2+2],
        [1, width+1, width*2+1, width*2+2],
        [width, width+1, width+2, width*2]
    ];

    const zTetromino = [
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1],
        [0, width, width+1, width*2+1],
        [width+1, width+2, width*2, width*2+1]
    ];

    const sTetromino = [
        [1, width+1, width, width*2],
        [width, width+1, width*2+1, width*2+2],
        [1, width+1, width, width*2],
        [width, width+1, width*2+1, width*2+2]
    ];

    const tTetromino = [
        [1, width, width+1, width+2],
        [1, width+1, width+2, width*2+1],
        [width, width+1, width+2, width*2+1],
        [1, width, width+1, width*2+1]
    ];

    const oTetromino = [
        [1, 2, width+1, width+2],
        [1, 2, width+1, width+2],
        [1, 2, width+1, width+2],
        [1, 2, width+1, width+2]
    ];

    const iTetromino = [
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3],
        [1, width+1, width*2+1, width*3+1],
        [width, width+1, width+2, width+3]
    ];

    // Almacenamos todos los tetrominos en un vector para lanzarlos aleatoriamente llamando a este
    const Tetrominos = [lTetromino, jTetromino, zTetromino, sTetromino, tTetromino, oTetromino, iTetromino];

    // Selección aleatoria del tetrominó
    let random = Math.floor(Math.random()*Tetrominos.length); // Math.floor era para eliminar la parte decimal de Math.random
    let currentRotation = 0;
    let current = Tetrominos[random][currentRotation];

    // Vector que almacena los tetrominos para mostrar el siguiente tetrominó que aparecerá en juego
    const nextTetromino = [
        [1, displayWidth+1, displayWidth*2+1, 2], // L Tetrominó
        [0, 1, displayWidth+1, displayWidth*2+1], // j Tetrominó
        [0, displayWidth, displayWidth+1, displayWidth*2+1], // z Tetrominó
        [1, displayWidth+1, displayWidth, displayWidth*2], // s Tetrominó
        [1, displayWidth, displayWidth+1, displayWidth+2], // T Tetrominó
        [1, 2, displayWidth+1, displayWidth+2], // o Tetrominó
        [1, displayWidth+1, displayWidth*2+1, displayWidth*3+1] // i Tetrominó
    ];

    // Mover el tetromimó actual hacia abajo
    function moveDown() {
        undraw();
        currentPosition += width;
        draw();
        freeze();
    };
    
    // Mover a la derecha y evitar colisiones con otros objetos hacia la der.
    function moveRight() {
        undraw();
        const isAtRightEdge = current.some(index => (currentPosition + index) % width === width - 1);
        if (!isAtRightEdge) currentPosition++;
        if (current.some(index => squares[currentPosition + index].classList.contains('block2'))) {
            currentPosition--;
        }
        draw();
    };

    // Mover a la izquierda y evitar colisiones con otros objetos hacia la izq.
    function moveLeft() {
        undraw();
        const isAtLeftEdge = current.some(index => (currentPosition + index) % width === 0);
        if (!isAtLeftEdge) currentPosition--;
        if (current.some(index => squares[currentPosition + index].classList.contains('block2'))) {
            currentPosition++;
        }
        draw();
    };

    // Rotar tetrominó actual
    function rotate() {
        undraw();
        currentRotation++;
        if (currentRotation === current.length) currentRotation = 0;
        current = Tetrominos[random][currentRotation];

        // Corregir el bug de romper el tetrominó al rotar en las paredes
        if (currentPosition === -1) {
            currentPosition++;
        } else if (currentPosition % width === 9) {
            currentPosition++;
        } else if (currentPosition % width === 8) {
            currentPosition--;

            // Esto corrige el I Tetrominó, ya que es muy largo horizontalmente
            let flag = 0;
            current.forEach(index => flag += index);
            if (flag === 46) {
                currentPosition--;
            }
        }
        draw();
    };

    // Bloquear tetrominó actual
    function freeze() {
        if (current.some(index => squares[currentPosition + index + width].classList.contains('block3') || squares[currentPosition + index + width].classList.contains('block2'))) {
            current.forEach(index => squares[index + currentPosition].classList.add('block2'));

            random = nextRandom;
            nextRandom = Math.floor(Math.random()*Tetrominos.length);
            current = Tetrominos[random][currentRotation];
            currentPosition = 4;
            draw();
            displayNextTetromino();
            gameOver();
            addScore();
        }
    };

    // Añadir puntuación al marcador
    function addScore() {
        for (currentIndex = 0; currentIndex < 199; currentIndex += width) {
            const row = [currentIndex, currentIndex+1, currentIndex+2, currentIndex+3, currentIndex+4, currentIndex+5, currentIndex+6, currentIndex+7, currentIndex+8, currentIndex+9];

            if (row.every(index => squares[index].classList.contains('block2'))) {
                score += 100;
                lines += 1;
                scoreDisplay.innerHTML = score;
                linesDisplay.innerHTML = lines;
                row.forEach(index => {
                    squares[index].classList.remove('block2') || squares[index].classList.remove('block');
                });

                // Eliminamos la/s fila/s que están concatenadas viendolo en el vector con splice()
                const squaresRemoved = squares.splice(currentIndex, width);
                squares = squaresRemoved.concat(squares);
                squares.forEach(cell => grid.appendChild(cell));
                
                // Reducimos el tiempo de bajada dependiendo del número de filas eliminadas. 100 líneas es la máxima velocidad a medio segundo
                if (lines < 100) {
                    clearInterval(timerID);
                    timerID = setInterval(moveDown, 1500-(lines*10));
                }
            }
        }
    };

    function gameOver() {
        if (current.some(index => squares[currentPosition + index].classList.contains('block2'))) {
            displaySquares.forEach( square => {
                square.classList.remove('block');
            });
            currentSquares.forEach( square => {
                square.classList.remove('block');
            });
            document.getElementById('heading-2').innerHTML = "Game Over";
            clearInterval(timerID);
        }
    };

    /*********************
    **    VIEW LOGIC    **
    **********************/
    // Dibujar tetrominó actual
    function draw() {
        current.forEach( index => (squares[currentPosition + index].classList.add('block')));    
    };

    // Borrar tetrominó actual
    function undraw() {
        current.forEach( index => (squares[currentPosition + index].classList.remove('block')));
    };

    function displayNextTetromino() {
        displaySquares.forEach( square => {
            square.classList.remove('block');
        });

        nextTetromino[nextRandom].forEach(index => {
            displaySquares[displayIndex + index].classList.add('block');
        });
    };


    /***********************
    **  CONTROLLER LOGIC  **
    ************************/
    // Keycodes del teclado. Definien los controles de juego.
    document.addEventListener('keydown', function(event) {
        if (event.keyCode === 39 || event.wich === 39) { // Tecla derecha del teclado
            moveRight();
        } else if (event.keyCode === 38 || event.wich === 38) { // Tecla hacia arriba
            rotate();
        } else if (event.keyCode === 37 || event.wich === 37) { // Tecla izquierda del teclado
            moveLeft();
        } else if (event.keyCode === 40 || event.wich === 40) { // Tecla hacia abajo
            moveDown();
        } else if (event.keyCOde === 32 ||event.wich === 32) { // Barra espaciadora
            preventDefault(); // Evitamos que, al  pulsar el botón, reinicie el juego por el focus a 'New Game'
        }
    });

    startBtn.addEventListener('click', () => {
        document.getElementById('heading-2').style.display = "block";
        
        // Este condicional detecta si hay una partida en curso para inicializar todo a 0 y volver a empezar
        if (timerID) {
            let newGame = confirm("You are goint to start a new game and your progress will be lost. Are you sure?");
            if (newGame) {
                undraw();
                clearInterval(timerID);
                timerID = setInterval(moveDown, 1500);
                currentPosition = 4;
                currentRotation = 0;
                currentIndex = 0;
                random = Math.floor(Math.random()*Tetrominos.length);
                nextRandom = Math.floor(Math.random()*Tetrominos.length);
                current = Tetrominos[random][currentRotation];
                score = 0;
                lines = 0;
                scoreDisplay.innerHTML = "0";
                linesDisplay.innerHTML = "0";
                document.getElementById('heading-2').innerHTML = "Next shape:";
                currentSquares.forEach( square => {
                    square.classList.remove('block');
                    square.classList.remove('block2');
                });
            }
        } else {
            timerID = setInterval(moveDown, 1500);
        }
        draw();
        displayNextTetromino();
    });


        
});
