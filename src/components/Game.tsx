import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import {
  getLeaderboard,
  logAnalyticsEvent,
  postScore,
} from "../config/firebase";
import {
  generateCoordinates,
  getRandomArbitrary,
} from "../utils/generateCoordinates";
import {
  FacebookShareButton,
  RedditShareButton,
  TwitterShareButton,
} from "react-share";

const ITEMS = [
  "bear.png",
  //   "buffalo.png",
  //   "chick.png",
  "chicken.png",
  "cow.png",
  "crocodile.png",
  "dog.png",
  "duck.png",
  "elephant.png",
  "frog.png",
  "giraffe.png",
  "goat.png",
  "gorilla.png",
  // "hippo.png",
  //   "horse.png",
  //   "monkey.png",
  "moose.png",
  "narwhal.png",
  //   "owl.png",
  //   "panda.png",
  //   "parrot.png",
  "penguin.png",
  "pig.png",
  //   "rabbit.png",
  //   "rhino.png",
  //   "sloth.png",
  //   "snake.png",
  //   "walrus.png",
  //   "whale.png",
  //   "zebra.png",
];

const IMAGE_SIZE = 44;

function getShuffledArray(arr: string[]) {
  var shuffled = arr.slice(0),
    i = arr.length,
    temp,
    index;
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled;
}

