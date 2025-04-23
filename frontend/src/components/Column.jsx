import React from 'react';
import TaskCard from './TaskCard'; // Assuming you have a TaskCard component for displaying individual tasks

const Column = ({ title, tasks, moveTask }) => {
  return (
    <div className="w-1/3 p-4 bg-gray-100 rounded">
      <h3 className="text-xl font-semibold mb-4">{title}</h3>
      <div className="space-y-4">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} moveTask={moveTask} />
        ))}
      </div>
    </div>
  );
};

export default Column;
