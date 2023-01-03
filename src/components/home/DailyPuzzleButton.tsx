import { useEffect, useRef, useState } from "react";
import { GamemodeButton } from "./GamemodeButton";

const second = 1000;
const minute = second * 60;
const hour = minute * 60;
const day = hour * 24;

const formatCountdownDistance = (distance: number): string => {
  const hours = Math.floor((distance % day) / hour)
    .toString()
    .padStart(2, "0");
  const minutes = Math.floor((distance % hour) / minute)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor((distance % minute) / second)
    .toString()
    .padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
};

function convertDateToUTC(date: Date) {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  );
}

export const DailyPuzzleButton = (): JSX.Element | null => {
  const [dailyPuzzleSeed, setDailyPuzzleSeed] = useState<string | undefined>();
  const [now, setNow] = useState<Date | null>(null);
  const [end, setEnd] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  async function updateDailyPuzzle() {
    const resp = await fetch("../../api/daily.php");
    if (resp.ok) {
      const text = await resp.text();
      if (text.length > 20) {
        // Somehow launching this in local environment returns index.html?
        console.error("Failed to fetch daily puzzle");
      } else {
        setDailyPuzzleSeed(text);
      }
    } else {
      console.error("Failed to fetch daily puzzle");
    }
  }

  function updateCountdownEnd() {
    const nowUTC = convertDateToUTC(new Date());
    const endUTC = new Date(nowUTC);
    endUTC.setDate(endUTC.getDate() + 1);
    endUTC.setHours(0, 0, 0, 0);
    setEnd(endUTC);
  }

  useEffect(() => {
    updateDailyPuzzle();
  }, []);

  useEffect(() => {
    setNow(convertDateToUTC(new Date()));
    updateCountdownEnd();

    intervalRef.current = setInterval(() => {
      setNow(convertDateToUTC(new Date()));
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (now !== null && end !== null) {
      if (now > end) {
        updateCountdownEnd();
        updateDailyPuzzle();
      }
    }
  }, [now, end]);

  let timeRemaining = "";
  if (now !== null && end !== null) {
    const distance = end.getTime() - now.getTime();
    timeRemaining = formatCountdownDistance(distance);
  }

  if (dailyPuzzleSeed == null) {
    return null;
  }

  return (
    <GamemodeButton
      title={`Daily ${timeRemaining}`}
      line1="8 Pieces"
      line2="Rook, Bishop, Knight and King"
      line3="10x10"
      query="/?g=p&p=R3B3N3K1&s=10&c=8&r=${dailyPuzzleSeed}"
    />
  );
};
