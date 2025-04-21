"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ChevronRight,
  ImagePlus,
  CircleFadingPlus,
  CircleDashed,
  Clock,
  CheckCircle,
} from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";

export default function TodoListPage() {
  const { user, loading, validateToken } = useAuth();
  const router = useRouter();
  const [todos, setTodos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [newTodo, setNewTodo] = useState({
    title: "",
    description: "",
    imageList: [],
    status: "pending",
  });

  const [selectedTodo, setSelectedTodo] = useState([]);
  const [isSelected, setIsSelected] = useState(false);
  const [selectedId, setSelectedId] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [error, setError] = useState("");

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }

    // Validate token on component mount
    const checkToken = async () => {
      const isValid = await validateToken();

      if (!isValid) {
        router.push("/login");
      } else {
        // Only fetch todos if the token is valid
        fetchTodos();
      }
    };

    if (user) {
      checkToken();
    }
  }, [user, loading, router, validateToken]);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/todos");
      const result = await response.json();

      if (result.success) {
        setTodos(result.data);
      } else {
        setError(result.message || "Failed to fetch todos");
      }
    } catch (error) {
      setError("Error connecting to the server");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTodo = async (todoId) => {
    try {
      // setIsLoading(true);
      const response = await fetch(`/api/todos/${todoId}`);
      const result = await response.json();

      if (result.success) {
        setSelectedTodo(result.data);
      } else {
        setError(result.message || "Failed to fetch todo");
      }
    } catch (error) {
      setError("Error connecting to the server");
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageClick = (img) => {
    setSelectedImage(img);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (isSelected) {
      setSelectedTodo((prev) => ({ ...prev, [name]: value }));
    } else {
      setNewTodo((prev) => ({ ...prev, [name]: value }));
    }
  };

  const [uploading, setUploading] = useState(false);

  const handleAddImage = () => {
    if (!imageUrl.trim()) return;
    setNewTodo((prev) => ({
      ...prev,
      imageList: [...prev.imageList, imageUrl],
    }));
    setImageUrl("");
  };

  const handleRemoveImage = (index) => {
    if (isSelected) {
      setSelectedTodo((prev) => ({
        ...prev,
        imageList: prev.imageList.filter((_, i) => i !== index),
      }));
    } else {
      setNewTodo((prev) => ({
        ...prev,
        imageList: prev.imageList.filter((_, i) => i !== index),
      }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);

    const toBase64 = (file) =>
      new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

    try {
      const base64 = await toBase64(file);

      const res = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: base64 }),
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();

      if (isSelected) {
        setSelectedTodo((prev) => ({
          ...prev,
          imageList: [...prev.imageList, data.url],
        }));
      } else {
        setNewTodo((prev) => ({
          ...prev,
          imageList: [...prev.imageList, data.url],
        }));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const createTodo = async () => {
    if (!newTodo.title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      const response = await fetch("/api/todos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newTodo),
      });

      const result = await response.json();

      if (result.success) {
        setTodos((prev) => [...prev, result.data]);
        setNewTodo({
          title: "",
          description: "",
          imageList: [],
          status: "pending",
        });
        setError("");
      } else {
        setError(result.message || "Failed to create todo");
      }
    } catch (error) {
      setError("Error connecting to the server");
    }
  };

  const updateTodo = async () => {
    setIsLoading(true);
    if (!selectedTodo.title.trim()) {
      setError("Title is required");
      return;
    }

    try {
      const response = await fetch(`/api/todos/${selectedId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(selectedTodo),
      });

      const result = await response.json();

      if (result.success) {
        setTodos((prev) =>
          prev.map((todo) => (todo._id === selectedId ? result.data : todo))
        );
        setNewTodo({
          title: "",
          description: "",
          imageList: [],
          status: "pending",
        });
        setError("");
      } else {
        setError(result.message || "Failed to create todo");
      }
      setIsLoading(false);
    } catch (error) {
      setError("Error connecting to the server");
      setIsLoading(false);
    }
  };

  // Submit form to create a new todo
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (isSelected) {
      await updateTodo();
    } else {
      await createTodo();
    }

    setError("");
    setIsLoading(false);
  };


  const handleTodoSelect = async (e, todoId) => {
    e.preventDefault();
    setSelectedId(todoId);
    await fetchTodo(todoId);
    setIsSelected(true);
    
    // Scroll to the appropriate config section after state updates
    setTimeout(() => {
      // Determine if we're on mobile or desktop view
      const isMobile = window.innerWidth < 768;
      const targetElementId = isMobile ? "todo-config" : "";
      const targetElement = document.getElementById(targetElementId);
      
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100); // Small delay to ensure state updates have completed
  };

  // Update todo status
  // const handleStatusChange = async (todoId, newStatus) => {
  //   try {
  //     const response = await fetch(`/api/todos/${todoId}`, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ status: newStatus }),
  //     });

  //     const result = await response.json();

  //     if (result.success) {
  //       setTodos((prev) =>
  //         prev.map((todo) => (todo._id === todoId ? result.data : todo))
  //       );
  //     }
  //   } catch (error) {
  //     setError("Error updating todo status");
  //   }
  // };

  const handleStatusChange = (status) => {
    if (isSelected) {
      // Update selected todo status
      setSelectedTodo({
        ...selectedTodo,
        status: status,
      });
    } else {
      // Update new todo status
      setNewTodo({
        ...newTodo,
        status: status,
      });
    }
  };

  // Delete a todo
  const handleDelete = async (e, todoId) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/todos/${todoId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        setTodos((prev) => prev.filter((todo) => todo._id !== todoId));
        setIsSelected(false);
        setError("");
        setIsLoading(false);
      }
    } catch (error) {
      setError("Error deleting todo");
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen fixed inset-0 bg-black/75 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-white">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Router will handle redirection
  }

  return (
    <div className="h-screen container mx-auto p-4">
      <div className="h-full grid grid-cols-3 gap-4">
        <div className="max-w-6xl col-span-3 lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900">My Todo List</h1>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
              <button
                className="float-right font-bold"
                onClick={() => setError("")}
              >
                &times;
              </button>
            </div>
          )}

          <div className="flex flex-col">
            <div
              onClick={() => {
                setIsSelected(false);
              }}
              className="flex flex-row justify-between border-b-1 border-gray-200 py-3 cursor-pointer hover:bg-gray-50 px-2"
            >
              <div className="flex justify-center items-center gap-3">
                <CircleFadingPlus size={24} color="gray" strokeWidth={1} />
                <div className="text-gray-500">Create Todo</div>
              </div>
              <ChevronRight size={24} color="grey" strokeWidth={1} />
            </div>
            {todos.map((todo) => (
              <div
                onClick={(e) => handleTodoSelect(e, todo._id)}
                key={todo._id}
                className="text-black flex flex-row justify-between border-b-1 border-gray-200 py-3 cursor-pointer hover:bg-gray-50 px-2"
              >
                <div className="flex justify-center items-center gap-3">
                  {todo.status === "pending" && (
                    <CircleDashed size={24} color="#99a1af" strokeWidth={1} />
                  )}
                  {todo.status === "in-progress" && (
                    <Clock size={24} color="#eab308" strokeWidth={1} />
                  )}
                  {todo.status === "completed" && (
                    <CheckCircle size={24} color="#10b981" strokeWidth={1} />
                  )}
                  <div className="text-gray-700">{todo.title}</div>
                </div>
                <ChevronRight size={24} color="grey" strokeWidth={1} />
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 col-span-3 lg:col-span-1" id="todo-config">
          <div className="text-2xl mb-4">
            {isSelected ? "Todo:" : "Add New Todo:"}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <input
                type="text"
                name="title"
                value={isSelected ? selectedTodo.title : newTodo.title}
                onChange={handleInputChange}
                className="appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Enter todo title"
                required
              />
            </div>

            <div className="mb-4">
              <TextareaAutosize
                name="description"
                value={
                  isSelected ? selectedTodo.description : newTodo.description
                }
                onChange={handleInputChange}
                className="appearance-none border border-gray-200 rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Description"
                minRows={3}
              />
            </div>

            <div className="mb-4">
              {/* Image List Preview */}
              <div className="mt-2 flex flex-wrap gap-4">
                {(isSelected ? selectedTodo.imageList : newTodo.imageList)
                  ?.length > 0 &&
                  (isSelected ? selectedTodo.imageList : newTodo.imageList).map(
                    (img, index) => (
                      <div key={index} className="relative">
                        <div className="w-32 h-32 relative">
                          <Image
                            src={img}
                            alt={`Image ${index + 1}`}
                            fill
                            className="object-cover rounded-md cursor-pointer"
                            onClick={() => handleImageClick(img)}
                            onError={(e) => {
                              e.target.src = "/placeholder-image.jpg";
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs cursor-pointer hover:scale-115 transition-all"
                        >
                          &times;
                        </button>
                      </div>
                    )
                  )}
                <div className="flex items-center gap-2 mb-2 w-32 h-32">
                  <label className="flex flex-col justify-center w-full h-full items-center gap-2 cursor-pointer border border-gray-200 rounded-sm p-2">
                    <ImagePlus
                      className="text-gray-600"
                      size={28}
                      strokeWidth={1.2}
                    />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="text-sm hidden" // Hide the default input, let the icon act as the button
                    />
                    <span className="text-sm">
                      {uploading ? "Uploading..." : "Add a photo"}
                    </span>
                  </label>
                  {/* {uploading && (
                    <p className="text-blue-500 text-sm">Uploading...</p>
                  )} */}
                </div>
              </div>
            </div>

            <div className="mb-8">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleStatusChange("pending")}
                  className={`py-2 px-3 md:px-4 rounded flex items-center space-x-1 md:space-x-2 flex-1 md:flex-none justify-center ${
                    (isSelected ? selectedTodo.status : newTodo.status) ===
                    "pending"
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <CircleDashed className="w-4 h-4" />
                  <span className="text-sm md:text-base">Pending</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("in-progress")}
                  className={`py-2 px-3 md:px-4 rounded flex items-center space-x-1 md:space-x-2 flex-1 md:flex-none justify-center ${
                    (isSelected ? selectedTodo.status : newTodo.status) ===
                    "in-progress"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="text-sm md:text-base">In Progress</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusChange("completed")}
                  className={`py-2 px-3 md:px-4 rounded flex items-center space-x-1 md:space-x-2 flex-1 md:flex-none justify-center ${
                    (isSelected ? selectedTodo.status : newTodo.status) ===
                    "completed"
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm md:text-base">Completed</span>
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              {isSelected && (
                <button
                  onClick={(e) => handleDelete(e, selectedTodo._id)}
                  className="bg-red-100 text-red-600 hover:bg-red-200 px-3 py-1 rounded-md text-sm"
                >
                  Delete
                </button>
              )}

              <button
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                {isSelected ? "Update Todo" : "Create Todo"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/75 flex justify-center items-center z-50 p-4">
          <div className="relative bg-white rounded-lg shadow-xl max-w-4xl w-full mx-auto overflow-hidden">
            <button
              className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full z-10 cursor-pointer hover:scale-115 transition-all"
              onClick={handleCloseModal}
              aria-label="Close modal"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            <div className="p-2 sm:p-4 flex justify-center">
              <div className="relative w-full aspect-auto">
                <Image
                  src={selectedImage}
                  alt="Full-size image"
                  className="object-contain max-h-[80vh]"
                  layout="responsive"
                  width={1200}
                  height={800}
                  priority
                  onError={(e) => {
                    e.target.src = "/placeholder-image.jpg";
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
