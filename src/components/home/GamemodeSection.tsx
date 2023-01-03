import { DailyPuzzleButton } from "./DailyPuzzleButton";
import { GamemodeButton, GamemodeButtonProps } from "./GamemodeButton";
import "./GamemodeSection.css";

interface GamemodeSectionProps {
  title: string;
  description: string;
  buttons: GamemodeButtonProps[];
  includeDaily?: boolean;
}

export const GamemodeSection = ({
  title,
  description,
  buttons,
  includeDaily,
}: GamemodeSectionProps): JSX.Element => {
  return (
    <div className="gamemode-section">
      <h2 className="gamemode-section__title">{title}</h2>
      <p>{description}</p>
      <div className="flex hor">
        {includeDaily && <DailyPuzzleButton />}
        {buttons.map((props) => (
          <GamemodeButton key={props.title} {...props} />
        ))}
      </div>
    </div>
  );
};
