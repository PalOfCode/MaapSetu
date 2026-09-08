import { useState } from "react";
import type { ReactNode } from "react";
import {
  Bot,
  MessageCircle,
  Send,
  X,
  ShieldCheck,
  FileText,
  Building2,
  CalendarDays,
} from "lucide-react";

type Message = {
  id: number;
  sender: "bot" | "user";
  text: string;
};

const API_BASE = "http://localhost:5000";

function renderInlineMarkdown(text: string): ReactNode[] {
  const normalized = text
    .replace(/\s+\*\s+(?=\*\*[^*]+\*\*)/g, "\n")
    .replace(/\s+•\s+/g, "\n")
    .replace(/\s+-\s+(?=\*\*[^*]+\*\*)/g, "\n");

  const parts = normalized.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return parts.map((part, index) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={index} className="font-bold text-slate-900">
          {part.slice(2, -2)}
        </strong>
      );
    }

    if (/^`[^`]+`$/.test(part)) {
      return (
        <code
          key={index}
          className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-green-700"
        >
          {part.slice(1, -1)}
        </code>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

function FormattedBotMessage({ text }: { text: string }) {
  const normalizedText = text
    .replace(/\r\n/g, "\n")
    .replace(/\s+\*\s+(?=\*\*[^*]+\*\*)/g, "\n")
    .replace(/\s+•\s+/g, "\n")
    .replace(/\s+-\s+(?=\*\*[^*]+\*\*)/g, "\n");

  const lines = normalizedText.split("\n");
  const blocks: ReactNode[] = [];
  let bulletItems: string[] = [];
  let numberedItems: string[] = [];

  const flushLists = () => {
    if (bulletItems.length) {
      blocks.push(
        <ul
          key={`bullets-${blocks.length}`}
          className="my-2 list-disc space-y-1.5 pl-5"
        >
          {bulletItems.map((item, index) => (
            <li key={index}>{renderInlineMarkdown(item)}</li>
          ))}
        </ul>
      );
      bulletItems = [];
    }

    if (numberedItems.length) {
      blocks.push(
        <ol
          key={`numbers-${blocks.length}`}
          className="my-2 list-decimal space-y-1.5 pl-5"
        >
          {numberedItems.map((item, index) => (
            <li key={index}>{renderInlineMarkdown(item)}</li>
          ))}
        </ol>
      );
      numberedItems = [];
    }
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trim();

    if (!line) {
      flushLists();
      return;
    }

    const bulletMatch = line.match(/^(?:[-*•])\s+(.+)$/);
    if (bulletMatch) {
      if (numberedItems.length) flushLists();
      bulletItems.push(bulletMatch[1]);
      return;
    }

    const numberedMatch = line.match(/^\d+[.)]\s+(.+)$/);
    if (numberedMatch) {
      if (bulletItems.length) flushLists();
      numberedItems.push(numberedMatch[1]);
      return;
    }

    flushLists();

    const headingMatch = line.match(/^#{1,3}\s+(.+)$/);
    if (headingMatch) {
      blocks.push(
        <p
          key={`heading-${blocks.length}`}
          className="mt-2 mb-1 font-bold text-slate-900"
        >
          {renderInlineMarkdown(headingMatch[1])}
        </p>
      );
      return;
    }

    blocks.push(
      <p key={`paragraph-${blocks.length}`} className="mb-2 last:mb-0">
        {renderInlineMarkdown(line)}
      </p>
    );
  });

  flushLists();
  return <>{blocks}</>;
}

function MaapSetuChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      text:
        "Hello! 👋 I am MaapSetu Assistant. How can I help you today?",
    },
  ]);

  const quickQuestions = [
    {
      label: "Verify Certificate",
      icon: <ShieldCheck size={15} />,
      answer:
        "You can verify a certificate by opening the Verify Certificate page and searching using Business Name and Instrument Type, or by scanning the QR code.",
    },
    {
      label: "Register Instrument",
      icon: <FileText size={15} />,
      answer:
        "To register an instrument, use the Business Registration section and submit the required instrument and business details.",
    },
    {
      label: "Application Status",
      icon: <Building2 size={15} />,
      answer:
        "You can track your application status from the Application Tracking section after logging into your account.",
    },
    {
      label: "Appointment",
      icon: <CalendarDays size={15} />,
      answer:
        "Appointments can be viewed and managed from the appointment section of the portal.",
    },
  ];

  const addBotMessage = (text: string) => {
    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        sender: "bot",
        text,
      },
    ]);
  };

  const sendMessage = async () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) return;

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
    };

    setMessages((previous) => [...previous, userMessage]);
    setMessage("");

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmedMessage }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to get AI response.");
      }

      addBotMessage(data.reply || "Sorry, I could not generate a response.");
    } catch (error) {
      console.error("Chatbot request error:", error);
      addBotMessage(
        "Sorry, I am unable to connect to the MaapSetu AI assistant right now. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickQuestion = async (
    question: (typeof quickQuestions)[number]
  ) => {
    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: question.label,
    };

    setMessages((previous) => [...previous, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: question.label }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Unable to get AI response.");
      }

      addBotMessage(data.reply || "Sorry, I could not generate a response.");
    } catch (error) {
      console.error("Quick question error:", error);
      addBotMessage(
        "Sorry, I am unable to connect to the MaapSetu AI assistant right now. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <>
      {/* =========================================
          CHAT BUTTON
      ========================================= */}

      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open MaapSetu Assistant"
          className="
            fixed
            bottom-5
            right-5
            z-[9999]
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            bg-green-700
            text-white
            shadow-2xl
            transition
            hover:scale-105
            hover:bg-green-800
            active:scale-95
            sm:bottom-6
            sm:right-6
            sm:h-16
            sm:w-16
          "
        >
          <MessageCircle size={27} />

          <span
            className="
              absolute
              right-0
              top-0
              h-3.5
              w-3.5
              rounded-full
              border-2
              border-white
              bg-green-400
            "
          />
        </button>
      )}

      {/* =========================================
          CHAT WINDOW
      ========================================= */}

      {isOpen && (
        <div
          className="
            fixed
            bottom-4
            left-4
            right-4
            z-[9999]
            flex
            h-[min(680px,calc(100vh-32px))]
            flex-col
            overflow-hidden
            rounded-2xl
            border
            border-slate-200
            bg-white
            shadow-2xl
            sm:left-auto
            sm:right-6
            sm:bottom-6
            sm:h-[600px]
            sm:w-[390px]
          "
        >

          {/* =====================================
              CHAT HEADER
          ===================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              justify-between
              bg-green-700
              px-4
              py-4
              text-white
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-white
                  text-green-700
                "
              >
                <Bot size={22} />
              </div>

              <div>

                <p className="font-bold">
                  MaapSetu Assistant
                </p>

                <div className="flex items-center gap-1.5">

                  <span className="h-2 w-2 rounded-full bg-green-300" />

                  <span className="text-xs text-green-50">
                    Online
                  </span>

                </div>

              </div>

            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label="Close chatbot"
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                text-white
                transition
                hover:bg-green-800
              "
            >
              <X size={21} />
            </button>

          </div>

          {/* =====================================
              MESSAGES
          ===================================== */}

          <div
            className="
              flex-1
              overflow-y-auto
              bg-slate-50
              px-4
              py-4
            "
          >

            <div className="space-y-4">

              {messages.map((item) => (
                <div
                  key={item.id}
                  className={`flex ${
                    item.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >

                  <div
                    className={`
                      max-w-[90%]
                      rounded-2xl
                      px-4
                      py-3
                      text-sm
                      leading-6
                      ${
                        item.sender === "user"
                          ? "rounded-br-md bg-green-700 text-white whitespace-pre-wrap"
                          : "rounded-bl-md bg-white text-slate-700 shadow-sm border border-slate-200"
                      }
                    `}
                  >
                    {item.sender === "bot" ? (
                      <div className="space-y-1">
                        {FormattedBotMessage({ text: item.text })}
                      </div>
                    ) : (
                      item.text
                    )}
                  </div>

                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
                    <div className="flex items-center gap-1.5" aria-label="Assistant is typing">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-green-600 [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-green-600 [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-green-600" />
                    </div>
                  </div>
                </div>
              )}

            </div>

          </div>

          {/* =====================================
              QUICK QUESTIONS
          ===================================== */}

          <div
            className="
              shrink-0
              border-t
              border-slate-200
              bg-white
              px-3
              py-3
            "
          >

            <p className="mb-2 px-1 text-[11px] font-semibold text-slate-500">
              Quick Questions
            </p>

            <div
              className="
                flex
                gap-2
                overflow-x-auto
                pb-1
              "
            >

              {quickQuestions.map((question) => (
                <button
                  key={question.label}
                  type="button"
                  onClick={() =>
                    handleQuickQuestion(question)
                  }
                  className="
                    flex
                    shrink-0
                    items-center
                    gap-1.5
                    rounded-full
                    border
                    border-green-200
                    bg-green-50
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-green-700
                    transition
                    hover:bg-green-100
                  "
                >
                  {question.icon}
                  {question.label}
                </button>
              ))}

            </div>

          </div>

          {/* =====================================
              INPUT
          ===================================== */}

          <div
            className="
              flex
              shrink-0
              items-center
              gap-2
              border-t
              border-slate-200
              bg-white
              p-3
            "
          >

            <input
              type="text"
              value={message}
              onChange={(event) =>
                setMessage(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendMessage();
                }
              }}
              placeholder={isLoading ? "Assistant is typing..." : "Ask MaapSetu Assistant..."}
              className="
                min-w-0
                flex-1
                rounded-xl
                border
                border-slate-300
                px-4
                py-3
                text-sm
                text-slate-900
                outline-none
                transition
                placeholder:text-slate-400
                focus:border-green-600
                focus:ring-2
                focus:ring-green-100
              "
            />

            <button
              type="button"
              onClick={sendMessage}
              disabled={!message.trim() || isLoading}
              aria-label="Send message"
              className="
                flex
                h-11
                w-11
                shrink-0
                items-center
                justify-center
                rounded-xl
                bg-green-700
                text-white
                transition
                hover:bg-green-800
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <Send size={18} />
            </button>

          </div>

        </div>
      )}
    </>
  );
}

export default MaapSetuChatbot;