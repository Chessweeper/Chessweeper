import { Link } from "react-router-dom";
import "./GamemodeButton.css";

export interface GamemodeButtonProps {
  title: string;
  line1: string;
  line2: string;
  line3: string;
  query: string;
}

export const GamemodeButton = ({
  title,
  line1,
  line2,
  line3,
  query,
}: GamemodeButtonProps) => {
  return (
    <Link className="gamemode button" to={`/play${query}`}>
      <h2>{title}</h2>
      {line1}
      <br />
      {line2}
      <br />
      {line3}
    </Link>
  );
};
