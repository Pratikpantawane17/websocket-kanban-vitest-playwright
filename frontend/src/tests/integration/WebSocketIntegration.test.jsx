
import { render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { vi } from "vitest";
import KanbanBoard from "../../components/KanbanBoard"; // uncomment this!

const mockSocket = {
  on: vi.fn(),
  emit: vi.fn(),
  off: vi.fn(),
};

describe("KanbanBoard WebSocket Integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithSocket = () => render(<KanbanBoard />);

  // ...rest of your tests...


  test("renders Kanban board title", () => {
    renderWithSocket();
    expect(screen.getByText("Kanban Board")).toBeInTheDocument();
  });

  test("handles sync:tasks on connection", async () => {
    const fakeTasks = [
      {
        id: "1",
        title: "Test Task",
        description: "Sample",
        status: "todo",
        priority: "high",
        category: "dev",
        attachments: [],
      },
    ];

    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "sync:tasks") callback(fakeTasks);
    });

    renderWithSocket();
    await waitFor(() => {
      expect(screen.getByText("Test Task")).toBeInTheDocument();
    });
  });

  test("handles task:created event", async () => {
    renderWithSocket();

    const newTask = {
      id: "2",
      title: "New Live Task",
      description: "Real-time creation",
      status: "todo",
      priority: "medium",
      category: "qa",
      attachments: [],
    };

    // Trigger the listener for task:created
    const taskCreatedHandler = mockSocket.on.mock.calls.find(call => call[0] === "task:created")?.[1];
    taskCreatedHandler?.(newTask);

    await waitFor(() => {
      expect(screen.getByText("New Live Task")).toBeInTheDocument();
    });
  });

  test("handles task:updated event", async () => {
    const existingTask = {
      id: "3",
      title: "Update Me",
      description: "To be updated",
      status: "todo",
      priority: "low",
      category: "testing",
      attachments: [],
    };

    const updatedTask = {
      ...existingTask,
      title: "Updated Task",
    };

    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "sync:tasks") callback([existingTask]);
    });

    renderWithSocket();

    const taskUpdatedHandler = mockSocket.on.mock.calls.find(call => call[0] === "task:updated")?.[1];
    taskUpdatedHandler?.(updatedTask);

    await waitFor(() => {
      expect(screen.getByText("Updated Task")).toBeInTheDocument();
    });
  });

  test("handles task:deleted event", async () => {
    const existingTask = {
      id: "4",
      title: "Delete Me",
      description: "",
      status: "todo",
      priority: "low",
      category: "misc",
      attachments: [],
    };

    mockSocket.on.mockImplementation((event, callback) => {
      if (event === "sync:tasks") callback([existingTask]);
    });

    renderWithSocket();

    const taskDeletedHandler = mockSocket.on.mock.calls.find(call => call[0] === "task:deleted")?.[1];
    taskDeletedHandler?.("4");

    await waitFor(() => {
      expect(screen.queryByText("Delete Me")).not.toBeInTheDocument();
    });
  });
});







































// import { render, screen } from "@testing-library/react";

// import KanbanBoard from "../../components/KanbanBoard";

// // mock socket.io-client library

// test("WebSocket receives task update", async () => {
//   render(<KanbanBoard />);

//   expect(screen.getByText("Kanban Board")).toBeInTheDocument();
// });

// // TODO: Add more integration tests
