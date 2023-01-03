import { BoardProps, Client as BgioClient } from "boardgame.io/react";
import { Game as BgioGame } from "boardgame.io";
import { Game, GameState, SetupData } from "../Game";
import { generatePuzzleBoard } from "../gen/Algs";
import { BoardWrapper } from "./BoardWrapper";
import { parseUrl } from "../Parsing";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Random } from "../gen/Random";
import { LoadingBar } from "./LoadingBar";
import PuzzleGenWorker from "../PuzzleGenWorker?worker";
import { BackButton } from "./ui/BackButton";

export interface BoardPropsWithReload extends BoardProps<GameState> {
  reload: () => void;
}

const wrapBoardWithReload = (
  reload: () => void,
  RawBoard: (props: BoardPropsWithReload) => JSX.Element
) => {
  const Board = (props: BoardProps<GameState>) => {
    const boardProps: BoardPropsWithReload = { ...props, reload };
    return <RawBoard {...boardProps} />;
  };
  return Board;
};

export const Client = (): JSX.Element => {
  const [searchParams] = useSearchParams();

  const [game, setGame] = useState<BgioGame | null>(null);
  const [settingNextGame, setSettingNextGame] = useState(false);
  const [worker, setWorker] = useState<Worker | null>();
  const [progress, setProgress] = useState(0);

  const nextGame = useRef<BgioGame | null>(null);

  const setupDataFromUrl = useMemo(
    () => parseUrl(searchParams),
    [searchParams]
  );

  const getSetupDataWithSeed = useCallback(() => {
    return {
      ...setupDataFromUrl,
      seed: setupDataFromUrl.seed ?? Random.generateSeed(),
    };
  }, [setupDataFromUrl]);

  const setupGame = useCallback(() => {
    if (setupDataFromUrl.gamemode === "p") {
      if (worker) {
        setGame(nextGame.current);
        nextGame.current = null;
      } else {
        const setupData = getSetupDataWithSeed();
        const { cells, error } = generatePuzzleBoard(
          setupData.seed,
          setupData.pieces,
          setupData.size,
          setupData.count,
          setupData.difficulty,
          setProgress
        );

        if (error) {
          console.error(error);
        } else {
          setGame(Game({ ...setupData, cells }));
        }
      }
    } else {
      setGame(Game(getSetupDataWithSeed()));
    }
  }, [worker, setupDataFromUrl, getSetupDataWithSeed]);

  // Setup web worker on URL change
  useEffect(() => {
    /* c8 ignore next 7 */
    if (!import.meta.env.VITEST) {
      // prettier-ignore
      console.log(`Loading game: ${setupDataFromUrl.gamemode === "c" ? "classic" : "puzzle"} gamemode${setupDataFromUrl.seed != null ? ` with a seed of "${setupDataFromUrl.seed}"` : ""}, ${setupDataFromUrl.count} piece${setupDataFromUrl.count > 1 ? "s" : ""}, ${setupDataFromUrl.size}x${setupDataFromUrl.size} grid, piece${Object.keys(setupDataFromUrl.pieces).length > 1 ? "s" : ""} allowed: ${Object.keys(setupDataFromUrl.pieces).map((x) => `${x} (x${setupDataFromUrl.pieces[x]})`).join(", ")}`);
    }

    // Firefox does not allow module workers, but PuzzleGenWorker is compiled
    // to a non-module type in production - so don't allow worker in dev with Firefox
    const isFirefox = navigator.userAgent.toLowerCase().indexOf("firefox") > -1;
    const isWorkerAvailable =
      (process.env.NODE_ENV === "production" || !isFirefox) &&
      typeof Worker !== "undefined";

    let w: Worker;

    if (isWorkerAvailable) {
      w = new PuzzleGenWorker();
      w.onmessage = (
        e: MessageEvent<SetupData> | MessageEvent<string> | MessageEvent<number>
      ) => {
        if (typeof e.data === "string") {
          console.error(e.data);
        } else if (typeof e.data === "number") {
          setProgress(e.data);
        } else {
          const setupData = e.data;
          nextGame.current = Game(setupData);
          setSettingNextGame(false);
        }
      };
      setWorker(w);
    } else {
      setWorker(null);
    }

    return () => {
      if (w) {
        w.terminate();
        setWorker(undefined);
      }
    };
  }, [setupDataFromUrl]);

  // On worker creation, create a new game
  useEffect(() => {
    if (worker !== undefined) {
      window.scrollTo({ top: 0, behavior: "smooth" });

      // Use next game generation in puzzle mode
      if (worker && setupDataFromUrl.gamemode === "p") {
        setGame(null);
        setSettingNextGame(false);
        nextGame.current = null;
      } else {
        setupGame();
      }
    }
  }, [setupDataFromUrl, worker, setupGame]);

  // Generate next game in puzzle mode
  useEffect(() => {
    if (setupDataFromUrl.gamemode === "c") return;

    // Set the current game to the next game if the current game is null
    if (game === null && nextGame.current) {
      setGame(nextGame.current);
      nextGame.current = null;
    }

    // When the next game has been consumed, tell the worker to generate a new one
    if (worker && !settingNextGame && nextGame.current === null) {
      setSettingNextGame(true);
      worker.postMessage(getSetupDataWithSeed());
    }
  }, [game, worker, settingNextGame, setupDataFromUrl, getSetupDataWithSeed]);

  const Client = useMemo(
    () =>
      game
        ? BgioClient({
            game,
            board: wrapBoardWithReload(setupGame, BoardWrapper),
            numPlayers: 1,
            debug: {
              collapseOnLoad: true,
            },
          })
        : () => null,
    [game, setupGame]
  );

  return (
    <div className="flex">
      <BackButton />
      {game ? <Client /> : <LoadingBar value={progress} />}
    </div>
  );
};
