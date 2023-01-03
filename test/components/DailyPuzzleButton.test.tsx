/* eslint-disable no-global-assign */
// @vitest-environment jsdom
import { MemoryRouter } from "react-router-dom";
import { render, waitFor, screen } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import { DailyPuzzleButton } from "../../src/components/home/DailyPuzzleButton";

console.error = vi.fn();

describe("DailyPuzzleButton tests", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should render the daily puzzle link on successful daily api call", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue("mockPuzzleSeed"),
    });

    render(<DailyPuzzleButton />, { wrapper: MemoryRouter });

    const daily = await screen.findByText(/^Daily/i);

    expect(daily).toBeInTheDocument();
  });

  it("should not render the daily puzzle link on unsuccessful daily api call", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
    });

    render(<DailyPuzzleButton />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledOnce();
    });

    const dailyPuzzleLink = screen.queryByText("#daily");

    expect(dailyPuzzleLink).not.toBeInTheDocument();
  });

  it("should not render the daily puzzle when daily puzzle api returns string greater than length 20", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue("longErrorValueOnFetchReturn"),
    });

    render(<DailyPuzzleButton />, { wrapper: MemoryRouter });

    await waitFor(() => {
      expect(console.error).toHaveBeenCalledOnce();
    });

    const dailyPuzzleLink = screen.queryByText("#daily");

    expect(dailyPuzzleLink).not.toBeInTheDocument();
  });

  it("should update daily puzzle time remaining", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue("mockPuzzleSeed"),
    });
    vi.useFakeTimers();

    render(<DailyPuzzleButton />, { wrapper: MemoryRouter });

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    const dailyTitleWithTime = await screen.findByText(/^Daily/i);

    expect(dailyTitleWithTime.textContent).toHaveLength(14);
  });

  it("should update daily puzzle when timer resets", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      text: vi.fn().mockResolvedValue("mockPuzzleSeed"),
    });
    vi.useFakeTimers();

    render(<DailyPuzzleButton />, { wrapper: MemoryRouter });

    act(() => {
      vi.advanceTimersByTime(86400001);
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
