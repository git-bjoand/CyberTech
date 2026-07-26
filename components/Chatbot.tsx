'use client';

import React, { useState, useRef, useEffect } from 'react';
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

  // Helper to render bolding (**text**) and line breaks cleanly
  const renderFormattedText = (content: string) => {
    return content.split('\n').map((line, lineIdx) => {
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, partIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={partIdx}>{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <React.Fragment key={lineIdx}>
          {formattedLine}
          {lineIdx < content.split('\n').length - 1 && <br />}
        </React.Fragment>
      );
    });
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
                  style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
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
                      style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
                    />
                  </div>
                )}
                <div className={styles.bubble2}>
                  {renderFormattedText(msg.content)}
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
                    style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
                  />
                </div>
                <div className={styles.bubble2}>
                  <div className={styles.typingDot} />
                  <div className={styles.typingDot} />
                  <div className={styles.typingDot} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputBox}>
            <input
              ref={inputRef}
              type="text"
              className={styles.inputField}
              placeholder={t.chatbot.placeholder}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
            <button
              className={styles.sendBtn}
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Floating launcher button */}
      {!isOpen && (
        <button className={styles.launcher} onClick={handleOpen} aria-label="Open chat">
          <Image
            src="/images/primary/maskot.png"
            alt="CytechAI"
            width={40}
            height={40}
            style={{ objectFit: 'contain', width: 'auto', height: 'auto' }}
          />
          <span className={styles.badgePulse} />
        </button>
      )}
    </div>
  );
}
