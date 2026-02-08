import { db } from "../initApi";
import { updateDoc, deleteDoc, doc } from "firebase/firestore";

interface Todo {
    id: string;
    title: string;
    description: string;
    isComplete: boolean;
    order: number;
}

export default function TodoElement({todo}: {todo: Todo}) {
     // change status
    const toggleTodo = async (id: string, isComplete: boolean) => {
        const todoRef = doc(db, "todo", id);
        await updateDoc(todoRef, {
            isComplete: !isComplete
        });
    };

    // delete task
    const deleteTodo = async (id: string) => {
        await deleteDoc(doc(db, "todo", id));
    };
    
    return (
        <div 
            key={todo.id} 
            className={`p-4 border rounded-lg flex items-start justify-between transition ${todo.isComplete ? 'bg-gray-50 opacity-60' : 'bg-white shadow-sm'}`}
          >
            <div className="flex gap-4">
              <input 
                type="checkbox" 
                checked={todo.isComplete} 
                onChange={() => toggleTodo(todo.id, todo.isComplete)}
                className="mt-1.5 h-5 w-5 cursor-pointer"
              />
              <div>
                <h3 className={`font-semibold text-lg ${todo.isComplete ? 'line-through' : ''}`}>
                  {todo.title}
                </h3>
                <p className="text-slate-600 text-sm">{todo.description}</p>
              </div>
            </div>
            <button 
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:bg-red-50 p-2 rounded transition"
            >
              Usuń
            </button>
          </div>
    )
}