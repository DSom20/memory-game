//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//............Data Definitions...............//
/*
    A GameSettings object is of the format :
    {
        difficulty: "easy" | "medium" | "hard" | "impossible",
        cardType: "numbers" | "cats",
    }

*/


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//............ Global Variables..............//

let game = {  //game object
    difficulty: "",
    cardType: "",
    cardArray: null,
    maxCards : 0,
    totalMatches : 0,
    gridColumns: 0,
    currentMatches : 0,
    score : 0,
    previousCard : null,
    timeout : false,
    newHighScore : false,
};  
let gameSettings;  // Form submissions
let counter;  //counter dom element

const scrollTime = 1000; //ms
const menuContainer = document.querySelector("#menu-container");
const gameContainer = document.querySelector("#game-container");

const numberArray = [];
for(let i = 0; i < 100; i++){
    numberArray[i] = i;
}

const catArray = [];
for(let i = 0; i < 60; i++) {
    catArray[i] = `images/${i}.jpg`;
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//............ Menu Setup..............//

document.querySelector("form").addEventListener("submit", setupGame);

document.querySelector(".restart-button").addEventListener("click", restartGame);

document.querySelector(".quit-button").addEventListener("click", askToQuit);

displayMenuHighScore();



function displayMenuHighScore() {
    let highScoreElements = menuContainer.querySelectorAll(".high-score");
    for(let i = 0; i < highScoreElements.length; i++) {
        let highScore = localStorage.getItem(highScoreElements[i].id);
        if(highScore){
            highScoreElements[i].innerText = highScore;
        } else {
            highScoreElements[i].innerText = "None";
        }

    }
    // let highScore = localStorage.getItem('highScore');
    // let highScoreElements = document.querySelectorAll(".high-score");
    // for(let i = 0; i < highScoreElements.length; i++){
    //     highScoreElements[i].innerText = highScore;
    // }
}




//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//............ Game Setup .............//
function setupGame(e) {
    e.preventDefault();
    toggleHidden(gameContainer);
    toggleScrollToGame();
    setTimeout(() => toggleHidden(menuContainer), scrollTime);  //allow time to scroll to 
    setGameObject(e);
    resetGrid();
    placeCards();  //gameSettings.cardTypeArray
    displayGameHighScore();
}

function displayGameHighScore() {
    let para = gameContainer.querySelector(".high-score");
    let score = localStorage.getItem(`highScore-${game.difficulty}-${game.cardType}`);
    if(score) {
        para.innerText = `${game.difficulty}-${game.cardType} High Score: ${score}`;
    } else {
        para.innerText = `${game.difficulty}-${game.cardType} High Score: None`;
    }
    
}

function restartGame() {
    resetGameObject();
    resetGrid();
    placeCards();
}

function askToQuit() {
    let popupContainer = document.createElement("div");
    let popup = document.createElement("div");
    let text = document.createElement("p");
    let buttonContainer = document.createElement("div"); 
    let noButton = document.createElement("button");
    let yesButton = document.createElement("button");

    popupContainer.classList.add("popup-container");
    popup.classList.add("popup");
    buttonContainer.classList.add("popup-button-container");
    noButton.classList.add("primary-button");
    yesButton.classList.add("primary-button");

    text.innerText = "Return to the Main Menu?"
    noButton.innerText = "No";
    yesButton.innerText = "Yes";

    popupContainer.addEventListener("click", quitGameOrReturnToGame);

    // noButton.addEventListener("click", returnToGame);
    // yesButton.addEventListener("click", quitGame);

    popupContainer.appendChild(popup);
    popup.appendChild(text);
    popup.appendChild(buttonContainer);
    buttonContainer.appendChild(noButton);
    buttonContainer.appendChild(yesButton);

    gameContainer.appendChild(popupContainer);
}

function quitGameOrReturnToGame(e) {
    let popup = e.target.closest(".popup");
    let button = e.target.closest(".primary-button");
    if(button && button.innerText === "Yes") { //hit Yes button
        quitGame();
    } else if (popup && !button) {
        //Do nothing...hit the small popup menu itself
    } else {    //Hit No, or hit outside the popup menu
        returnToGame();
    }

}

function returnToGame() {
    let popupContainer = document.querySelector(".popup-container");
    popupContainer.remove();
}

function quitGame() {
    let popupContainer = document.querySelector(".popup-container");
    popupContainer.remove();
    toggleHidden(menuContainer);
    toggleScrollToGame();
    setTimeout(() => toggleHidden(gameContainer), scrollTime);
    setTimeout(() => uncheckInGameMenu(), scrollTime);
}

function uncheckInGameMenu() {
    let menuButton = document.querySelector("#menu-arrow");
    menuButton.checked = false;
}

function toggleHidden(element) {
    element.classList.toggle("hidden");
}

function toggleScrollToGame() {
    let body = document.querySelector("body");
    body.classList.toggle("scroll-to-game");
}

function resetGrid() {
    let grid = document.querySelector(".card-grid");
    if(grid) grid.remove();

    let gridContainer = document.querySelector(".grid-container");
    grid = document.createElement("div");
    grid.classList.add("card-grid");
    grid.classList.add(game.difficulty);
    gridContainer.appendChild(grid);
}

// Submit-event -> Undefined
// Given form submission event, reset game object and include appropriate maxCards, totalMatches, gridColumns according to submitted difficulty
function setGameObject(e) {
    let gameSettings = getGameSettings(e);
    game.cardType = gameSettings.cardType;
    game.difficulty = gameSettings.difficulty;
    game.cardArray = getCardArray(gameSettings.cardType);
    game.maxCards = getMaxCards(gameSettings.difficulty);
    game.totalMatches = game.maxCards / 2;
    game.gridColumns = getGridColumns(gameSettings.difficulty);
    resetGameObject();
}

// Undefined -> Undefined
// Reset everything on game object to 0/false/null that doesn't change with inital form settings
function resetGameObject() {
    game.currentMatches = 0;
    game.score = 0;
    game.previousCard = null;
    game.timeout = false;
    game.newHighScore = false;
}

// Submit-event -> GameSettings-object
// Given form submission event, return gameSettings object
function getGameSettings(e) {
    let form = e.currentTarget;
    let data = new FormData(form);
    let gameSettings = {};
    gameSettings.difficulty = data.get("difficulty");
    gameSettings.cardType = data.get("card-type");  ///////////////////////??????????  card-type or cardType  ??
    return gameSettings;
}

// String -> Integer
// Given difficulty, return associated number of max cards to place on grid
function getMaxCards(difficulty) {
    switch (difficulty) {
        case 'easy' : return 8;
        case 'medium' : return 24;
        case 'hard' : return 48;
        case 'impossible' : return 80;
    }
}

function getCardArray(cardType) {
    switch (cardType) {
        case 'numbers' : return numberArray;
        case 'cats' : return catArray;
    }
}

// String -> Integer
// Given difficulty, return associated number of grid columns
function getGridColumns(difficulty){
    switch (difficulty) {
        case 'easy' : return 3;
        case 'medium' : return 5;
        case 'hard' : return 7;
        case 'impossible' : return 9;
    }
}



// Undefined -> Undefined
// Procedure: given maxCards, randomly choose item from prepArray and add it's src as image/card in game-grid area (also adding data-cardID)
function placeCards() {
    // let imageArrayCopy = [...allImageArray];
    let chosenCardArray = chooseCards();
    let finalCardArray = doubleCards(chosenCardArray);
    let shuffledFinalCardArray = shuffleCards(finalCardArray);
    let grid = document.querySelector(".card-grid");

    let middleCell = Math.floor(game.maxCards/2);
    let totalCells = game.maxCards + 1;
    
    for(let i = 0; i < totalCells; i++) {
        if(i === middleCell){
            grid.appendChild(createCounter());
        } else {
            // let nextCardObject = chosenCardArray.splice(randomNum(chosenCardArray.length),1)[0];
            // let nextCard = makeDOMCard(nextCardObject);
            let nextCard = i < middleCell ? makeDOMCard(shuffledFinalCardArray[i]) : makeDOMCard(shuffledFinalCardArray[i-1]);
            grid.appendChild(nextCard);
        }
    }
}

        //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        //..............PlaceCards Helper Functions.................//

        // Integer Array[Sources] -> Array[Card-objects]
        // Given maxUniqueCards and imageArray, randomly choose maxCards number of different items from imageArray, copy each, and store each original and copy as card-objects
        function chooseCards(maxUniqueCards, imageArray) {
            let chosenCardArray = shuffleCards(game.cardArray, game.totalMatches);
            return chosenCardArray;
        }

        // Array -> Array
        // Given array, return a new array with the two copies of the original array
        function doubleCards(cardArray) {
            return cardArray.concat(cardArray.slice())
        }

        // Array[strings] Integer -> Array[strings]
        // Given cardArray and dealAmount, shuffle the first dealAmount number of cards (such that they could be ANY of the cards in the cardArray).
        //   If dealAmount is undefined or > cardArray length, treat dealAmount as length and shuffle entire cardArray.
        //   Return dealAmount of cards from beginning of cardArray as new array
        function shuffleCards(cardArray, dealAmount) {
            if(dealAmount > cardArray.length || dealAmount === undefined) {
                dealAmount = cardArray.length;
            }
            for(let i = 0; i < dealAmount; i++) {
                let chosenIndex = randomNum(i,cardArray.length)
                let temp = cardArray[i];
                cardArray[i] = cardArray[chosenIndex];
                cardArray[chosenIndex] = temp;
            }
            return cardArray.slice(0,dealAmount);

        }

        // Card-content -> DOM-element
        // Given card-content, return a card DOM element
        function makeDOMCard(cardContent) {
            // Make card elements
            let scene = document.createElement("div");
            let card = document.createElement("div");
            let frontFace = document.createElement("div");
            let backFace;

            // Make back of card and give appropriate content
            if(game.cardType === "numbers") {
                backFace = document.createElement("div");
                backFace.innerText = cardContent;
            } else {
                backFace = document.createElement("img");
                backFace.src = cardContent;
            }



            // Assign each element its appropriate CSS class(es)
            scene.classList.add("scene");
            card.classList.add("card");
            frontFace.classList.add("card__face", "card__face--front");
            backFace.classList.add("card__face", "card__face--back")

            //Add click event listener to card
            card.addEventListener("click", cardClickHandler);

            //Give card srcID as data-* attribute
            card.dataset.cardId = cardContent;

            // Combine elements together
            scene.appendChild(card);
            card.appendChild(frontFace);
            card.appendChild(backFace);

            // Return card as a whole in its scene
            return scene;
        }

        // Undefined -> DOM-element
        // Return a div with ".counter" CSS class added
        function createCounter(){
            counter = document.createElement("div");
            counter.classList.add("counter");
            counter.classList.add("scene");
            counter.innerText = game.score;
            return counter;
        }

        //Integer Integer -> Integer
        //Given min and max, return a random integer between min (inclusive) and max (exclusive);
        function randomNum(min,max) {
            return Math.floor(Math.random() * (max - min) + min);
        }

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//...........Main Game Loop Functions..........//

// Click event on card -> Undefined
// Procedure: If game not paused and card is different than previous clicked card, flip card to see content and increase score and -->
//    Check if its the second click in a sequence:
//      Fail: remember this card for next click
//      Pass: handle card pair.    
function cardClickHandler(e) {
    let card = e.currentTarget;
    if(!game.timeout && card !== game.previousCard) {
        toggleCards(card);

        counter.innerText = (++game.score);

        if(game.previousCard === null){
            game.previousCard = card;
        } else {
            cardPairHandler(card);
            game.previousCard = null;
        }
    }

}

// Card-element --> Undefined
//Procedure: check if card matches previous card (and isn't itself previous card)
//  Pass: make cards unclickable, check if endGame 
//  Fail: pause game, flip cards back, unpause game.
function cardPairHandler(card) {

    // Change from data set ...
    if(card !== game.previousCard && card.dataset.cardId === game.previousCard.dataset.cardId) {
        card.removeEventListener("click", cardClickHandler);
        game.previousCard.removeEventListener("click", cardClickHandler);
        game.currentMatches++;
        checkEndGame();
    } else {
        game.timeout = true;
        setTimeout(toggleCards, 1500, card, game.previousCard);
        setTimeout(function() {
            game.timeout = false
        }, 2000);
    }
}

// Cards... -> Undefined
// Given 0 to indefinite number of DOM-cards, flip each card
function toggleCards(...args) {
    for(let i = 0; i < arguments.length; i++){
        args[i].classList.toggle("is-flipped");
    }
}


//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//..........End Game Related Functions.............//

function checkEndGame() {
    if(game.currentMatches === game.totalMatches){
        endGame();
    }
}

function endGame() {
    saveHighScore();
    displayEndScene(); //button to return to menu or play again...
}

function displayEndScene() {
    let counter = document.querySelector(".counter");
    counter.classList.add("endgameCounterDisplay");
}

function saveHighScore() {
    let oldHighScore = localStorage.getItem(`highScore-${game.difficulty}-${game.cardType}`);
    if(!oldHighScore || game.score < oldHighScore) {
        localStorage.setItem(`highScore-${game.difficulty}-${game.cardType}`, game.score);
        game.newHighScore = true;
        displayMenuHighScore();
        displayGameHighScore();
    }
}