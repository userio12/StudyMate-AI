'use client';
/* eslint-disable react-compiler/react-compiler */

import { useState, useEffect } from 'react';

export type AIProvider = 'Gemini' | 'OpenRouter' | 'NVIDIA';

export function useAiModelPreferences() {
  const [chatProvider, setChatProviderState] = useState<AIProvider>('Gemini');
  const [quizProvider, setQuizProviderState] = useState<AIProvider>('Gemini');
  const [pdfProvider, setPdfProviderState] = useState<AIProvider>('NVIDIA');

  const [openRouterChatModel, setOpenRouterChatModelState] = useState<string>('');
  const [openRouterQuizModel, setOpenRouterQuizModelState] = useState<string>('');

  useEffect(() => {
    const storedChat = localStorage.getItem('studymate_chat_provider');
    const storedQuiz = localStorage.getItem('studymate_quiz_provider');
    const storedPdf = localStorage.getItem('studymate_pdf_provider');
    const storedChatModel = localStorage.getItem('studymate_chat_model');
    const storedQuizModel = localStorage.getItem('studymate_quiz_model');

    if (storedChat) setChatProviderState(storedChat as AIProvider);
    if (storedQuiz) setQuizProviderState(storedQuiz as AIProvider);
    if (storedPdf) setPdfProviderState(storedPdf as AIProvider);
    if (storedChatModel) setOpenRouterChatModelState(storedChatModel);
    if (storedQuizModel) setOpenRouterQuizModelState(storedQuizModel);
  }, []);

  const setChatProvider = (newProvider: AIProvider) => {
    setChatProviderState(newProvider);
    localStorage.setItem('studymate_chat_provider', newProvider);
  };

  const setQuizProvider = (newProvider: AIProvider) => {
    setQuizProviderState(newProvider);
    localStorage.setItem('studymate_quiz_provider', newProvider);
  };

  const setPdfProvider = (newProvider: AIProvider) => {
    setPdfProviderState(newProvider);
    localStorage.setItem('studymate_pdf_provider', newProvider);
  };

  const setOpenRouterChatModel = (newModel: string) => {
    setOpenRouterChatModelState(newModel);
    localStorage.setItem('studymate_chat_model', newModel);
  };

  const setOpenRouterQuizModel = (newModel: string) => {
    setOpenRouterQuizModelState(newModel);
    localStorage.setItem('studymate_quiz_model', newModel);
  };

  return {
    chatProvider,
    setChatProvider,
    quizProvider,
    setQuizProvider,
    pdfProvider,
    setPdfProvider,
    openRouterChatModel,
    setOpenRouterChatModel,
    openRouterQuizModel,
    setOpenRouterQuizModel,
  };
}
