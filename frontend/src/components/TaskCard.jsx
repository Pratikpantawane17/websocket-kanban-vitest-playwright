import React from 'react';

const TaskCard = ({ task, moveTask }) => {
  const handleMoveTask = (newStatus) => {
    moveTask(task.id, newStatus);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h4 className="font-semibold">{task.title}</h4>
      <p>Priority: {task.priority}</p>
      <p>Category: {task.category}</p>
      <div className="mt-2">
        <button onClick={() => handleMoveTask('To Do')} className="mr-2 px-2 py-1 bg-blue-500 text-white rounded">
          To Do
        </button>
        <button onClick={() => handleMoveTask('In Progress')} className="mr-2 px-2 py-1 bg-yellow-500 text-white rounded">
          In Progress
        </button>
        <button onClick={() => handleMoveTask('Done')} className="px-2 py-1 bg-green-500 text-white rounded">
          Done
        </button>
      </div>
    </div>
  );
};

export default TaskCard;
