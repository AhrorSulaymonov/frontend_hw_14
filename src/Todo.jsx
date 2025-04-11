import React, { useState, useEffect, useCallback } from "react";

const API_URL =
  import.meta.env.VITE_API_URL || "http://3.66.28.183:3000/api/task";

if (!API_URL) {
  console.error(
    "Xatolik: VITE_API_URL environment o'zgaruvchisi o'rnatilmagan!"
  );
}

function Todo() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reversed, setReversed] = useState(false);

  const fetchTasks = useCallback(async () => {
    if (!API_URL) {
      setError("API manzili topilmadi. Iltimos, konfiguratsiyani tekshiring.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || JSON.stringify(errorData);
        } catch (jsonError) {}
        throw new Error(errorMsg);
      }
      const data = await response.json();
      const activeTasks = data.filter((task) => !task.isdeleted);
      setTasks(activeTasks);
    } catch (e) {
      console.error("Failed to fetch tasks:", e);
      if (e instanceof TypeError && e.message === "Failed to fetch") {
        setError(
          `Vazifalarni yuklab bo'lmadi: Serverga ulanishda xatolik (${API_URL}). Tarmoq yoki CORS/HTTPS sozlamalarini tekshiring.`
        );
      } else {
        setError(
          `Vazifalarni yuklab bo'lmadi: ${e.message}. Iltimos, keyinroq urinib ko'ring.`
        );
      }
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setTasks((currentTasks) => [...currentTasks].reverse());
  }, [reversed]);

  const handleAdd = async () => {
    if (!API_URL) {
      setError("API manzili topilmadi.");
      return;
    }
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      alert("Task sarlavhasi bo'sh bo'lishi mumkin emas!");
      return;
    }
    setError(null);
    const newTaskData = { name: trimmedTitle };
    const optimisticId = Date.now();
    const optimisticTask = {
      name: trimmedTitle,
      id: optimisticId,
      iscompleted: false,
      isdeleted: false,
    };

    setTasks((prev) =>
      reversed ? [optimisticTask, ...prev] : [...prev, optimisticTask]
    );
    setTitle("");

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTaskData),
      });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || JSON.stringify(errorData);
        } catch (jsonError) {}
        throw new Error(errorMsg);
      }
      const addedTask = await response.json();
      setTasks((prev) =>
        prev.map((task) => (task.id === optimisticId ? addedTask : task))
      );
    } catch (e) {
      console.error("Failed to add task:", e);
      if (e instanceof TypeError && e.message === "Failed to fetch") {
        setError(
          `Vazifa qo'shib bo'lmadi: Serverga ulanishda xatolik (${API_URL}). Tarmoq yoki CORS/HTTPS sozlamalarini tekshiring.`
        );
      } else {
        setError(`Vazifa qo'shib bo'lmadi: ${e.message}.`);
      }
      setTasks((prev) => prev.filter((task) => task.id !== optimisticId));
      setTitle(trimmedTitle);
    }
  };

  const handleDelete = async (id) => {
    if (!API_URL) {
      setError("API manzili topilmadi.");
      return;
    }
    const originalTasks = [...tasks];
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setError(null);
    try {
      const response = await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      if (!response.ok && response.status !== 404) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || JSON.stringify(errorData);
        } catch (jsonError) {}
        throw new Error(errorMsg);
      }
      if (response.status === 404) {
        console.warn(`Task ${id} not found.`);
      }
    } catch (e) {
      console.error("Failed to delete task:", e);
      if (e instanceof TypeError && e.message === "Failed to fetch") {
        setError(
          `Vazifani o'chirib bo'lmadi: Serverga ulanishda xatolik. Tarmoq/CORS/HTTPS tekshiring.`
        );
      } else {
        setError(`Vazifani o'chirib bo'lmadi: ${e.message}.`);
      }
      setTasks(originalTasks);
    }
  };

  const handleEdit = async (id) => {
    if (!API_URL) {
      setError("API manzili topilmadi.");
      return;
    }
    const taskToEdit = tasks.find((task) => task.id === id);
    if (!taskToEdit) return;
    const newTitle = prompt("Sarlavhani yangilang:", taskToEdit.name);
    if (newTitle === null) return;
    const trimmedNewTitle = newTitle.trim();
    if (trimmedNewTitle === "" || trimmedNewTitle === taskToEdit.name) {
      if (trimmedNewTitle === "") alert("Sarlavha bo'sh bo'lishi mumkin emas!");
      return;
    }
    setError(null);
    const updatedTaskData = { name: trimmedNewTitle };
    const originalTasks = [...tasks];
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, name: trimmedNewTitle } : task
      )
    );
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTaskData),
      });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || JSON.stringify(errorData);
        } catch (jsonError) {}
        throw new Error(errorMsg);
      }
    } catch (e) {
      console.error("Failed to edit task:", e);
      if (e instanceof TypeError && e.message === "Failed to fetch") {
        setError(
          `Vazifani tahrirlab bo'lmadi: Serverga ulanishda xatolik. Tarmoq/CORS/HTTPS tekshiring.`
        );
      } else {
        setError(`Vazifani tahrirlab bo'lmadi: ${e.message}.`);
      }
      setTasks(originalTasks);
    }
  };

  const handleToggleComplete = async (id) => {
    if (!API_URL) {
      setError("API manzili topilmadi.");
      return;
    }
    const taskToToggle = tasks.find((task) => task.id === id);
    if (!taskToToggle) return;
    setError(null);
    const updatedStatus = !taskToToggle.iscompleted;
    const updatedTaskData = { iscompleted: updatedStatus };
    const originalTasks = [...tasks];
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, iscompleted: updatedStatus } : task
      )
    );
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedTaskData),
      });
      if (!response.ok) {
        let errorMsg = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.message || JSON.stringify(errorData);
        } catch (jsonError) {}
        throw new Error(errorMsg);
      }
    } catch (e) {
      console.error("Failed to toggle task completion:", e);
      if (e instanceof TypeError && e.message === "Failed to fetch") {
        setError(
          `Vazifa holatini o'zgartirib bo'lmadi: Serverga ulanishda xatolik. Tarmoq/CORS/HTTPS tekshiring.`
        );
      } else {
        setError(`Vazifa holatini o'zgartirib bo'lmadi: ${e.message}.`);
      }
      setTasks(originalTasks);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !isAddButtonDisabled) {
      handleAdd();
    }
  };

  const isAddButtonDisabled = title.trim() === "";

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center text-gray-800 mb-4 sm:mb-6">
            My Tasks
          </h1>

          {error && (
            <div
              className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded"
              role="alert"
            >
              <p className="font-bold">Xatolik</p>
              <p>{error}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 mb-5 sm:mb-6">
            <input
              className="flex-grow p-2.5 sm:p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 text-sm sm:text-base"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleInputKeyDown}
              placeholder="Add a new task..."
              disabled={loading || !API_URL}
            />
            <button
              className={`px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg text-white font-semibold transition duration-200 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 text-sm sm:text-base ${
                isAddButtonDisabled || loading || !API_URL
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500"
              }`}
              onClick={handleAdd}
              disabled={isAddButtonDisabled || loading || !API_URL}
            >
              Add Task
            </button>
          </div>

          {loading && (
            <p className="text-center text-gray-500 py-4">Loading tasks...</p>
          )}

          {!loading && tasks.length > 0 && API_URL && (
            <div className="text-right mb-4">
              <button
                className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium transition duration-200 ease-in-out shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  reversed
                    ? "bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700 focus:ring-gray-400"
                }`}
                onClick={() => setReversed((prevReversed) => !prevReversed)}
              >
                {reversed ? "Order: Newest First" : "Order: Oldest First"}
              </button>
            </div>
          )}

          <div className="space-y-3 sm:space-y-4">
            {!loading && tasks.length === 0 && !error && API_URL && (
              <p className="text-center text-gray-500 py-6 text-base sm:text-lg">
                No tasks yet. Add one above!
              </p>
            )}
            {!loading && !API_URL && !error && (
              <p className="text-center text-red-500 py-6 text-base sm:text-lg">
                API manzili topilmadi. Iltimos, konfiguratsiyani tekshiring.
              </p>
            )}
            {!loading &&
              API_URL &&
              tasks.map((task) => (
                <div
                  className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 sm:p-4 rounded-lg shadow transition duration-300 ease-in-out ${
                    task.iscompleted
                      ? "bg-green-50 border border-green-200 opacity-70"
                      : "bg-white border border-gray-200 hover:shadow-md"
                  }`}
                  key={task.id}
                >
                  <p
                    className={`w-full sm:flex-grow text-gray-800 break-words text-sm sm:text-base ${
                      task.iscompleted ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.name}
                  </p>

                  <div className="w-full sm:w-auto flex justify-end items-center gap-2 flex-shrink-0">
                    {!task.iscompleted && (
                      <>
                        <button
                          className="px-2 py-1 text-xs sm:px-3 sm:text-sm bg-green-500 hover:bg-green-600 border border-green-600 rounded text-white shadow-sm transition duration-150"
                          onClick={() => handleToggleComplete(task.id)}
                        >
                          Complete
                        </button>
                        <button
                          className="px-2 py-1 text-xs sm:px-3 sm:text-sm bg-yellow-400 hover:bg-yellow-500 border border-yellow-500 rounded text-white shadow-sm transition duration-150"
                          onClick={() => handleEdit(task.id)}
                        >
                          Edit
                        </button>
                      </>
                    )}
                    {task.iscompleted && (
                      <button
                        className="px-2 py-1 text-xs sm:px-3 sm:text-sm bg-gray-500 hover:bg-gray-600 border border-gray-600 rounded text-white shadow-sm transition duration-150"
                        onClick={() => handleToggleComplete(task.id)}
                      >
                        Undo
                      </button>
                    )}
                    <button
                      className="px-2 py-1 text-xs sm:px-3 sm:text-sm bg-red-500 hover:bg-red-600 border border-red-600 rounded text-white shadow-sm transition duration-150"
                      onClick={() => handleDelete(task.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Todo;
