import { GameState } from "../logic";
import RockIcon from "../assets/rock.svg?react";
import ScissorsIcon from "../assets/scissors.svg?react";
import PaperIcon from "../assets/paper.svg?react";
import NullifyIcon from "../assets/cancel.svg?react";
import BombIcon from "../assets/dynamite.svg?react";

interface CardProps {
  card: Card;
  game?: GameState;
  setMyThrown?: (card: Card | null) => void;
}

export const Card: React.FC<CardProps> = ({ card, game, setMyThrown }) => {
  const handleClick = () => {
    if (!game || game.gamePhase !== "throw") return;
    Rune.actions.cardThrow({
      card,
    });
    setMyThrown ? setMyThrown(card) : null;
  };

  const iconMap: { [key in CardProps["card"]]: JSX.Element } = {
    rock: <RockIcon className="text-green-600" />,
    paper: <PaperIcon className="text-blue-400" />,
    scissors: <ScissorsIcon className="text-red-400" />,
    nullify: <NullifyIcon className="text-gray-800" />,
    bomb: <BombIcon className="text-gray-800" />,
  };

  return (
    <div
      onClick={game ? handleClick : undefined}
      className="w-20 h-25 border-1 border-black rounded-lg shadow-lg bg-white flex flex-col justify-center items-center overflow-hidden p-1"
    >
      <div
        className={`relative w-full h-full rounded-lg ${card === "nullify" || card === "bomb" ? "circular-gradient" : "bg-black"} flex justify-center items-center`}
      >
        <div
          className={`absolute bg-white transform flex justify-center items-center ${card === "nullify" || card === "bomb" ? "rounded-4xl size-11/12" : "rounded-3xl -skew-x-16 size-[105%]"}`}
        />
        <div className="z-10 h-full w-full p-2 flex justify-center items-center bg-transparent">
          {iconMap[card] || null}
        </div>
      </div>
    </div>
  );
};
