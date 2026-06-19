import { useState, useRef } from "react";
import { useMessagesStore } from "../Store/messagesStore";
import { Send, Image, X } from "lucide-react";

const MessageInput = () => {
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { sendMessage, sendMessageLoading, error } = useMessagesStore();
  const fileInputRef = useRef(null);
    
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if ((!text.trim() && !imageBase64) || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await sendMessage({ text: text.trim(), image: imageBase64 || undefined });
      setText("");
      setImagePreview(null);
      setImageBase64(null);
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4 w-full bg-white border-t border-gray-100 flex flex-col gap-2">
      {imagePreview && (
        <div className="relative inline-block max-w-[120px] rounded-lg overflow-hidden border border-gray-200">
          <img src={imagePreview} alt="preview" className="h-20 w-20 object-cover" />
          <button
            onClick={() => {
              setImagePreview(null);
              setImageBase64(null);
            }}
            className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
      <form onSubmit={handleSendMessage} className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          title="Send image"
        >
          <Image size={20} />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageChange}
        />
        <input
          type="text"
          className="w-full bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-xl px-4 py-2 text-sm transition-all"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={isSubmitting || sendMessageLoading}
        />
        <button 
          type="submit" 
          className={`p-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl transition-all shadow-sm flex items-center justify-center ${
            (!text.trim() && !imageBase64) || isSubmitting || sendMessageLoading ? 'opacity-50 cursor-not-allowed' : ''
          }`} 
          disabled={(!text.trim() && !imageBase64) || isSubmitting || sendMessageLoading}
        >
          <Send size={18} />
        </button>
      </form>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

export default MessageInput;
