"use client";
import { useState, useEffect } from "react";
import { db } from "../initApi"; // upewnij się, że ścieżka jest poprawna
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  orderBy,
  where
} from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import TodoElement from "./todoelement";
import {getAuth, onAuthStateChanged, signInAnonymously} from "@firebase/auth";

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
        const auth = getAuth();

        // Sprawdź czy użytkownik już jest zalogowany
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid); // Używamy UID od Firebase zamiast uuidv4
            } else {
                // Jeśli nie, zaloguj go anonimowo
                signInAnonymously(auth).then((result) => {
                    setUserId(result.user.uid);
                });
            }
        });

        return () => unsubscribe();
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

    const [isSubmitting, setIsSubmitting] = useState(false);
    const addTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !userId || isSubmitting) return;

        setIsSubmitting(true); // Blokujemy

        try {
            await addDoc(collection(db, "todo"), {
                userId: userId,
                title: title,
                description: description,
                isComplete: false,
                order: todos.length + 1
            });
            setTitle("");
            setDescription("");
        } finally {
            // Odblokowujemy po 2 sekundach
            setTimeout(() => setIsSubmitting(false), 2000);
        }
    };

   

    return (
    <div className="max-w-2xl mx-auto p-6 font-sans text-slate-800">
      <h1 className="text-3xl font-bold mb-8 border-b pb-2 text-amber-400">Your todo list</h1>

      {/* Add task form */}
      <form onSubmit={addTodo} className="bg-slate-50 p-4 rounded-lg mb-8 shadow-sm border">
        <div className="flex flex-col gap-3">
          <input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title of the task"
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description (optional)"
            className="p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none h-20"
          />
            <button
                disabled={isSubmitting}
                className={`${isSubmitting ? 'bg-gray-400' : 'bg-blue-600'} text-white ...`}
            >
                {isSubmitting ? "Wait..." : "Add task"}
            </button>
        </div>
      </form>

      {/* List of the tasks */}
      <div className="space-y-4">
        {todos.map(todo => (
          <TodoElement key={todo.id} todo={todo} />
        ))}
      </div>
    </div>
  );
}