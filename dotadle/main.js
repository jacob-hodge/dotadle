document.addEventListener("DOMContentLoaded", () => {

    
    createRepeatDiv("itemBlock", "itemSquare", 6);
    createRepeatDiv("heroBlock", "heroSquare", 6);
    const inputEl = document.querySelector("#hero-input");
    const guessButton = document.querySelector(".btn-guess");
    const nextButton = document.querySelector('.btn-next');
    const backButton = document.querySelector('.btn-back');
    let { gameNum, guessNum } = initialise();
    gameNum = Number(gameNum);
    guessNum = Number(guessNum);
    roundNum = Math.min(guessNum,6);
    gameOver = false;
    let matchDataArr = getMatchData();
    onRoundChange(guessNum);
    winLossCheck();
    //addInfo();
    addRank();
    initHelpModal();
    initStatsModal();

    inputEl.addEventListener("input", onInputChange);
    guessButton.addEventListener("click", onGuess);
    nextButton.addEventListener("click", onNext);
    backButton.addEventListener("click", onBack);



    heroesDict = {
        1: "Anti-Mage", 2: "Axe", 3: "Bane", 4: "Bloodseeker", 5: "Crystal Maiden", 6: "Drow Ranger", 7: "Earthshaker",
        8: "Juggernaut", 9: "Mirana", 10: "Morphling", 11: "Shadow Fiend", 12: "Phantom Lancer", 13: "Puck", 14: "Pudge",
        15: "Razor", 16: "Sand King", 17: "Storm Spirit", 18: "Sven", 19: "Tiny", 20: "Vengeful Spirit", 21: "Windranger",
        22: "Zeus", 23: "Kunkka", 25: "Lina", 26: "Lion", 27: "Shadow Shaman", 28: "Slardar", 29: "Tidehunter",
        30: "Witch Doctor", 31: "Lich", 32: "Riki", 33: "Enigma", 34: "Tinker", 35: "Sniper", 36: "Necrophos",
        37: "Warlock", 38: "Beastmaster", 39: "Queen of Pain", 40: "Venomancer", 41: "Faceless Void", 42: "Wraith King", 43: "Death Prophet",
        44: "Phantom Assassin", 45: "Pugna", 46: "Templar Assassin", 47: "Viper", 48: "Luna", 49: "Dragon Knight", 50: "Dazzle",
        51: "Clockwerk", 52: "Leshrac", 53: "Nature's Prophet", 54: "Lifestealer", 55: "Dark Seer", 56: "Clinkz", 57: "Omniknight",
        58: "Enchantress", 59: "Huskar", 60: "Night Stalker", 61: "Broodmother", 62: "Bounty Hunter", 63: "Weaver", 64: "Jakiro",
        65: "Batrider", 66: "Chen", 67: "Spectre", 68: "Ancient Apparition", 69: "Doom", 70: "Ursa", 71: "Spirit Breaker",
        72: "Gyrocopter", 73: "Alchemist", 74: "Invoker", 75: "Silencer", 76: "Outworld Destroyer", 77: "Lycan", 78: "Brewmaster",
        79: "Shadow Demon", 80: "Lone Druid", 81: "Chaos Knight", 82: "Meepo", 83: "Treant Protector", 84: "Ogre Magi", 85: "Undying",
        86: "Rubick", 87: "Disruptor", 88: "Nyx Assassin", 89: "Naga Siren", 90: "Keeper of the Light", 91: "Io", 92: "Visage",
        93: "Slark", 94: "Medusa", 95: "Troll Warlord", 96: "Centaur Warrunner", 97: "Magnus", 98: "Timbersaw", 99: "Bristleback",
        100: "Tusk", 101: "Skywrath Mage", 102: "Abaddon", 103: "Elder Titan", 104: "Legion Commander", 105: "Techies", 106: "Ember Spirit",
        107: "Earth Spirit", 108: "Underlord", 109: "Terrorblade", 110: "Phoenix", 111: "Oracle", 112: "Winter Wyvern", 113: "Arc Warden",
        114: "Monkey King", 119: "Dark Willow", 120: "Pangolier", 121: "Grimstroke", 123: "Hoodwink", 126: "Void Spirit", 128: "Snapfire",
        129: "Mars", 135: "Dawnbreaker", 136: "Marci", 137: "Primal Beast", 138: "Muerta"
    };

    function initialise() {

        const numGames = window.localStorage.getItem('numGames')
        if (!numGames) {
            window.localStorage.setItem('numGames', '0')
            window.localStorage.setItem('numStreak', '0')
            window.localStorage.setItem('numWins', '0')
        }

        const lastGameNum = window.localStorage.getItem('gameNum')
        if (!lastGameNum) {
            window.localStorage.setItem('gameNum', String(getGameNum()))
            window.localStorage.setItem('guessNum', String(1))
        }

        let gameNum = getGameNum();
        if (lastGameNum === String(gameNum)) {
            let lastGuessNum = window.localStorage.getItem('guessNum')

            for (let i = 1; i < lastGuessNum; i++) {
                let hero = window.localStorage.getItem('hero' + String(i));
                let square = document.getElementById("heroSquare" + (i));
                square.textContent = hero;
            }
            return {gameNum: lastGameNum, guessNum: lastGuessNum};

        } else {
            return {gameNum: getGameNum(), guessNum: 1,}
        }
    }


    function winLossCheck() {
        if (window.localStorage.getItem('winLoss') === 'win' + String(gameNum)) {
            onWin();
        } else if (window.localStorage.getItem('winLoss') === 'loss' + String(gameNum)) {
            onLoss();
        } else {
            return;
        }
    }


    function getGameNum() {
        startDate = new Date('10/21/2023')
        today = new Date();
        return Math.ceil((today - startDate)/(1000 * 3600 * 24));
    };



    function preserveGameState() {
        let square = document.getElementById("heroSquare" + (guessNum - 1));
        window.localStorage.setItem('hero' + String(guessNum - 1), square.textContent);
        window.localStorage.setItem('guessNum', String(guessNum));
        window.localStorage.setItem('gameNum', String(gameNum));
    };




    async function getMatchData() {
        const matchData = await fetch("dotadle/kruggledata.json");
        const matchDataArr = await matchData.json();

        const matchIds = matchDataArr.map(dataPoint => dataPoint.matchId);
        const heroIds = matchDataArr.map(dataPoint => dataPoint.heroId);
        const radiantWins = matchDataArr.map(dataPoint => dataPoint.radiantWin);
        const startDates = matchDataArr.map(dataPoint => dataPoint.startDateTime);
        const steamIds = matchDataArr.map(dataPoint => dataPoint.steamId);
        const kills = matchDataArr.map(dataPoint => dataPoint.kills);
        const deaths = matchDataArr.map(dataPoint => dataPoint.deaths);
        const assists = matchDataArr.map(dataPoint => dataPoint.assists);
        const numLastHits = matchDataArr.map(dataPoint => dataPoint.numLastHits);
        const numDenies = matchDataArr.map(dataPoint => dataPoint.numDenies);
        const isVictorys = matchDataArr.map(dataPoint => dataPoint.isVictory);
        const itemTimes = matchDataArr.map(dataPoint => dataPoint.itemTime);
        const item1s = matchDataArr.map(dataPoint => dataPoint.item1);
        const item2s = matchDataArr.map(dataPoint => dataPoint.item2);
        const item3s = matchDataArr.map(dataPoint => dataPoint.item3);
        const item4s = matchDataArr.map(dataPoint => dataPoint.item4);
        const item5s = matchDataArr.map(dataPoint => dataPoint.item5);
        const item6s = matchDataArr.map(dataPoint => dataPoint.item6);
        const shards = matchDataArr.map(dataPoint => dataPoint.shard);
        const scepters = matchDataArr.map(dataPoint => dataPoint.scepter);
        const ranks = matchDataArr.map(dataPoint => dataPoint.rank);

        const winningHeroId = heroIds[(gameNum - 1) * 6];
        const matchId = matchIds[(gameNum - 1) * 6];
        const steamId = steamIds[(gameNum - 1) * 6];
        const radiantWin = radiantWins[(gameNum - 1) * 6];
        const startDate = new Date(startDates[(gameNum - 1) * 6] * 1000);
        const isVictory = isVictorys[(gameNum - 1) * 6];
        const kill = kills[(gameNum - 1) * 6];
        const death = deaths[(gameNum - 1) * 6];
        const assist = assists[(gameNum - 1) * 6];
        const itemTime = itemTimes.slice((gameNum - 1) * 6 + 1, gameNum * 6);
        const item1 = item1s.slice((gameNum - 1) * 6, gameNum * 6);
        const item2 = item2s.slice((gameNum - 1) * 6, gameNum * 6);
        const item3 = item3s.slice((gameNum - 1) * 6, gameNum * 6);
        const item4 = item4s.slice((gameNum - 1) * 6, gameNum * 6);
        const item5 = item5s.slice((gameNum - 1) * 6, gameNum * 6);
        const item6 = item6s.slice((gameNum - 1) * 6, gameNum * 6);
        const shard = shards.slice((gameNum - 1) * 6, gameNum * 6);
        const scepter = scepters.slice((gameNum - 1) * 6, gameNum * 6);
        const rank = ranks[(gameNum - 1) * 6];

        let itemTimeMins = ['00'];
        let itemTimeSecs = ['00'];

        for (let i = 0; i < 5; i++) {
            let timeMins = Math.floor(itemTime[i] / 60);
            let timeSecs = itemTime[i] - timeMins * 60;
            if (timeMins < 10) {
                timeMins = '0' + timeMins;
            }

            if (timeSecs < 10) {
                timeSecs = '0' + timeSecs;
            }

            itemTimeMins[i + 1] = timeMins;
            itemTimeSecs[i + 1] = timeSecs;
        }



        currentGameStats = [winningHeroId, matchId, steamId, radiantWin, startDate, isVictory, kill,
            death, assist, itemTimeMins, itemTimeSecs, item1, item2, item3, item4, item5, item6, shard, scepter, rank];

        return currentGameStats;
    };


    function createRepeatDiv(pos, name, num) {
        const gameBoard = document.getElementById(pos);

        for (let i = 0; i < num; i++) {
            let square = document.createElement("div");
            square.classList.add(name);
            square.classList.add("animate__animated");
            square.setAttribute("id", name + (i + 1));
            gameBoard.appendChild(square);
        }
    };



    function addInfo() {
        const playerInfoDiv = document.getElementById("playerInfo");
        
        const hintMap = {
            219729465: "Hint: This is a Michael game.",
            291470626: "Hint: This is a KRUGG game.",
            109371288: "Hint: This is a Damon game.",
            1083191657: "Hint: This is a Todd game.",
            177393284: "Hint: This is a Will game.",
            169256850: "Hint: This is a Jacob game."
        };

        matchDataArr.then(result => {
            const steamId = result[2];
            const hint = hintMap[steamId];
            if (hint) {
                
                playerInfoDiv.innerHTML = hint;
                
            }
        });
    };



    function addRank() {

        matchDataArr.then(result => {
            const rank = result[19];
            const rankBracket = String(rank)[0];
            const rankLevel = String(rank)[1];
            const rankBlock = document.getElementById("rankBlock");
            const rankImg = document.getElementById("rankImage");

            if (rank) {
                rankImg.src = `img/ranks/SeasonalRank${rankBracket}-${rankLevel}.png`
            }
        });

    };



    function onInputChange() {
        removeAutocompleteDropdown();
        const value = inputEl.value.toLowerCase();
        let filteredNames = [];

        if (value.length === 0) return;

        Object.values(heroesDict).forEach((heroName) => {
            if (heroName.toLowerCase().startsWith(value))
                filteredNames.push(heroName);
        });

        filteredNames.sort();

        createAutocompleteDropdown(filteredNames.slice(0, 6));
    };




    function createAutocompleteDropdown(list) {
        const listEl = document.createElement("ul")
        listEl.className = "heroes-list";
        listEl.id = "heroes-list";

        list.forEach((hero) => {
            const listItem = document.createElement("li");

            const heroButton = document.createElement("button");
            heroButton.innerHTML = hero;
            heroButton.addEventListener("click", onHeroButtonClick);
            listItem.appendChild(heroButton);

            listEl.appendChild(listItem);
        });

        document.querySelector("#heroes-list-wrapper").appendChild(listEl);

    };



    function removeAutocompleteDropdown() {
        const listEl = document.querySelector("#heroes-list");
        if (listEl) listEl.remove();
    };



    function onHeroButtonClick(event) {
        event.preventDefault();

        const buttonEl = event.target;
        inputEl.value = buttonEl.innerHTML;

        removeAutocompleteDropdown();
    };


    function onNext(event) {
        event.preventDefault();
        if ((guessNum > roundNum || gameOver == true) && roundNum != 6) {
            roundNum += 1;
            onRoundChange(roundNum);
        }
        else {
            return
        }
    };

    function onBack(event) {
        event.preventDefault();
        if (roundNum != 1) {
            roundNum -= 1;
            onRoundChange(roundNum);
        }
        else {
            return
        }
    };

    function updateButtonColours() {
        if ((guessNum === roundNum && gameOver == false) || roundNum == 6) {
            nextButton.style.backgroundColor = "rgb(73, 73, 73)";
        } else {
            nextButton.style.backgroundColor = "rgb(110, 110, 110)";
        }

        if (roundNum === 1) {
            backButton.style.backgroundColor = "rgb(73, 73, 73)";
        } else {
            backButton.style.backgroundColor = "rgb(110, 110, 110)";
        }
    }


    function onGuess(event) {
        event.preventDefault();
        const guess = document.querySelector("#hero-input").value;
        const heroes = Object.values(heroesDict);
        if (heroes.includes(guess)) {
            updateHeroSquare(guess);
            matchDataArr.then(result => {
                const correctAnswer = heroesDict[result[0]];
                guessNum += 1;
                if (correctAnswer === guess) {
                    onWin();
                    window.localStorage.setItem("numWins", String(Number(window.localStorage.getItem("numWins")) + 1))
                    window.localStorage.setItem("numStreak", String(Number(window.localStorage.getItem("numStreak")) + 1))
                    window.localStorage.setItem("numGames", String(Number(window.localStorage.getItem("numGames")) + 1))
                } else if (guessNum > 6) {
                    onLoss();
                    window.localStorage.setItem("numStreak", "0")
                    window.localStorage.setItem("numGames", String(Number(window.localStorage.getItem("numGames")) + 1))
                } else {
                    document.getElementById("hero-input").value = "";
                }
                roundNum = Math.min(guessNum,6);
                onRoundChange(roundNum);
                preserveGameState();

            }).catch(error => {
                console.error(error);
                alert('Error Occured, Try Again')
            });
        } else {
            console.log("not a hero");
        }
    };



    function updateHeroSquare(guess) {
        let square = document.getElementById("heroSquare" + (guessNum));
        square.classList.add("animate__flipInX");
        square.textContent = guess;
    };




    function onRoundChange(num) {
        if (num > 6) {
            num = 6;
        }
        matchDataArr.then(result => {
            updateTimeBox(result, num);
            updateItemSquares(result, num);
            updateAghs(result, num);
            updateButtonColours();
        }).catch(error => {
            console.error(error);
            alert('Error Occured, Try Again')
        });
    };



    function updateTimeBox(result, currentRound) {
        const timeSecs = result[10];
        const timeSec = timeSecs[currentRound - 1];
        const timeMins = result[9];
        const timeMin = timeMins[currentRound - 1];
        const timeBox = document.getElementById("timeDisp");
        timeBox.textContent = timeMin + ":" + timeSec;
    };


    
    function updateItemSquares(result, currentRound) {
        for (let i = 0; i < 6; i++) {
            const itemIds = result[11 + i];
            const itemId = itemIds[currentRound - 1];
            const square = document.getElementById("itemSquare" + (1 + i));
            const img = document.createElement("img");
            img.setAttribute("id", "itemImage" + i);

            if (itemId !== null) {
                img.src = `img/itemimages/${itemId}.png`;
            } else {
                img.src = "img/itemimages/null.png";
            }
            square.innerHTML = "";
            square.appendChild(img);
        }
    };




    function updateAghs(result, currentRound) {
        const aghsBlock = document.getElementById("aghsBlock");
        const aghsImg = document.getElementById("aghsImage");
        const [shard, scepter] = [result[17][currentRound - 1], result[18][currentRound - 1]];
        const aghsImgSrc = `img/aghs/${shard ? (scepter ? 'Both' : 'Shard') : (scepter ? 'Scepter' : 'Default')}.png`;
        aghsImg.src = aghsImgSrc;
        aghsBlock.innerHTML = '';
        aghsBlock.appendChild(aghsImg);
      }



    function onWin() {
        document.getElementById("winlossInfo").textContent = "You Win!";
        window.localStorage.setItem('winLoss', 'win' + String(gameNum));
        gameOver = true;
        //removeElements();
        matchDataArr.then(result => {
            updateAfterGameInfo(result);
        }).catch(error => {
            console.error(error);
            alert('Error Occured, Try Again')
        });
    };



    function onLoss() {
        //removeElements();
        window.localStorage.setItem('winLoss', 'loss' + String(gameNum));
        gameOver = true;
        matchDataArr.then(result => {
            updateAfterGameInfo(result);
            updateLossInfoDiv(result);
        }).catch(error => {
            console.error(error);
            alert('Error Occured, Try Again')
        });
    };



    function removeElements() {
        const gameBoard = document.getElementById("gameboard");
        const form = document.getElementById("form");
        const playerInfo = document.getElementById("playerInfoBlock");
        gameBoard.removeChild(form);
        gameBoard.removeChild(playerInfo);
    };



    function updateAfterGameInfo(result) {
        const afterGameInfo = document.getElementById("afterGameInfo");
        const matchId = result[1];
        const dotaBuffLink = `<a href="https://www.dotabuff.com/matches/${matchId}">Dotabuff</a>`;
        const stratzLink = `<a href="https://www.stratz.com/matches/${matchId}">Stratz</a>`;
        afterGameInfo.innerHTML = `Game info: Kills: ${result[6]}, Deaths: ${result[7]}, Assists: ${result[8]}, ${dotaBuffLink}, ${stratzLink}`;
    };



    function updateLossInfoDiv(result) {
        const winlossInfoDiv = document.getElementById("winlossInfo");
        const hero = heroesDict[result[0]];
        winlossInfoDiv.textContent = `You Lose! The hero was: ${hero}`;
    };

    function initHelpModal() {
        
        const modal = document.getElementById("help-modal");
        const btn = document.getElementById("help");
        const span = document.getElementById("close-help");
        
        
        btn.addEventListener("click", function () {
            modal.style.display = "block";
        });

        
        span.addEventListener("click", function () {
            modal.style.display = "none";
        });

        
        window.addEventListener("click", function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }




    function updateStatsModal() {
        const currentStreak = window.localStorage.getItem("numStreak");
        const totalWins = window.localStorage.getItem("numWins");
        const totalGames = window.localStorage.getItem("numGames");
        console.log("stats modal updated")
        
        document.getElementById("total-played").textContent = totalGames;
        document.getElementById("total-wins").textContent = totalWins;
        document.getElementById("current-streak").textContent = currentStreak;

        const winPct = Math.round((totalWins / totalGames) * 100) || 0;
        document.getElementById("win-pct").textContent = winPct;
    }





    function initStatsModal() {

        
        const modal = document.getElementById("stats-modal");
        const btn = document.getElementById("stats");
        const span = document.getElementById("close-stats");
        

        
        btn.addEventListener("click", function () {
            updateStatsModal();
            modal.style.display = "block";
        });

        
        span.addEventListener("click", function () {
            modal.style.display = "none";
        });

        
        window.addEventListener("click", function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });

    }


});
