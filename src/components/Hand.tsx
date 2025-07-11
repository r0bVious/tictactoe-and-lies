import { Card } from "./Card";
import { GameState } from "../logic";
import type { PlayerId } from "rune-sdk";

interface HandProps {
  cards: Card[];
  game: GameState;
  yourPlayerId: PlayerId;
  setMyThrown: (card: Card | null) => void;
}

const Hand: React.FC<HandProps> = ({
  cards,
  game,
  yourPlayerId,
  setMyThrown,
}) => {
  return (
    <div
      className={`size-full flex flex-wrap items-center justify-evenly transition-all transition-300 ${game.gamePhase === "declare" && game.deceiverId === yourPlayerId ? "transform translate-y-2/5" : null}`}
    >
      {cards.map((card, index) => (
        <Card key={index} card={card} game={game} setMyThrown={setMyThrown} />
      ))}
    </div>
  );
};

export default Hand;
