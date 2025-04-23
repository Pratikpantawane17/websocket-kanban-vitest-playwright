import React, { useEffect, useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import io from 'socket.io-client';
import Select from 'react-select';
import Column from './Column'; // Adjust the path based on your file structure


const socket = io('http://localhost:5000');

const columns = ['To Do', 'In Progress', 'Done'];

const KanbanBoard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    socket.on('sync:tasks', (tasks) => setTasks(tasks));

    socket.on('task:updated', (updatedTask) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === updatedTask.id ? updatedTask : task
        )
      );
    });

    socket.on('task:created', (newTask) => {
      setTasks((prevTasks) => [...prevTasks, newTask]);
    });

    socket.on('task:moved', ({ taskId, newColumn }) => {
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId ? { ...task, status: newColumn } : task
        )
      );
    });

    socket.on('task:deleted', (taskId) => {
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
    });

    return () => {
      socket.off('sync:tasks');
      socket.off('task:updated');
      socket.off('task:created');
      socket.off('task:moved');
      socket.off('task:deleted');
    };
  }, []);

  const moveTask = useCallback((id, newStatus) => {
    setLoading(true);
    socket.emit('task:move', { taskId: id, newColumn: newStatus });
    setLoading(false);
  }, []);

  const handleAddTask = () => {
    const newTask = {
      id: Date.now(),
      title: `Task ${tasks.length + 1}`,
      status: 'To Do',
      priority: 'Medium',
      category: 'Feature',
      fileUrl: '',
      fileType: ''
    };
    socket.emit('task:create', newTask);
    setTasks([...tasks, newTask]);
  };

  const handleFileUpload = (taskId, file) => {
    const fileUrl = URL.createObjectURL(file);
    const fileType = file.type;
    const updated = tasks.map((t) => (t.id === taskId ? { ...t, fileUrl, fileType } : t));
    setTasks(updated);
    socket.emit('task:update', { id: taskId, fileUrl, fileType });
  };

  const taskStats = columns.map((col) => ({
    name: col,
    value: tasks.filter((t) => t.status === col).length
  }));

  const doneCount = tasks.filter((t) => t.status === 'Done').length;
  const completionRate = tasks.length ? (doneCount / tasks.length) * 100 : 0;

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-4">
        <h2 className="text-3xl font-bold mb-4">Kanban Board</h2>
        <button onClick={handleAddTask} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">Add Task</button>
        {loading && <p>Loading...</p>}

        <div className="flex gap-4">
          {columns.map((col) => (
            <Column key={col} title={col} tasks={tasks.filter((task) => task.status === col)} moveTask={moveTask} />
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-2">Task Progress</h3>
          <PieChart width={400} height={300}>
            <Pie
              dataKey="value"
              isAnimationActive={true}
              data={taskStats}
              cx="50%"
              cy="50%"
              outerRadius={80}
              label
            >
              {taskStats.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658"][index % 3]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
          <p className="mt-2">Completion Rate: {completionRate.toFixed(2)}%</p>
        </div>
      </div>
    </DndProvider>
  );
};

export default KanbanBoard;


















































// import React, { useEffect, useState, useCallback } from 'react';
// import { DndProvider, useDrag, useDrop } from 'react-dnd';
// import { HTML5Backend } from 'react-dnd-html5-backend';
// import Select from 'react-select';
// import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
// import io from 'socket.io-client';

// const socket = io('http://localhost:5000');

// const columns = ['To Do', 'In Progress', 'Done'];
// const priorities = [
//   { value: 'Low', label: 'Low' },
//   { value: 'Medium', label: 'Medium' },
//   { value: 'High', label: 'High' }
// ];
// const categories = [
//   { value: 'Bug', label: 'Bug' },
//   { value: 'Feature', label: 'Feature' },
//   { value: 'Enhancement', label: 'Enhancement' }
// ];

// const TaskCard = ({ task, moveTask }) => {
//   const [, drag] = useDrag(() => ({
//     type: 'TASK',
//     item: { id: task.id }
//   }));

//   return (
//     <div ref={drag} className="p-2 m-2 bg-white rounded shadow">
//       <p><strong>{task.title}</strong></p>
//       <p>Priority: {task.priority}</p>
//       <p>Category: {task.category}</p>
//       {task.fileUrl && task.fileType.startsWith('image/') && (
//         <img src={task.fileUrl} alt="preview" className="w-16 h-16 object-cover" />
//       )}
//     </div>
//   );
// };

// const Column = ({ title, tasks, moveTask }) => {
//   const [, drop] = useDrop({
//     accept: 'TASK',
//     drop: (item) => moveTask(item.id, title)
//   });

//   return (
//     <div ref={drop} className="w-1/3 p-4 bg-gray-100 rounded">
//       <h3 className="text-xl font-bold mb-4">{title}</h3>
//       {tasks.map(task => <TaskCard key={task.id} task={task} moveTask={moveTask} />)}
//     </div>
//   );
// };

// function KanbanBoard() {
//   const [tasks, setTasks] = useState([]);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     socket.on('task-update', updatedTasks => setTasks(updatedTasks));
//     return () => socket.off('task-update');
//   }, []);

//   const moveTask = useCallback((id, newStatus) => {
//     setLoading(true);
//     socket.emit('move-task', { id, status: newStatus });
//     setLoading(false);
//   }, []);

//   const handleAddTask = () => {
//     const newTask = {
//       id: Date.now(),
//       title: `Task ${tasks.length + 1}`,
//       status: 'To Do',
//       priority: 'Medium',
//       category: 'Feature',
//       fileUrl: '',
//       fileType: ''
//     };
//     socket.emit('add-task', newTask);
//   };

//   const handleFileUpload = (taskId, file) => {
//     const fileUrl = URL.createObjectURL(file);
//     const fileType = file.type;
//     const updated = tasks.map(t => t.id === taskId ? { ...t, fileUrl, fileType } : t);
//     setTasks(updated);
//     socket.emit('update-task', { id: taskId, fileUrl, fileType });
//   };

//   const taskStats = columns.map(col => ({ name: col, value: tasks.filter(t => t.status === col).length }));
//   const doneCount = tasks.filter(t => t.status === 'Done').length;
//   const completionRate = tasks.length ? (doneCount / tasks.length) * 100 : 0;

//   return (
//     <DndProvider backend={HTML5Backend}>
//       <div className="p-4">
//         <h2 className="text-3xl font-bold mb-4">Kanban Board</h2>
//         <button onClick={handleAddTask} className="mb-4 px-4 py-2 bg-blue-600 text-white rounded">Add Task</button>
//         {loading && <p>Loading...</p>}

//         <div className="flex gap-4">
//           {columns.map(col => (
//             <Column key={col} title={col} tasks={tasks.filter(task => task.status === col)} moveTask={moveTask} />
//           ))}
//         </div>

//         <div className="mt-8">
//           <h3 className="text-xl font-semibold mb-2">Task Progress</h3>
//           <PieChart width={400} height={300}>
//             <Pie
//               dataKey="value"
//               isAnimationActive={true}
//               data={taskStats}
//               cx="50%"
//               cy="50%"
//               outerRadius={80}
//               label
//             >
//               {taskStats.map((entry, index) => (
//                 <Cell key={`cell-${index}`} fill={["#8884d8", "#82ca9d", "#ffc658"][index % 3]} />
//               ))}
//             </Pie>
//             <Tooltip />
//             <Legend />
//           </PieChart>
//           <p className="mt-2">Completion Rate: {completionRate.toFixed(2)}%</p>
//         </div>
//       </div>
//     </DndProvider>
//   );
// }

// export default KanbanBoard;
