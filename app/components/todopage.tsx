"use client";
import { useState, useEffect } from "react";
import { db } from "../initApi"; // upewnij się, że ścieżka jest poprawna
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  doc, 
  deleteDoc, 
  updateDoc, 
  where
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";

interface Todo {
    id: string;
    title: string;
    description: string;
    isComplete: boolean;
    order: number;
}

export default function TodoPage() {
    const [userId, setUserId] = useState<string | null>(null);
    const [todos, setTodos] = useState<Todo[]>([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // init "account"
    useEffect(() => {
        let id = localStorage.getItem("todo_user_id");
        if (!id) {
            id = uuidv4();
            localStorage.setItem("todo_user_id", id);
        }
        setUserId(id);
    }, []);

    // RT
    useEffect(() => {
        if (!userId) return;
        const q = query(
            collection(db, "todo"), 
            where("userId", "==", userId),
            orderBy("order", "asc")
        );

        // on change execute
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const todoList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Todo[];
            setTodos(todoList);
        });

        return () => unsubscribe(); // clean
    }, [userId]);

    // add task
    const addTodo = async (e: React.SubmitEvent) => {
        e.preventDefault();

        if (!title.trim()) return;

        await addDoc(collection(db, "todo"), {
            userId: userId,
            title: title,
            description: description,
            isComplete: false,
            order: todos.length + 1
        });

        setTitle("");
        setDescription("");
    };

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
    <div className="max-w-2xl mx-auto p-6 font-sans text-slate-800">
      <h1 className="text-3xl font-bold mb-8 border-b pb-2">Lista zadań</h1>

      {/* Formularz dodawania */}
      <form onSubmit={addTodo} className="bg-slate-50 p-4 rounded-lg mb-8 shadow-sm border">
        <div className="flex flex-col gap-3">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tytuł zadania..."
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Opis (opcjonalnie)..."
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none h-20"
          />
          <button type="submit" className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition">
            Dodaj zadanie
          </button>
        </div>
      </form>

      {/* Lista zadań */}
      <div className="space-y-4">
        {todos.map(todo => (
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
        ))}
      </div>
    </div>
  );
}