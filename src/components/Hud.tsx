import type { PlayerId } from "rune-sdk";

interface HudProps {
  playerIds: PlayerId[];
  yourPlayerId: PlayerId;
  points: { [playerId: PlayerId]: number };
}

const Hud: React.FC<HudProps> = ({ playerIds, yourPlayerId, points }) => {
  return (
    <header className="absolute top-0 left-0 text-sm flex justify-between w-full">
      <span>
        Your score: {points[playerIds.find((id) => id === yourPlayerId)!]}
      </span>
      <span>
        Opponent's score: {points[playerIds.find((id) => id !== yourPlayerId)!]}
      </span>
    </header>
  );
};

export default Hud;
