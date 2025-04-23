import { render, screen, fireEvent } from "@testing-library/react";
import KanbanBoard from "../../components/KanbanBoard"; // ✅ correct path
import { vi } from "vitest";
import React from "react";

// Mock Socket.IO if needed
const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  off: vi.fn(),
};

describe("KanbanBoard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("renders Kanban board title", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  });

  test("renders all columns", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("To Do")).toBeInTheDocument();
    expect(screen.getByText("In Progress")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  test("renders task creation form/button", () => {
    render(<KanbanBoard />);
    expect(screen.getByText("Add Task")).toBeInTheDocument();
  });

  test("can type in task title input", () => {
    render(<KanbanBoard />);
    const input = screen.getByPlaceholderText("Task Title");
    fireEvent.change(input, { target: { value: "Test Task" } });
    expect(input.value).toBe("Test Task");
  });
});
