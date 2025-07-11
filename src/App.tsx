import { useEffect, useState } from "react";
import { PlayerId } from "rune-sdk";
import selectSoundAudio from "./assets/select.wav";
import { GameState } from "./logic.ts";
import Hand from "./components/Hand.tsx";
import Declare from "./components/Declare.tsx";
import { Card } from "./components/Card.tsx";
import BubbleIcon from "./assets/thought-bubble.svg?react";
import RockIcon from "./assets/rock.svg?react";
import ScissorsIcon from "./assets/scissors.svg?react";
import PaperIcon from "./assets/paper.svg?react";
import Cardback from "./components/Cardback.tsx";
import HeoGeunNim from "./components/HeoGeunNim.tsx";

// this is from the setup, but you might want to use it!
const selectSound = new Audio(selectSoundAudio);

function App() {
  const [game, setGame] = useState<GameState>();
  const [yourPlayerId, setYourPlayerId] = useState<PlayerId | undefined>();
  const [oppThrown, setOppThrown] = useState<Card | null>(null);
  const [myThrown, setMyThrown] = useState<Card | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [roundWin, setRoundWin] = useState<string | null>(null);

  useEffect(() => {
    Rune.initClient({
      onChange: ({ game, action, yourPlayerId }) => {
        setGame(game);
        setYourPlayerId(yourPlayerId);
      },
    });
  }, []);

  useEffect(() => {
    if (!game || !yourPlayerId) return;

    const prevThrown = game.prevThrown || {};
    const playerIds = game.playerIds || [];
    const opponentId = playerIds.find((id) => id !== yourPlayerId);

    const myCard = prevThrown[yourPlayerId];
    const oppCard = opponentId ? prevThrown[opponentId] : undefined;

    setMyThrown(myCard);
    if (oppCard) setOppThrown(oppCard);

    if (myCard !== undefined && oppCard !== undefined) {
      setTimeout(() => {
        if (myCard === oppCard) {
          setRoundWin("Round Tie!");
        } else if (
          (myCard === "rock" && oppCard === "scissors") ||
          (myCard === "scissors" && oppCard === "paper") ||
          (myCard === "paper" && oppCard === "rock") ||
          (myCard === "nullify" && oppCard === "bomb") ||
          (myCard === "bomb" && oppCard !== "nullify")
        ) {
          setRoundWin("Round won!");
        } else {
          setRoundWin("Round lost!");
        }
      }, 2000);

      const timeout = setTimeout(() => {
        setRoundWin(null);
        setMyThrown(null);
        setOppThrown(null);
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [game, yourPlayerId]);
  useEffect(() => {
    if (!game || !yourPlayerId) return;

    const opponentId = game.playerIds.find((id) => id !== yourPlayerId);
    if (!opponentId || !game.thrownCards[opponentId]) return;

    const opponentCard = game.thrownCards[opponentId];
    setOppThrown(opponentCard);
  }, [game, yourPlayerId]);

  if (!game) {
    return null;
  }
  const blue = true;
  if (blue) {
    return <HeoGeunNim />;
  }

  const {
    playerPoints,
    deceiverId,
    deceiverDeclare,
    thrownCards,
    playerIds,
    prevThrown,
  } = game;
  const yourHand = yourPlayerId ? (game.playerHands?.[yourPlayerId] ?? []) : [];
  const opponentId =
    game && game.playerIds
      ? game.playerIds.find((id) => id !== yourPlayerId)
      : undefined;

  const isOppReady = () => {
    if (!thrownCards || !playerIds || !yourPlayerId) {
      console.log("Missing necessary gamestate value(s).");
      return null;
    }

    const opponentId = game.playerIds.find((id) => id !== yourPlayerId);
    if (!opponentId) {
      console.log("Opponent ID not found");
      return null;
    }

    const opponentHasThrown = Boolean(prevThrown[opponentId]);
    const youHaveThrown = Boolean(prevThrown[yourPlayerId]);

    return (
      <div className="relative flex justify-center items-center w-full h-full">
        <div
          className={`
            absolute transition-opacity duration-700 
            ${opponentHasThrown && !youHaveThrown ? "opacity-100" : "opacity-0"}
          `}
        >
          <Cardback />
        </div>
        <div
          className={`
            absolute transition-opacity duration-700 delay-300
            ${oppThrown && myThrown ? "opacity-100" : "opacity-0"}
          `}
        >
          <Card card={oppThrown} />
        </div>
      </div>
    );
  };

  const getThrownCard = () => {
    if (!myThrown) return null;
    return <Card card={myThrown} />;
  };

  const declareStyles = `max-h-12 max-w-12 bg-white p-2 rounded-t-2xl`;
  const deceiverDeclareMap: { [key: string]: JSX.Element } = {
    rock: <RockIcon className={`text-green-600 ${declareStyles}`} />,
    paper: <PaperIcon className={`text-blue-400 ${declareStyles}`} />,
    scissors: <ScissorsIcon className={`text-red-400 ${declareStyles}`} />,
  };

  const getDeceiverIcon = (declare: string): JSX.Element | null => {
    return deceiverDeclareMap[declare] || null;
  };

  return (
    <section className="relative max-h-screen h-screen flex flex-col justify-center items-center overflow-hidden">
      {/* opponent */}
      <div className="size-full flex justify-center items-center">
        {game.playerHands && playerIds
          ? (() => {
              const opponentId = playerIds.find((id) => id !== yourPlayerId);
              const numberOfCards = opponentId
                ? game.playerHands[opponentId]?.length || 0
                : 0;

              return Array.from({ length: numberOfCards }, (_, index) => (
                <Cardback key={index} />
              ));
            })()
          : null}
      </div>

      {/* Game Zone */}
      <div className="relative size-full flex justify-evenly text-center">
        <div className="size-full flex justify-center items-center p-2 relative bg-green-700">
          {myThrown ? getThrownCard() : <div>choose your card</div>}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 border-l-16 border-r-16 border-b-20 border-transparent border-b-pink-300" />
        </div>

        <div className="relative size-full flex flex-col justify-between items-center bg-blue-400">
          <div className="size-full flex flex-col justify-center items-center p-2 relative">
            <div>{isOppReady()}</div>
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 border-l-16 border-r-16 border-t-20 border-transparent border-t-pink-300" />
          </div>
        </div>

        {/* Game Zone - Deceiver Declare */}
        <div
          className={`absolute ${deceiverId !== yourPlayerId ? "-top-10" : "-bottom-5"} flex flex-col justify-center items-center`}
        >
          {deceiverDeclare ? null : (
            <div className="size-24 flex justify-center items-center">
              <div
                className={`relative h-full w-full flex justify-center items-center ${game.gamePhase === "declare" && deceiverId !== yourPlayerId ? "transform rotate-180" : null}`}
              >
                <BubbleIcon />
                <div className="absolute left-3 top-10">
                  <div className="absolute left-4 size-2 bg-black/85 rounded-full animate-bounce" />
                  <div
                    className="absolute left-8 size-2 bg-black/85 rounded-full animate-bounce"
                    style={{ animationDelay: "0.25s" }}
                  />
                  <div
                    className="absolute left-12 size-2 bg-black/85 rounded-full animate-bounce"
                    style={{ animationDelay: "0.5s" }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
        {deceiverDeclare ? (
          <div
            className={`z-10 absolute ${deceiverId !== yourPlayerId ? "-top-1" : "bottom-0"} shadow-lg flex justify-center border-black border-2 rounded-t-2xl ${yourPlayerId === deceiverId ? null : "tranform rotate-180"}`}
          >
            {getDeceiverIcon(deceiverDeclare)}
            <div
              className={`absolute -bottom-5 ${yourPlayerId === deceiverId ? null : "tranform rotate-180"}`}
            >
              <span className="transform text-red-500 font-mono font-bold text-sm whitespace-nowrap border-2 border-black bg-white p-1 rounded-sm">
                {deceiverId !== yourPlayerId
                  ? "Opponent declares:"
                  : "You declare:"}
              </span>
            </div>
          </div>
        ) : null}

        {/* {yourPlayerId && (
          <Hud
            points={playerPoints}
            playerIds={playerIds}
            yourPlayerId={yourPlayerId}
          />
        )} */}
      </div>

      {/* player zone */}
      <div className="size-full relative">
        <Hand
          cards={yourHand}
          game={game}
          yourPlayerId={yourPlayerId || ""}
          setMyThrown={setMyThrown}
        />
        {game.gamePhase === "declare" && deceiverId !== yourPlayerId ? (
          <div className="absolute top-1/2 -translate-y-1/2 w-full bg-black/75 text-center px-10 mx-auto z-100">
            The Deceiver is declaring their next card...
          </div>
        ) : null}

        {game.gamePhase === "declare" && deceiverId === yourPlayerId ? (
          <Declare game={game} />
        ) : null}
      </div>

      {roundWin !== null ? (
        <div className="absolute inset-0 h-screen w-full flex justify-center items-center bg-black/75 z-100">
          <h1 className="text-5xl font-ribeye text-green-200 text-center">
            {roundWin}
          </h1>
        </div>
      ) : null}

      {myThrown && oppThrown ? (
        <span className="absolute font-butcherman text-5xl text-red-500 animate-ping">
          VS
        </span>
      ) : null}
    </section>
  );
}
export default App;
