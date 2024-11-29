import { useCallback, useEffect, useState } from "react";
import Quill from "quill";
import "quill/dist/quill.snow.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

const SAVE_INTERVAL_MS = 2000;
const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];

export default function TextEditor() {
  const { id: documentId } = useParams();
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);
  const [roomUrl, setRoomUrl] = useState("");  // For displaying room URL

  // Setup socket connection
  useEffect(() => {
    const s = io("http://localhost:3001");  // Ensure URL is dynamic for production
    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  // Initialize Quill editor
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;

    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);

    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  // Load document content from the server
  useEffect(() => {
    if (socket == null || quill == null) return;

    socket.on("load-document", (document) => {
      quill.setContents(document); // Assuming 'document' is a Delta object
      quill.enable();
    });

    socket.emit("get-document", documentId);  // Request document content
  }, [socket, quill, documentId]);

  // Save document periodically
  useEffect(() => {
    if (socket == null || quill == null) return;

    const interval = setInterval(() => {
      socket.emit("save-document", quill.getContents());
    }, SAVE_INTERVAL_MS);

    return () => {
      clearInterval(interval);
    };
  }, [socket, quill]);

  // Receive changes from other clients
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta) => {
      quill.updateContents(delta);  // Apply changes to the editor
    };

    socket.on("receive-changes", handler);

    return () => {
      socket.off("receive-changes", handler);  // Cleanup on unmount
    };
  }, [socket, quill]);

  // Send changes to the server
  useEffect(() => {
    if (socket == null || quill == null) return;

    const handler = (delta, oldDelta, source) => {
      if (source !== "user") return;  // Only send user-generated changes
      socket.emit("send-changes", delta);  // Emit changes to the server
    };

    quill.on("text-change", handler);

    return () => {
      quill.off("text-change", handler);  // Cleanup on unmount
    };
  }, [socket, quill]);

  // Display the room URL dynamically
  useEffect(() => {
    setRoomUrl(`${window.location.origin}/documents/${documentId}`);
  }, [documentId]);

  return (
    <div className="container">
      {/* Display the room URL */}
      <div className="room-url">
        <p>Room URL: <a href={roomUrl} target="_blank" rel="noopener noreferrer">{roomUrl}</a></p>
      </div>

      <div ref={wrapperRef}></div>
    </div>
  );
}
