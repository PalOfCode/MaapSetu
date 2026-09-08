import { useState } from "react";
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

function MaapSetuChatbot() {
  const [isOpen, setIsOpen] = useState(false);

  const [message, setMessage] = useState("");

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

  const sendMessage = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage) {
      return;
    }

    const userMessage: Message = {
      id: Date.now(),
      sender: "user",
      text: trimmedMessage,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setMessage("");

    const lowerMessage = trimmedMessage.toLowerCase();

    setTimeout(() => {
      if (
        lowerMessage.includes("certificate") ||
        lowerMessage.includes("verify")
      ) {
        addBotMessage(
          "You can verify a certificate using the Verify Certificate page. You can search by Business Name and Instrument Type or scan the certificate QR code."
        );
        return;
      }

      if (
        lowerMessage.includes("register") ||
        lowerMessage.includes("instrument")
      ) {
        addBotMessage(
          "For instrument registration, please open Business Registration and submit the required business and instrument information."
        );
        return;
      }

      if (
        lowerMessage.includes("application") ||
        lowerMessage.includes("status")
      ) {
        addBotMessage(
          "You can track your application from the Application Tracking section after logging in."
        );
        return;
      }

      if (
        lowerMessage.includes("appointment") ||
        lowerMessage.includes("schedule")
      ) {
        addBotMessage(
          "You can view and manage your verification appointments from the Appointments section."
        );
        return;
      }

      if (
        lowerMessage.includes("hello") ||
        lowerMessage.includes("hi") ||
        lowerMessage.includes("hey")
      ) {
        addBotMessage(
          "Hello! 👋 Welcome to MaapSetu. I can help you with certificate verification, instrument registration, applications and appointments."
        );
        return;
      }

      addBotMessage(
        "I can currently help you with Certificate Verification, Instrument Registration, Application Status and Appointments. Please choose one of the options below or ask your question."
      );
    }, 500);
  };

  const handleQuickQuestion = (question: (typeof quickQuestions)[number]) => {
    setMessages((previous) => [
      ...previous,
      {
        id: Date.now(),
        sender: "user",
        text: question.label,
      },
    ]);

    setTimeout(() => {
      addBotMessage(question.answer);
    }, 400);
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
                      max-w-[85%]
                      rounded-2xl
                      px-4
                      py-3
                      text-sm
                      leading-6
                      ${
                        item.sender === "user"
                          ? "rounded-br-md bg-green-700 text-white"
                          : "rounded-bl-md bg-white text-slate-700 shadow-sm border border-slate-200"
                      }
                    `}
                  >
                    {item.text}
                  </div>

                </div>
              ))}

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
              placeholder="Ask MaapSetu Assistant..."
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
              disabled={!message.trim()}
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