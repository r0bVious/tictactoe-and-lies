import type { PlayerId, RuneClient } from "rune-sdk";

declare global {
  const Rune: RuneClient<GameState, GameActions>;
}

export interface GameState {
  playerIds: PlayerId[];
  gamePhase: "setup" | "waiting" | "declare" | "throw" | "resolve" | "gameOver";
  deck: Card[] | null;
  discardPile: Card[];
  playerHands: { [playerId: PlayerId]: Card[] } | null;
  playerPoints: { [playerId: PlayerId]: number };
  deceiverId: string | null;
  deceiverDeclare: Card | null;
  thrownCards: { [playerId: PlayerId]: Card };
  prevThrown: { [playerId: PlayerId]: Card };
}

type GameActions = {
  deceiverDeclare: (params: { declaration: Card }) => void;
  cardThrow: (params: { card: Card }) => void;
};

//deck setup and draw
const starterDeck: Card[] = [
  ...Array(4).fill("rock"),
  ...Array(4).fill("paper"),
  ...Array(4).fill("scissors"),
  ...Array(3).fill("nullify"),
  ...Array(2).fill("bomb"),
];

const shuffleDeck = (deck: Card[]): Card[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const cardDraw = (game: GameState) => {
  if (!game.deck || !game.discardPile) return;

  game.playerHands = game.playerHands ?? {};

  const cardsToDeal = game.gamePhase === "setup" ? 3 : 1;
  const totalCardsNeeded = cardsToDeal * game.playerIds.length;

  if (game.deck.length < totalCardsNeeded && game.discardPile.length > 0) {
    const shuffledDiscard = shuffleDeck([...game.discardPile]);
    game.deck = [...shuffledDiscard, ...game.deck];
    game.discardPile = [];
  }

  game.playerIds.forEach((playerId) => {
    game.playerHands![playerId] = game.playerHands![playerId] ?? [];

    for (let i = 0; i < cardsToDeal; i++) {
      if (game.deck && game.deck.length > 0) {
        const card = game.deck.pop()!;
        game.playerHands![playerId].push(card);
      } else {
        console.warn(`Ran out of cards when dealing to ${playerId}`);
      }
    }
  });

  game.deceiverDeclare = null;
  game.gamePhase = "declare";
};

//win point threshold
const winPoints = 5;

//card logic
const resolveCards = (
  player1Card: Card,
  player2Card: Card
): "player1" | "player2" | "tie" => {
  //redo this logic for special cards later
  if (player1Card === "bomb" || player2Card === "bomb") {
    // Bomb wins against everything except nullify
    if (player1Card === "nullify" || player2Card === "nullify") {
      return "tie";
    }
    return player1Card === "bomb" ? "player1" : "player2";
  }

  // nullify cancels everything
  if (player1Card === "nullify" || player2Card === "nullify") {
    return "tie";
  }

  // standard RPS
  if (player1Card === player2Card) {
    return "tie";
  }

  if (
    (player1Card === "rock" && player2Card === "scissors") ||
    (player1Card === "paper" && player2Card === "rock") ||
    (player1Card === "scissors" && player2Card === "paper")
  ) {
    return "player1";
  }

  return "player2";
};

//alternate deceiver role
const switchDeceiver = (game: GameState) => {
  const currentPlayerId = game.deceiverId;
  const opposingPlayerId = game.playerIds.find((id) => id !== currentPlayerId);
  if (opposingPlayerId) {
    game.deceiverId = opposingPlayerId;
  }
};

Rune.initLogic({
  minPlayers: 2,
  maxPlayers: 2,
  setup: (allPlayerIds) => {
    const initialState = {
      playerIds: allPlayerIds,
      gamePhase: "setup" as const,
      deck: shuffleDeck(starterDeck),
      discardPile: [],
      playerHands: null,
      playerPoints: { [allPlayerIds[0]]: 0, [allPlayerIds[1]]: 0 },
      deceiverId: Math.random() < 0.5 ? allPlayerIds[0] : allPlayerIds[1],
      deceiverDeclare: null,
      thrownCards: {},
      prevThrown: {},
    };

    cardDraw(initialState);
    return initialState;
  },
  // THIS OBJECT IS AVAILABLE TO EACH ACTION:
  // { game: object, playerId: string, allPlayerIds: string[] }
  actions: {
    deceiverDeclare: ({ declaration }, { game, playerId }) => {
      if (game.gamePhase != "declare" || game.deceiverDeclare != null) {
        console.log("Cannot declare in phase:", game.gamePhase);
        return;
      }
      if (!game.deceiverId || playerId != game.deceiverId) {
        console.log(
          `Your playerId ${playerId} doest not match deceiverId ${game.deceiverId} or deceiverId does not exist.`
        );
        return;
      }
      if (game.deceiverDeclare !== null) {
        console.log("Already declared:", game.deceiverDeclare);
        return;
      }
      game.deceiverDeclare = declaration;
      game.gamePhase = "throw";
    },
    cardThrow: ({ card }, { game, playerId }) => {
      if (!card) return;
      if (game.gamePhase !== "throw") {
        console.log("Cannot throw card in phase:", game.gamePhase);
        return;
      }
      game.thrownCards = game.thrownCards ?? {};
      game.thrownCards[playerId] = card;
      game.prevThrown[playerId] = card;
      console.log("ThrownCards raw:", JSON.stringify(game.thrownCards));
      console.log("prevThrown raw:", JSON.stringify(game.prevThrown));

      if (game.playerHands) {
        const cardIndex = game.playerHands[playerId].findIndex(
          (handCard) => handCard === card
        );

        if (cardIndex !== -1) {
          const discardedCard = game.playerHands[playerId].splice(
            cardIndex,
            1
          )[0];
          if (!game.discardPile) {
            game.discardPile = [];
          }
          game.discardPile.push(discardedCard);
        }
      }

      if (Object.keys(game.thrownCards).length === 2) {
        const player1Id = game.playerIds[0];
        const player2Id = game.playerIds[1];
        const player1Card = game.thrownCards[player1Id];
        const player2Card = game.thrownCards[player2Id];

        const result = resolveCards(player1Card, player2Card);

        if (result !== "tie") {
          const winner = result === "player1" ? player1Id : player2Id;
          game.playerPoints[winner] += 1;

          if (game.playerPoints[winner] >= winPoints) {
            game.gamePhase = "gameOver";
            Rune.gameOver({
              players: {
                [winner]: "WON",
                [game.playerIds.find((id) => id !== winner)!]: "LOST",
              },
            });
          } else {
            game.thrownCards = {};
            cardDraw(game);
            switchDeceiver(game);
          }
        } else {
          game.thrownCards = {};
          cardDraw(game);
          switchDeceiver(game);
        }
      }
    },
  },
});