export default function Game() {
  const [landingIndex] = React.useState(
    Math.floor(getRandomArbitrary(0, ITEMS.length))
  );
  const [howToPlayShowing, setHowToPlayShowing] = React.useState(false);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [gameOver, setGameOver] = React.useState(false);
  const [startTimeStamp, setStartTimeStamp] = React.useState(0);
  const [endTimeStamp, setEndTimeStamp] = React.useState(0);
  const [topLetters, setTopLetters] = React.useState<string[]>([]);
  const [remaining, setRemaining] = React.useState(2);
  const [topCoordinates, setTopCoordinates] = React.useState<
    { x: number; y: number }[]
  >([]);
  const [bottomLetters, setBottomLetters] = React.useState<string[]>([]);
  const [bottomCoordinates, setBottomCoordinates] = React.useState<
    { x: number; y: number }[]
  >([]);
  const [correctAnswer, setCorrectAnswer] = React.useState<string>();
  const [name, setName] = React.useState<string>(
    localStorage.getItem("name") ?? ""
  );
  const bestScoreStorage = localStorage.getItem("bestScore");
  const query = useQuery({
    queryKey: ["leaderboard"],
    queryFn: getLeaderboard,
  });

  const createBoard = () => {
    const randomIndex = Math.floor(Math.random() * ITEMS.length);
    const newCorreectLetter = ITEMS[randomIndex];
    const remainingLetters = ITEMS.filter((item) => item !== newCorreectLetter);

    const shuffledRemainingLetters = getShuffledArray(remainingLetters);
    const newTopLetters = getShuffledArray(
      shuffledRemainingLetters
        .slice(0, remainingLetters.length / 2)
        .concat([newCorreectLetter])
    );
    const newBottomLetters = getShuffledArray(
      shuffledRemainingLetters
        .slice(remainingLetters.length / 2)
        .concat([newCorreectLetter])
    );

    const topDiv = document.getElementById("Top")?.getBoundingClientRect();
    if (!topDiv) throw new Error("Top div not found: implementation error");
    const topContainer = {
      width: topDiv?.width - IMAGE_SIZE,
      height: topDiv?.height - IMAGE_SIZE,
    };
    setTopLetters(newTopLetters);
    setTopCoordinates(
      generateCoordinates(topContainer, newTopLetters.length, IMAGE_SIZE)
    );

    const bottomDiv = document
      .getElementById("Bottom")
      ?.getBoundingClientRect();
    if (!bottomDiv)
      throw new Error("Bottom div not found: implementation error");
    const bottomContainer = {
      width: bottomDiv?.width,
      height: bottomDiv?.height,
    };
    setBottomLetters(newBottomLetters);
    setBottomCoordinates(
      generateCoordinates(bottomContainer, newBottomLetters.length, IMAGE_SIZE)
    );
    setCorrectAnswer(newCorreectLetter);
  };

  const handleClickStart = () => {
    createBoard();
    setRemaining(2);
    setStartTimeStamp(Date.now());
    setIsPlaying(true);
    logAnalyticsEvent("level_start");
  };

  const handleClickPiece = (index: string) => {
    if (index === correctAnswer) {
      if (remaining <= 0) {
        const newEndTimestamp = Date.now();
        const newScore = newEndTimestamp - startTimeStamp;
        const bestScore = localStorage.getItem("bestScore");
        if (!bestScore) {
          localStorage.setItem("bestScore", newScore.toString());
        } else if (newScore < parseInt(bestScore)) {
          localStorage.setItem("bestScore", newScore.toString());
        }

        logAnalyticsEvent("level_end", {
          value: newScore,
          sucess: true,
          remaining,
        });
        setEndTimeStamp(newEndTimestamp);
        setIsPlaying(false);
        setGameOver(true);
      } else {
        createBoard();
        setRemaining((cur) => cur - 1);
      }
    }
  };

  const handleChangeName = (e: React.ChangeEvent<HTMLInputElement> | null) => {
    setName(e?.target.value as string);
  };

  const handleClickSubmitScore = () => {
    logAnalyticsEvent("post_score", {
      score: endTimeStamp - startTimeStamp,
      name: name.substring(0, 24),
    });
    localStorage.setItem("name", name.substring(0, 24));
    postScore(name.substring(0, 24), endTimeStamp - startTimeStamp);
    setGameOver(false);
  };

  const handleClickShare = () => {
    logAnalyticsEvent("share");
    navigator.share({
      url: "https://www.asillylittlegame.com",
      text: `I got ${endTimeStamp - startTimeStamp} ms. Can you beat my time?`,
    });
  };

  const handleClickHowToPlay = () => {
    logAnalyticsEvent("tutorial_begin");
    setHowToPlayShowing(true);
  };

  const handleClickCloseHowToPlay = () => {
    logAnalyticsEvent("tutorial_complete");
    setHowToPlayShowing(false);
  };

  const handleBeforeOnClick = (shareName: string) => {
    logAnalyticsEvent("share", { destination: shareName });
    logAnalyticsEvent("share_" + shareName);
  };

  return (
    <div className="Game">
      {howToPlayShowing ? (
        <div className="HowToPlay">
          <div className="HowToPlay-Inner">
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "1rem",
                width: "100%",
              }}
            >
              <button
                onClick={handleClickCloseHowToPlay}
                style={{ marginBottom: "1rem" }}
              >
                Close
              </button>
            </div>
            <img
              src={process.env.PUBLIC_URL + "/how-to.png"}
              className="HowToPlayImage"
              alt="How to play"
            />
          </div>
          <div className="Backdrop" />
        </div>
      ) : gameOver ? (
        <div className="GameOver">
          <div className="GameOver-Inner">
            <img
              src={process.env.PUBLIC_URL + "/images/" + correctAnswer}
              alt={ITEMS[landingIndex]}
              style={{
                height: 100,
                width: 100,
              }}
            />
            <h1>A Silly Little Game</h1>
            <h2>Submit your score to the Leaderboard</h2>
            <input
              placeholder="Your name..."
              type={"text"}
              value={name}
              onChange={handleChangeName}
            />
            <p>
              Your time: <b>{endTimeStamp - startTimeStamp} ms</b>
              <br />
              Your best time: <b>{bestScoreStorage} ms</b>
            </p>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-evenly",
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <button
                onClick={handleClickSubmitScore}
                disabled={name === ""}
                style={{
                  marginBottom: "1rem",
                  backgroundColor: name === "" ? "lightgray" : "#ffcc00",
                }}
              >
                Try again
              </button>
              <div>Challenge your friends on...</div>
              <FacebookShareButton
                quote="Can you beat my time? | A Silly Little Game"
                url="https://asillylittlegame.com"
                beforeOnClick={() => handleBeforeOnClick("facebook")}
              >
                <button
                  style={{
                    backgroundColor: "#1877F2",
                    color: "white",
                    marginRight: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  Facebook
                </button>
              </FacebookShareButton>

              <TwitterShareButton
                url="https://asillylittlegame.com"
                beforeOnClick={() => handleBeforeOnClick("twitter")}
              >
                <button
                  style={{
                    backgroundColor: "#1DA1F2",
                    color: "white",
                    marginBottom: "1rem",
                  }}
                >
                  Twitter
                </button>
              </TwitterShareButton>
              <RedditShareButton
                url="https://asillylittlegame.com"
                beforeOnClick={() => handleBeforeOnClick("reddit")}
              >
                <button
                  style={{
                    backgroundColor: "#FF5700",
                    color: "white",
                    marginBottom: "1rem",
                  }}
                >
                  Reddit
                </button>
              </RedditShareButton>

              {/* <button
                onClick={handleClickShare}
                style={{ marginBottom: "1rem" }}
              >
                Share
              </button> */}
            </div>
          </div>
          <div className="Backdrop" />
        </div>
      ) : !isPlaying ? (
        <div className="Instructions">
          <div className="Instructions-Inner">
            <img
              src={process.env.PUBLIC_URL + "/images/" + ITEMS[landingIndex]}
              alt={ITEMS[landingIndex]}
              style={{
                height: 100,
                width: 100,
              }}
            />
            <h1>A Silly Little Game</h1>
            <span>
              <b>Top Scores</b>
            </span>
            <ul>
              {query.data?.map((item, index) => (
                <li key={index}>
                  <b>{item.score} ms</b>: {item.name}
                </li>
              ))}
            </ul>
            <p>
              Choose the only image on the bottom that is also in the top.
              Fastest time wins!
              <br />
              {bestScoreStorage && (
                <span>
                  Your best time: <b>{bestScoreStorage} ms</b>
                </span>
              )}
            </p>
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-evenly",
              }}
            >
              <button
                onClick={handleClickHowToPlay}
                style={{
                  marginBottom: "1rem",
                  backgroundColor: "#ffcc00",
                }}
              >
                How to play
              </button>
              <button
                onClick={handleClickStart}
                style={{ marginBottom: "1rem" }}
              >
                Start
              </button>
            </div>
            <div>Challenge your friends on...</div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <FacebookShareButton
                quote="Can you beat my time? | A Silly Little Game"
                url="https://asillylittlegame.com"
                beforeOnClick={() => handleBeforeOnClick("facebook")}
              >
                <button
                  style={{
                    backgroundColor: "#1877F2",
                    color: "white",
                    marginRight: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  Facebook
                </button>
              </FacebookShareButton>

              <TwitterShareButton
                url="https://asillylittlegame.com"
                beforeOnClick={() => handleBeforeOnClick("twitter")}
              >
                <button
                  style={{
                    backgroundColor: "#1DA1F2",
                    color: "white",
                    marginRight: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  Twitter
                </button>
              </TwitterShareButton>
              <RedditShareButton
                url="https://asillylittlegame.com"
                beforeOnClick={() => handleBeforeOnClick("reddit")}
              >
                <button
                  style={{
                    backgroundColor: "#FF5700",
                    color: "white",
                    marginBottom: "1rem",
                  }}
                >
                  Reddit
                </button>
              </RedditShareButton>
            </div>
            <a href="https://www.kenney.nl/">
              Thanks to kenny.nl for the assets!
            </a>
          </div>
          <div className="Backdrop" />
        </div>
      ) : null}
      <div id="Top">
        {topLetters.map((item, index) => (
          <img
            src={process.env.PUBLIC_URL + "/images/" + item}
            key={item + "-top"}
            alt={item}
            style={{
              position: "absolute",
              height: IMAGE_SIZE,
              width: IMAGE_SIZE,
              top: topCoordinates[index].y,
              left: topCoordinates[index].x,
            }}
          />
        ))}
      </div>
      <div id="Bottom">
        {bottomLetters.map((item, index) => (
          <img
            src={process.env.PUBLIC_URL + "/images/" + item}
            key={item + "-bottom"}
            alt={item}
            style={{
              position: "absolute",
              height: IMAGE_SIZE,
              width: IMAGE_SIZE,
              textAlign: "center",
              top: bottomCoordinates[index].y,
              left: bottomCoordinates[index].x,
            }}
            onClick={() => handleClickPiece(item)}
          />
        ))}
      </div>
    </div>
  );
}
