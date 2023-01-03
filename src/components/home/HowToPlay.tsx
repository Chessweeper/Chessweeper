import { BackButton } from "../ui/BackButton";
import "./HowToPlay.css";

export const HowToPlay = () => {
  return (
    <div>
      <BackButton />
      <h1 className="rules__title">How to play?</h1>
      <h2>Basic Rules</h2>
      <p>
        The goal is to find where and what all the chess pieces are
        <br />
        Numbers on a tile represent the number of pieces that have that tile in
        check
        <br />
        Once you identified a piece, click on the related button under the board
        then click on the tile, click again to remove it
        <br />
        All kinds of pieces can appear many times, except the king that can
        appear only 1 time maximum
        <br />
        The top left number is the number of pieces that need to be placed on
        the board
        <br />
        <br />
        For more information on how the pieces move, please click{" "}
        <a
          href="https://en.wikipedia.org/wiki/Chess#Movement"
          target="_blank"
          rel="noreferrer"
        >
          here
        </a>
      </p>

      <h2>Classic Mode</h2>
      <p>
        The shovel allows you to dig a tile
        <br />
        You lose if you use your shovel on a chess piece, you win if you find
        all the pieces correctly
      </p>

      <h2>Special pieces</h2>
      <p>
        Knook: Has the same moves as a knight and a rook
        <br />
        Shogi pieces:{" "}
        <a
          href="https://en.wikipedia.org/wiki/Shogi#Movement"
          target="_blank"
          rel="noreferrer"
        >
          Wikipedia
        </a>
      </p>
    </div>
  );
};
