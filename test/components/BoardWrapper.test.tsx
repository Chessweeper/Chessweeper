// @vitest-environment jsdom
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import {
  BoardWrapper,
  useBoardContext,
} from "../../src/components/BoardWrapper";
import { createMockBoardPropsWithReload } from "../mocks";
import { BoardPropsWithReload } from "../../src/components/Client";
import { Cell } from "../../src/Game";
import { renderWithProviders } from "../mockStore";

let boardProps: BoardPropsWithReload;

describe("BoardWrapper tests", () => {
  beforeEach(() => {
    boardProps = createMockBoardPropsWithReload();
    vi.clearAllMocks();
  });

  it("should not render puzzle cover in classic mode", () => {
    const { container } = renderWithProviders(<BoardWrapper {...boardProps} />);

    const puzzleCover = container.querySelector("#board-cover");
    expect(puzzleCover).not.toBeInTheDocument();
  });

  it("should render puzzle cover in puzzle mode", async () => {
    boardProps.G.gamemode = "p";

    const { container } = renderWithProviders(<BoardWrapper {...boardProps} />);

    const puzzleCover = container.querySelector("#board-cover");
    expect(puzzleCover).toBeInTheDocument();
  });

  it("should hide puzzle cover when it is clicked", async () => {
    boardProps.G.gamemode = "p";

    const { container } = renderWithProviders(<BoardWrapper {...boardProps} />);

    const puzzleCover = container.querySelector("#board-cover");
    if (puzzleCover) {
      await userEvent.click(puzzleCover);
    }

    expect(puzzleCover).not.toBeInTheDocument();
  });

  describe("pieces counter", () => {
    it("should show pieces remaining equal to game count if no pieces are placed", async () => {
      renderWithProviders(<BoardWrapper {...boardProps} />);

      const count = await screen.findByText("003");

      expect(count).toBeInTheDocument();
    });

    it("should show pieces remaining if pieces have been placed", async () => {
      boardProps.G.cells = Array<Cell>(
        boardProps.G.size * boardProps.G.size
      ).fill({
        value: 0,
        known: false,
        attackedValue: 0,
      });
      boardProps.G.cells[0] = { value: 0, known: "R", attackedValue: 0 };
      boardProps.G.cells[1] = { value: 0, known: "R", attackedValue: 0 };

      renderWithProviders(<BoardWrapper {...boardProps} />);

      const count = await screen.findByText("001");

      expect(count).toBeInTheDocument();
    });

    it("should show negative pieces remaining if more pieces placed than game count", async () => {
      boardProps.G.cells = Array<Cell>(
        boardProps.G.size * boardProps.G.size
      ).fill({
        value: 0,
        known: false,
        attackedValue: 0,
      });
      boardProps.G.cells[0] = { value: 0, known: "R", attackedValue: 0 };
      boardProps.G.cells[1] = { value: 0, known: "R", attackedValue: 0 };
      boardProps.G.cells[2] = { value: 0, known: "R", attackedValue: 0 };
      boardProps.G.cells[3] = { value: 0, known: "R", attackedValue: 0 };

      renderWithProviders(<BoardWrapper {...boardProps} />);

      const count = await screen.findByText("-01");

      expect(count).toBeInTheDocument();
    });
  });

  it("should set current action to shovel on initial render in classic mode", () => {
    const { container } = renderWithProviders(<BoardWrapper {...boardProps} />);

    const firstAction = container.querySelector("#action-buttons")?.firstChild;

    expect(firstAction).toHaveClass("selected");
  });

  it("should set current action to first piece on initial render in puzzle mode", () => {
    boardProps.G.gamemode = "p";

    const { container } = renderWithProviders(<BoardWrapper {...boardProps} />);

    const firstAction = container.querySelector("#action-buttons")?.firstChild;

    expect(firstAction).toHaveClass("selected");
  });

  describe("default board context", () => {
    it("should use empty object as default board context", () => {
      let context;

      const Child = () => {
        context = useBoardContext();
        return null;
      };
      renderWithProviders(<Child />);

      expect(context).toEqual({});
    });
  });
});
