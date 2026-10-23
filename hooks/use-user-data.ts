"use client";

import { useState, useEffect, useCallback } from "react";
import { UserData, UserArticleData } from "@/lib/types";
import {
  getUserData,
  saveUserData,
  toggleStar,
  toggleDismiss,
  addComment,
  deleteComment,
  updateLastVisit,
  getLastVisit,
} from "@/lib/storage";

export function useUserData() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUserData(getUserData());
  }, []);

  const handleStar = useCallback((articleId: string) => {
    toggleStar(articleId);
    setUserData(getUserData());
  }, []);

  const handleDismiss = useCallback((articleId: string) => {
    toggleDismiss(articleId);
    setUserData(getUserData());
  }, []);

  const handleAddComment = useCallback((articleId: string, text: string) => {
    addComment(articleId, text);
    setUserData(getUserData());
  }, []);

  const handleDeleteComment = useCallback((articleId: string, commentId: string) => {
    deleteComment(articleId, commentId);
    setUserData(getUserData());
  }, []);

  const handleUpdateLastVisit = useCallback(() => {
    updateLastVisit();
    setUserData(getUserData());
  }, []);

  const getArticleData = useCallback(
    (articleId: string): UserArticleData => {
      if (!userData) {
        return { starred: false, dismissed: false, comments: [] };
      }
      return (
        userData.articles[articleId] || {
          starred: false,
          dismissed: false,
          comments: [],
        }
      );
    },
    [userData]
  );

  const getStarredArticleIds = useCallback((): string[] => {
    if (!userData) return [];
    return Object.entries(userData.articles)
      .filter(([, data]) => data.starred)
      .map(([id]) => id);
  }, [userData]);

  const getLastVisitDate = useCallback((): string | undefined => {
    if (!mounted) return undefined;
    return getLastVisit();
  }, [mounted]);

  return {
    userData,
    mounted,
    handleStar,
    handleDismiss,
    handleAddComment,
    handleDeleteComment,
    handleUpdateLastVisit,
    getArticleData,
    getStarredArticleIds,
    getLastVisitDate,
  };
}
