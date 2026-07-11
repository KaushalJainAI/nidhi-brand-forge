import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bot, User, Send, Mic, MicOff, X, Loader2,
  ArrowRight, ShoppingCart, Plus, ChevronLeft, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  assistantAPI, AssistantReply, ProposedAction, ConversationSummary, ChatMessage,
} from "@/lib/api/assistant";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useVoiceInput } from "@/hooks/useVoiceInput";
import ChatMarkdown from "@/components/ChatMarkdown";
import { useTranslation } from "react-i18next";

// ─── Types ────────────────────────────────────────────────────────────────────

interface LocalTurn {
  role: "user" | "assistant" | "admin";
  text: string;
  senderName?: string;
  action?: ProposedAction | null;
}

const stripMarkdown = (s: string) =>
  s.replace(/[*_`#]/g, "").replace(/^\s*[-•]\s+/gm, "");

// ─── Component ────────────────────────────────────────────────────────────────

const AssistantWidget = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const LANGUAGES = [
    { code: "auto", label: t('assistant.langAuto') },
    { code: "en",   label: "English" },
    { code: "hi",   label: "हिन्दी" },
    { code: "hinglish", label: "Hinglish" },
    { code: "gu",   label: "ગુજરાતી" },
    { code: "mr",   label: "मराठी" },
    { code: "pa",   label: "ਪੰਜਾਬੀ" },
  ];

  const GREETING: LocalTurn = {
    role: "assistant",
    text: t('assistant.greeting'),
  };

  const relativeTime = (iso: string) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return t('assistant.justNow');
    if (m < 60) return t('assistant.minutesAgo', { count: m });
    const h = Math.floor(m / 60);
    if (h < 24) return t('assistant.hoursAgo', { count: h });
    return t('assistant.daysAgo', { count: Math.floor(h / 24) });
  };

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<"threads" | "chat">("chat");
  const [voiceMode, setVoiceMode] = useState(false);
  const [input, setInput] = useState("");
  const [turns, setTurns] = useState<LocalTurn[]>([GREETING]);
  const [activeConvId, setActiveConvId] = useState<string | null>(
    () => localStorage.getItem("assistant_conversation_id")
  );
  const [language, setLanguage] = useState<string>(
    () => localStorage.getItem("assistant_lang") || localStorage.getItem("site_lang") || "auto"
  );

  const endRef = useRef<HTMLDivElement>(null);
  const didLoadOnOpen = useRef(false);

  // Refs let the voice hook's onTranscript reach the latest `send`/`voiceMode`
  // without re-creating the hook (which would churn the external-open effect).
  const voiceModeRef = useRef(voiceMode);
  voiceModeRef.current = voiceMode;
  const sendRef = useRef<(text: string) => void>(() => {});

  const { supported: voiceSupported, recording, transcribing, start, stop } = useVoiceInput(
    (text) => {
      setInput(text);
      if (voiceModeRef.current) sendRef.current(text);
    },
    () => language
  );

  // ── Thread list (only when logged in) ─────────────────────────────────────
  const { data: threads = [] } = useQuery<ConversationSummary[]>({
    queryKey: ["assistant-threads"],
    queryFn: assistantAPI.listConversations,
    enabled: !!user && open,
    refetchInterval: open ? 8000 : false,
  });

  // ── Open widget from outside (MobileFooter, WhatsApp, etc.) ───────────────
  useEffect(() => {
    const handler = (e: Event) => {
      // The assistant is login-only (the backend rejects anonymous chat), so an
      // external trigger from a logged-out user must route to login, not open.
      if (!user) {
        navigate("/login");
        return;
      }
      setOpen(true);
      const detail = (e as CustomEvent).detail;
      if (detail?.voice && voiceSupported) {
        setVoiceMode(true);
        setTimeout(() => start(), 300);
      }
      // Pre-seed the input (e.g. opened from an order's "Chat Support" button).
      if (detail?.seed) {
        setView("chat");
        setInput(detail.seed);
      }
    };
    window.addEventListener("assistant:open", handler);
    return () => window.removeEventListener("assistant:open", handler);
  }, [voiceSupported, start, user, navigate]);

  useEffect(() => {
    if (open) endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, open, view]);

  // ── Load a thread's history from the server ────────────────────────────────
  const loadThread = useCallback(async (convId: string) => {
    try {
      const msgs: ChatMessage[] = await assistantAPI.getMessages(convId);
      const loaded: LocalTurn[] = msgs
        .filter((m) => m.role !== "tool" && m.role !== "system" && m.content)
        .map((m) => ({
          role: m.role as LocalTurn["role"],
          text: m.content,
          senderName: m.sender_name || undefined,
        }));
      setTurns(loaded.length ? loaded : [GREETING]);
    } catch {
      setTurns([GREETING]);
    }
  }, []);

  // ── Restore the active thread's history when the widget is (re)opened ──────
  // Without this, reopening shows only the greeting while messages silently
  // continue appending to the existing server-side thread.
  useEffect(() => {
    if (!open) {
      didLoadOnOpen.current = false;
      return;
    }
    if (user && activeConvId && !didLoadOnOpen.current) {
      didLoadOnOpen.current = true;
      loadThread(activeConvId);
    }
  }, [open, user, activeConvId, loadThread]);

  // ── Switch to a thread ─────────────────────────────────────────────────────
  const switchThread = useCallback(
    (convId: string) => {
      setActiveConvId(convId);
      localStorage.setItem("assistant_conversation_id", convId);
      setView("chat");
      loadThread(convId);
    },
    [loadThread]
  );

  // ── New thread ─────────────────────────────────────────────────────────────
  const newThreadMutation = useMutation({
    mutationFn: assistantAPI.createConversation,
    onSuccess: (convo) => {
      queryClient.invalidateQueries({ queryKey: ["assistant-threads"] });
      setActiveConvId(convo.conversation_id);
      localStorage.setItem("assistant_conversation_id", convo.conversation_id);
      setTurns([GREETING]);
      setView("chat");
    },
  });

  // ── Chat send ──────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: (message: string) =>
      assistantAPI.chat(message, activeConvId, language),
    onSuccess: (data: AssistantReply) => {
      setActiveConvId(data.conversation_id);
      localStorage.setItem("assistant_conversation_id", data.conversation_id);
      setTurns((prev) => [
        ...prev,
        { role: "assistant", text: data.reply, action: data.proposed_action },
      ]);
      queryClient.invalidateQueries({ queryKey: ["assistant-threads"] });
      if (voiceMode && "speechSynthesis" in window && data.reply) {
        try {
          window.speechSynthesis.speak(
            new SpeechSynthesisUtterance(stripMarkdown(data.reply))
          );
        } catch { /* noop */ }
      }
    },
    onError: () => {
      setTurns((prev) => [
        ...prev,
        { role: "assistant", text: t('assistant.error') },
      ]);
    },
  });

  const send = useCallback(
    (raw: string) => {
      const message = raw.trim();
      if (!message || mutation.isPending) return;
      setTurns((prev) => [...prev, { role: "user", text: message }]);
      setInput("");
      mutation.mutate(message);
    },
    [mutation]
  );

  // Expose the latest `send` to the voice hook's onTranscript callback.
  sendRef.current = send;

  const handleAction = async (action: ProposedAction) => {
    switch (action.type) {
      case "add_to_cart": {
        const res = await addToCart({
          id: action.product_id!,
          itemType: action.item_type || "product",
          name: "", image: "", price: 0,
          quantity: action.quantity || 1,
        });
        if (res.requiresLogin) navigate("/login");
        break;
      }
      case "checkout":
      case "navigate":
        if (action.route) { setOpen(false); navigate(action.route); }
        break;
      case "escalate_to_human":
        toast.info(t('assistant.escalated'));
        break;
    }
  };

  const toggleMic = () => {
    if (!voiceSupported) {
      toast.error(t('assistant.voiceUnsupported'));
      return;
    }
    if (recording) { stop(); } else { setVoiceMode(true); start(); }
  };

  // ── Launcher button ───────────────────────────────────────────────────────
  // Desktop only — on mobile the bottom nav's "Chat" button opens the assistant
  // (via the `assistant:open` event), so a second floating launcher is hidden to
  // avoid duplicate chat buttons.
  if (!open) {
    return (
      <Button
        onClick={() => (user ? setOpen(true) : navigate("/login"))}
        className="hidden md:flex fixed right-6 bottom-6 h-16 w-16 rounded-full shadow-lg hover:shadow-xl
                   transition-all duration-300 z-50 text-3xl leading-none
                   animate-pulse-subtle hover:scale-110 active:scale-95 hover-glow"
        aria-label={t('assistant.openAria')}
      >
        <span aria-hidden>💬</span>
      </Button>
    );
  }

  // ── Panel ──────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed right-4 z-50 md:bottom-6 bottom-52 w-[calc(100vw-2rem)] sm:w-96
                 h-[72vh] sm:h-[36rem] max-h-[640px] flex flex-col
                 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden
                 animate-page-enter"
    >
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b bg-primary text-primary-foreground shrink-0">
        {view === "chat" && user && (
          <button
            onClick={() => setView("threads")}
            aria-label={t('assistant.threadListAria')}
            className="opacity-80 hover:opacity-100 mr-1"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}
        <Bot className="h-5 w-5 shrink-0" />
        <span className="font-semibold text-sm flex-1 truncate">
          {view === "threads" ? t('assistant.yourConversations') : t('assistant.title')}
        </span>

        {view === "chat" && (
          <Select
            value={language}
            onValueChange={(v) => {
              setLanguage(v);
              localStorage.setItem("assistant_lang", v);
            }}
          >
            <SelectTrigger
              aria-label={t('assistant.replyLanguageAria')}
              className="h-7 w-[104px] text-xs bg-primary-foreground/10 border-primary-foreground/25 text-primary-foreground focus:ring-primary-foreground/40"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((l) => (
                <SelectItem key={l.code} value={l.code}>{l.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {view === "chat" && user && (
          <button
            onClick={() => newThreadMutation.mutate()}
            aria-label={t('assistant.newConversation')}
            className="opacity-80 hover:opacity-100"
            title={t('assistant.newChat')}
          >
            <Plus className="h-5 w-5" />
          </button>
        )}

        <button onClick={() => setOpen(false)} aria-label={t('assistant.close')} className="opacity-80 hover:opacity-100">
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* ── Thread list view ────────────────────────────────────────────────── */}
      {view === "threads" && (
        <div className="flex-1 overflow-y-auto">
          <button
            onClick={() => newThreadMutation.mutate()}
            className="w-full flex items-center gap-3 px-4 py-3 border-b hover:bg-accent transition-colors text-sm font-medium text-primary"
          >
            <Plus className="h-4 w-4" />
            {t('assistant.newConversation')}
          </button>

          {threads.length === 0 && (
            <p className="text-center text-muted-foreground text-sm mt-8 px-4">
              {t('assistant.noConversations')}
            </p>
          )}

          {threads.map((thread) => (
            <button
              key={thread.conversation_id}
              onClick={() => switchThread(thread.conversation_id)}
              className={`w-full text-left px-4 py-3 border-b hover:bg-accent transition-colors
                ${activeConvId === thread.conversation_id ? "bg-accent" : ""}`}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium truncate flex-1">
                  {thread.title || t('assistant.newConversation')}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  {thread.needs_human && (
                    <span className="h-2 w-2 rounded-full bg-orange-500" title={t('assistant.needsAttention')} />
                  )}
                  <span className="text-xs text-muted-foreground">{relativeTime(thread.updated_at)}</span>
                </div>
              </div>
              {thread.last_message && (
                <p className="text-xs text-muted-foreground truncate mt-0.5">{thread.last_message}</p>
              )}
            </button>
          ))}
        </div>
      )}

      {/* ── Chat view ───────────────────────────────────────────────────────── */}
      {view === "chat" && (
        <>
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {turns.map((turn, i) => {
              const isUser = turn.role === "user";
              const isAdmin = turn.role === "admin";

              return (
                <div key={i} className={`flex items-start gap-2 ${isUser ? "flex-row-reverse" : ""}`}>
                  {/* Avatar */}
                  <div className={`p-1.5 rounded-full shrink-0 ${
                    isUser
                      ? "bg-primary text-primary-foreground"
                      : isAdmin
                        ? "bg-orange-500 text-white"
                        : "bg-accent text-accent-foreground"
                  }`}>
                    {isUser
                      ? <User className="h-4 w-4" />
                      : isAdmin
                        ? <Shield className="h-4 w-4" />
                        : <Bot className="h-4 w-4" />
                    }
                  </div>

                  {/* Bubble */}
                  <div className="max-w-[80%] space-y-2">
                    {isAdmin && turn.senderName && (
                      <p className="text-xs text-orange-600 font-medium px-1">
                        {t('assistant.teamMember', { name: turn.senderName })}
                      </p>
                    )}
                    <div className={`px-3 py-2 rounded-lg text-sm ${
                      isUser
                        ? "bg-primary text-primary-foreground whitespace-pre-wrap"
                        : isAdmin
                          ? "bg-orange-50 border border-orange-200 text-foreground"
                          : "bg-muted"
                    }`}>
                      {isUser
                        ? turn.text
                        : <ChatMarkdown text={turn.text} />
                      }
                    </div>
                    {turn.action && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="gap-1.5"
                        onClick={() => handleAction(turn.action!)}
                      >
                        {turn.action.type === "add_to_cart"
                          ? <ShoppingCart className="h-4 w-4" />
                          : <ArrowRight className="h-4 w-4" />
                        }
                        {turn.action.label}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}

            {mutation.isPending && (
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Bot className="h-4 w-4" />
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="p-3 border-t flex items-center gap-2 shrink-0"
          >
            {voiceSupported && (
              <Button
                type="button"
                size="icon"
                variant={recording ? "default" : "outline"}
                onClick={toggleMic}
                disabled={transcribing}
                aria-label={recording ? t('assistant.stopListening') : t('assistant.speak')}
                className={recording ? "animate-pulse" : ""}
              >
                {transcribing
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : recording
                    ? <MicOff className="h-4 w-4" />
                    : <Mic className="h-4 w-4" />}
              </Button>
            )}
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                recording ? t('assistant.listening') : transcribing ? t('assistant.transcribing') : t('assistant.inputPlaceholder')
              }
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || mutation.isPending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </>
      )}
    </div>
  );
};

export default AssistantWidget;
