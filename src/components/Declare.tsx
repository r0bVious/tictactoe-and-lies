import { GameState } from "../logic";
import RockIcon from "../assets/rock.svg?react";
import ScissorsIcon from "../assets/scissors.svg?react";
import PaperIcon from "../assets/paper.svg?react";

interface DeclareProps {
  game: GameState;
}

const deceiverPrompts = [
  "What'll you tell them this time?",
  "Will they believe you?",
  "What's your next (supposed) move?",
  "...deception or truth?",
  "What's your story this time?",
  "Can you bluff your way through?",
  "Can you throw them off?",
  "How will you play it cool?",
  "They're onto you...",
  "What will you claim to have?",
  "Think fast — what now?",
  "What do they want to hear?",
  "Can you fake it again?",
  "What's the distraction?",
  "Will they buy it?",
];

const Declare: React.FC<DeclareProps> = ({ game }) => {
  const handleClick = (declaration: Card) => {
    if (game.deceiverDeclare !== null || game.gamePhase !== "declare") return;

    if (game.deceiverId === null) {
      console.error("Deceiver ID is null. Cannot declare.");
      return;
    }

    Rune.actions.deceiverDeclare({
      declaration,
    });
  };

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * deceiverPrompts.length);
    return deceiverPrompts[randomIndex];
  };

  const buttonStyles =
    "flex items-center justify-center h-18 w-18 bg-black/75 rounded-md border-1 border-white";

  return (
    <div className="absolute inset-0 w-full h-full bg-gradient-to-b to-black/95 from-transparent text-center mx-auto flex flex-col items-center z-100 pt-2">
      <p>Declare your intention:</p>
      <h1 className="font-mono text-xs mb-2">({getRandomPrompt()})</h1>
      <div className="flex justify-between w-full h-full px-2 overflow-hidden">
        <button
          className={buttonStyles}
          onClick={() => handleClick("rock")}
          disabled={game.gamePhase !== "declare"}
        >
          <RockIcon className="text-green-600 h-full w-full" />
        </button>
        <button
          className={buttonStyles}
          onClick={() => handleClick("paper")}
          disabled={game.gamePhase !== "declare"}
        >
          <PaperIcon className="text-blue-400 h-full w-full" />
        </button>
        <button
          className={buttonStyles}
          onClick={() => handleClick("scissors")}
          disabled={game.gamePhase !== "declare"}
        >
          <ScissorsIcon className="text-red-400 h-full w-full" />
        </button>
      </div>
    </div>
  );
};

export default Declare;
