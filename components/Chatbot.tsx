'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useLang } from '@/lib/context/LangContext';
import styles from './Chatbot.module.css';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
}

export default function Chatbot() {
  const { t } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleDismissed, setBubbleDismissed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Show greeting bubble after 1.5s persistently until dismissed or opened
  useEffect(() => {
    const showTimer = setTimeout(() => {
      if (!bubbleDismissed) setShowBubble(true);
    }, 1500);
    return () => clearTimeout(showTimer);
  }, [bubbleDismissed]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 0,
        role: 'assistant',
        content: t.chatbot.greeting,
      }]);
    }
  }, [isOpen, messages.length, t.chatbot.greeting]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowBubble(false);
    setBubbleDismissed(true);
  };

  const handleClose = () => setIsOpen(false);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isLoading) return;

    const userMsg: Message = { id: Date.now(), role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.content,
      }]);
    } catch {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: t.chatbot.errorMsg,
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Speech bubble */}
      {showBubble && !isOpen && (
        <div className={styles.bubble} onClick={handleOpen}>
          <div className={styles.bubbleContent}>
            <div className={styles.bubbleHeader}>
              <span className={styles.bubbleBadge}>Cytech-AI</span>
              <button
                className={styles.bubbleDismiss}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBubble(false);
                  setBubbleDismissed(true);
                }}
                aria-label="Close message"
              >
                ×
              </button>
            </div>
            <span className={styles.bubbleText}>
              Halo! Ada yang ingin kamu tanyakan seputar CyberTech PNP? 💬
            </span>
          </div>
          <div className={styles.bubbleTail} />
        </div>
      )}

      {/* Chat panel */}
      {isOpen && (
        <div className={styles.panel}>
          {/* Header */}
          <div className={styles.header}>
            <div className={styles.headerInfo}>
              <div className={styles.avatarSmall}>
                <Image
                  src="/images/primary/maskot.png"
                  alt="CytechAI"
                  width={32}
                  height={32}
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <div>
                <p className={styles.botName}>{t.chatbot.title}</p>
                <p className={styles.botSub}>{t.chatbot.subtitle}</p>
              </div>
            </div>
            <button
              className={styles.closeBtn}
              onClick={handleClose}
              aria-label="Close chat"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className={styles.messages}>
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`${styles.message} ${msg.role === 'user' ? styles.messageUser : styles.messageBot}`}
              >
                {msg.role === 'assistant' && (
                  <div className={styles.botAvatar}>
                    <Image
                      src="/images/primary/maskot.png"
                      alt="CytechAI"
                      width={28}
                      height={28}
                      style={{ objectFit: 'contain' }}
                    />
                  </div>
                )}
                <div className={styles.bubble2}>
                  {msg.content.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.content.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className={`${styles.message} ${styles.messageBot}`}>
                <div className={styles.botAvatar}>
                  <Image
                    src="/images/primary/maskot.png"
                    alt="CytechAI"
                    width={28}
                    height={28}
                    style={{ objectFit: 'contain' }}
                    className={styles.blinking}
                  />
                </div>
                <div className={styles.bubble2}>
                  <div className={styles.typingDots}>
                    <span /><span /><span />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputArea}>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t.chatbot.placeholder}
              className={styles.input}
              disabled={isLoading}
              maxLength={500}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              aria-label={t.chatbot.send}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating trigger button */}
      {!isOpen && (
        <button
          className={styles.trigger}
          onClick={handleOpen}
          aria-label="Open CytechAI chat"
        >
          <div className={styles.triggerInner}>
            <Image
              src="/images/primary/maskot.png"
              alt="CytechAI"
              width={44}
              height={44}
              style={{ objectFit: 'contain' }}
            />
          </div>
          {/* Pulse rings */}
          <div className={styles.pulse1} />
          <div className={styles.pulse2} />
        </button>
      )}
    </div>
  );
}
