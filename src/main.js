/* eslint-disable no-undef */
import { Application, Container, Graphics, Text } from "pixi.js";
import { gameConfig } from "./gameConfig.js";

(async () => {
  // Create a new application
  const app = new Application();
  globalThis.__PIXI_APP__ = app;

  // Initialize the application
  await app.init({ background: "#ffd883ff", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container").appendChild(app.canvas);

  //app dimensions
  let ratioX = window.innerWidth / app.screen.width;
  let ratioY = window.innerHeight / app.screen.height;
  let ratio = Math.min(ratioX, ratioY);

  //game properties
  let multiplier = 1.0;
  let bet = 100;
  let result = "";
  let crashPoint = Math.random() * 3 + 1.5; //random crashPoint vetween 1.5 to 4.5
  let gameState = "IDLE"; // IDLE, RUNNING, ENDED
  let gameStatus = "Status: " + gameState;
  const startGame = "START GAME";
  const cashOut = "CASH OUT";
  const reset = "RESET GAME";
  let playerResult = false;

  const startPoint = { x: 25, y: app.screen.height - 100 };
  let controlPoint = {
    x: Math.random() < 0.5 ? app.screen.width - 50 : app.screen.width + 50,
    y: Math.random() < 0.5 ? app.screen.height - 75 : app.screen.height - 25,
  };
  const endPoint = { x: app.screen.width - 25, y: 100 };

  let startGameText = new Text(startGame, gameConfig.textStyle);
  let cashOuttext = new Text(cashOut, gameConfig.textStyle);
  let resetGametext = new Text(reset, gameConfig.textStyle);
  let resultText = new Text(result, gameConfig.resultStyle);
  resultText.x = app.screen.width / 2 - resultText.width / 2;
  resultText.y = app.screen.height / 2 - resultText.height / 2;
  resultText.scale.set(0.5);
  resultText.anchor.set(0.5);
  resultText.alpha = 0;
  resultText.visible = false;

  //game stats top panel
  const topPanel = new Container();
  topPanel.x = 0;
  topPanel.y = 0;
  topPanel.width = app.screen.width;
  topPanel.height = 75;
  const topGraphics = new Graphics()
    .rect(0, 0, app.screen.width, 75)
    .fill("#ffa12dff");
  let multiplierText = new Text(
    "Multiplier: " + multiplier.toFixed(2) + "x",
    gameConfig.textStyle,
  );
  multiplierText.x = 10;
  multiplierText.y = 25;
  let betText = new Text("Bet: $" + bet.toFixed(2), gameConfig.textStyle);
  betText.x = app.screen.width / 2 - betText.width / 2 - 25;
  betText.y = 25;
  let betIncrease = new Graphics()
    .ellipse(betText.x + 140, betText.y + 10, 15, 15)
    .fill("#d0def5ff");
  betIncrease.interactive = true;
  let betIncreaseText = new Text("+", gameConfig.signStyle);
  betIncreaseText.x =
    app.screen.width / 2 - betIncrease.width / 2 + betText.width / 2 + 7.5;
  betIncreaseText.y = 20;
  let betDecrease = new Graphics()
    .ellipse(betText.x + 180, betText.y + 10, 15, 15)
    .fill("#d0def5ff");
  betDecrease.interactive = true;
  let betDecreaseText = new Text("-", gameConfig.signStyle);
  betDecreaseText.x =
    app.screen.width / 2 - betDecrease.width / 2 + betText.width / 2 + 52.5;
  betDecreaseText.y = 20;
  let gameStatusText = new Text(gameStatus, gameConfig.textStyle);
  gameStatusText.x = app.screen.width - gameStatusText.width - 50;
  gameStatusText.y = 25;

  //control bottom panel
  const bottomPanel = new Container();
  bottomPanel.x = 0;
  bottomPanel.y = app.screen.height - 75;
  bottomPanel.width = app.screen.width;
  bottomPanel.height = 75;
  const bottomGraphics = new Graphics()
    .rect(0, 0, app.screen.width, 75)
    .fill("#ffa12dff");
  const startGameButton = new Graphics()
    .roundRect(10, 25, 150, 25, 15)
    .fill("#7aff3cff");
  startGameText.x = 10 + (150 - startGameText.width) / 2;
  startGameText.y = 25 + (25 - startGameText.height) / 2;
  startGameButton.interactive = true;
  const cashOutButton = new Graphics()
    .roundRect(app.screen.width / 2 - 75, 25, 150, 25, 15)
    .fill("#7aff3cff");
  cashOuttext.x = app.screen.width / 2 - 75 + (150 - cashOuttext.width) / 2;
  cashOuttext.y = 25 + (25 - cashOuttext.height) / 2;
  cashOutButton.interactive = true;

  const resetGameButton = new Graphics()
    .roundRect(app.screen.width - 170, 25, 150, 25, 15)
    .fill("#7aff3cff");
  resetGametext.x = app.screen.width - 170 + (150 - resetGametext.width) / 2;
  resetGametext.y = 25 + (25 - resetGametext.height) / 2;
  resetGameButton.interactive = true;

  //game area Panel
  const gamePanel = new Container();
  gamePanel.x = 0;
  gamePanel.y = 0;
  gamePanel.width = app.screen.width;
  gamePanel.height = app.screen.height - 150;
  let playerBall = new Graphics().circle(0, 0, 10).fill("red");
  playerBall.x = startPoint.x;
  playerBall.y = startPoint.y;
  let animate = 0;
  const duration = 4000; // duration of the animation in milliseconds
  let playerTrail = new Graphics()
    .moveTo(playerBall.x, playerBall.y)
    .stroke({ width: 2, color: "#14e3f2ff" });

  //adding all header details to top panel
  topPanel.addChild(
    topGraphics,
    multiplierText,
    betText,
    betIncrease,
    betDecrease,
    gameStatusText,
    betIncreaseText,
    betDecreaseText,
  );
  // adding player to game area container
  gamePanel.addChild(playerTrail, playerBall, resultText);
  //adding all elements to bottom container
  bottomPanel.addChild(
    bottomGraphics,
    startGameButton,
    startGameText,
    cashOutButton,
    cashOuttext,
    resetGameButton,
    resetGametext,
  );

  //resizing all containers
  topPanel.scale.set(ratio);
  gamePanel.scale.set(ratio);
  bottomPanel.scale.set(ratio);

  //adding all containers to main app stage
  app.stage.addChild(topPanel, bottomPanel, gamePanel);

  //mouse button click controls
  betIncrease.on("pointerdown", () => {
    if (gameState === "IDLE") {
      bet += 50;
      betText.text = "Bet: $" + bet.toFixed(2);
    }
  });
  betDecrease.on("pointerdown", () => {
    if (gameState === "IDLE") {
      bet -= bet > 0 ? 50 : bet;
      betText.text = "Bet: $" + bet.toFixed(2);
    }
  });

  startGameButton.on("pointerdown", () => {
    if (gameState === "IDLE") {
      gameState = "RUNNING";
      gameStatus = "Status: " + gameState;
      gameStatusText.text = gameStatus;
      startGameButton.alpha = 0.5;
    }
  });

  cashOutButton.on("pointerdown", () => {
    if (gameState === "RUNNING") {
      gameState = "ENDED";
      gameStatus = "Status: " + gameState;
      playerResult = true;
      resultText.alpha = 1;
      resultText.visible = true;
      gameStatusText.text = gameStatus;
      cashOutButton.alpha = 0.5;
    }
  });
  resetGameButton.on("pointerdown", () => {
    if (gameState === "ENDED" || gameState === "RUNNING") {
      clearTimeout();
      gameState = "IDLE";
      gameStatus = "Status: " + gameState;
      gameStatusText.text = gameStatus;
      playerResult = false;
      resetGameButton.alpha = 0.5;
      startGameButton.alpha = 1.0;
      cashOutButton.alpha = 1.0;
      multiplier = 1.0;
      multiplierText.text = "Multiplier: " + multiplier.toFixed(2) + "x";
      bet = 100;
      betText.text = "Bet: $" + bet.toFixed(2);
      resultText.alpha = 0;
      resultText.visible = false;
      resultText.scale.set(0.5);
      playerBall.x = startPoint.x;
      playerBall.y = startPoint.y;
      playerTrail.clear();
      playerTrail.moveTo(playerBall.x, playerBall.y);
      controlPoint = {
        x: Math.random() < 0.5 ? app.screen.width - 50 : app.screen.width + 50,
        y:
          Math.random() < 0.5 ? app.screen.height - 75 : app.screen.height - 25,
      };
      animate = 0;
      crashPoint = Math.random() * 3 + 1.5; //random crashPoint vetween 1.5 to 4.5
      setTimeout(() => {
        resetGameButton.alpha = 1.0;
      }, 1000);
    }
  });

  //touch controls
  betIncrease.on("touchstart", () => {
    if (gameState === "IDLE") {
      bet += 50;
      betText.text = "Bet: $" + bet.toFixed(2);
    }
  });
  betDecrease.on("touchstart", () => {
    if (gameState === "IDLE") {
      bet -= bet > 0 ? 50 : bet;
      betText.text = "Bet: $" + bet.toFixed(2);
    }
  });

  startGameButton.on("touchstart", () => {
    if (gameState === "IDLE") {
      gameState = "RUNNING";
      gameStatus = "Status: " + gameState;
      gameStatusText.text = gameStatus;
      startGameButton.alpha = 0.5;
    }
  });

  cashOutButton.on("touchstart", () => {
    if (gameState === "RUNNING") {
      gameState = "ENDED";
      gameStatus = "Status: " + gameState;
      playerResult = true;
      resultText.alpha = 1;
      resultText.visible = true;
      gameStatusText.text = gameStatus;
      cashOutButton.alpha = 0.5;
    }
  });
  resetGameButton.on("touchstart", () => {
    if (gameState === "ENDED" || gameState === "RUNNING") {
      clearTimeout();
      gameState = "IDLE";
      gameStatus = "Status: " + gameState;
      gameStatusText.text = gameStatus;
      playerResult = false;
      resetGameButton.alpha = 0.5;
      startGameButton.alpha = 1.0;
      cashOutButton.alpha = 1.0;
      multiplier = 1.0;
      multiplierText.text = "Multiplier: " + multiplier.toFixed(2) + "x";
      bet = 100;
      betText.text = "Bet: $" + bet.toFixed(2);
      resultText.alpha = 0;
      resultText.visible = false;
      resultText.scale.set(0.5);
      playerBall.x = startPoint.x;
      playerBall.y = startPoint.y;
      playerTrail.clear();
      playerTrail.moveTo(playerBall.x, playerBall.y);
      controlPoint = {
        x: Math.random() < 0.5 ? app.screen.width - 50 : app.screen.width + 50,
        y:
          Math.random() < 0.5 ? app.screen.height - 75 : app.screen.height - 25,
      };
      animate = 0;
      crashPoint = Math.random() * 3 + 1.5; //random crashPoint vetween 1.5 to 4.5
      setTimeout(() => {
        resetGameButton.alpha = 1.0;
      }, 1000);
    }
  });

  // Listen for animate update
  app.ticker.add((time) => {
    if (gameState === "RUNNING") {
      multiplier += 0.05;
      multiplierText.text = "Multiplier: " + multiplier.toFixed(2) + "x";
      animate += (time.elapsedMS - time.deltaTime) / duration;

      // Reverse the animation direction for a smoother loop
      let progress = animate < 0.5 ? animate * 2 : animate * -2;

      // Calculate the current position using the quadratic Bezier formula
      // (1-p)^2 * P0 + 2*(1-p)*p * P1 + p^2 * P2
      let x =
        Math.pow(1 - progress, 2) * startPoint.x +
        2 * (1 - progress) * progress * controlPoint.x +
        Math.pow(progress, 2) * endPoint.x;

      let y =
        Math.pow(1 - progress, 2) * startPoint.y +
        2 * (1 - progress) * progress * controlPoint.y +
        Math.pow(progress, 2) * endPoint.y;

      if (
        (x <= endPoint.x && x >= startPoint.x) ||
        (y <= endPoint.y && y >= startPoint.y)
      ) {
        playerBall.position.set(x, y);
        playerTrail
          .quadraticCurveTo(x, y, playerBall.x - 2, playerBall.y - 2)
          .setStrokeStyle({
            width: 3,
            color: "#14e3f2ff",
            cap: "round",
            alpha: 1,
            join: "round",
          })
          .stroke();
      } else if (multiplier >= crashPoint) {
        x = 0;
        y = 0;
        progress = 0;
        gameState = "ENDED";
        gameStatus = "Status: " + gameState;
        gameStatusText.text = gameStatus;
        resultText.alpha = 1;
        resultText.visible = true;
      } else {
        gameState = "ENDED";
        gameStatus = "Status: " + gameState;
        gameStatusText.text = gameStatus;
        resultText.alpha = 1;
        resultText.visible = true;
      }
    }
    if (gameState === "ENDED") {
      if (playerResult) {
        result = "Player Won at: " + (bet * multiplier).toFixed(2) + "$";
        resultText.text = result;
        resultText.style.fill = "#04d700ff";
        if (resultText.scale.x < 1 && resultText.scale.y < 1) {
          resultText.scale.x += 0.01 * time.deltaTime;
          resultText.scale.y += 0.01 * time.deltaTime;
        }
      }
      if (!playerResult) {
        result = "Player crashed at: " + multiplier.toFixed(2) + "x";
        resultText.style.fill = "#de0000fe";
        resultText.text = result;
        if (resultText.scale.x < 1 && resultText.scale.y < 1) {
          resultText.scale.x += 0.01 * time.deltaTime;
          resultText.scale.y += 0.01 * time.deltaTime;
        }
      }
    }
  });

  window.addEventListener("resize", (e) => {
    ratioX = e.currentTarget.innerWidth / app.screen.width;
    ratioY = e.currentTarget.innerHeight / app.screen.height;
    ratio = Math.min(ratioX, ratioY);
    topPanel.scale.set(ratio);
    gamePanel.scale.set(ratio);
    bottomPanel.scale.set(ratio);
  });
})();
