"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface NotesStore {
  notes: Record<string, string>; // trade ID -> note text
  setNote: (tradeId: string, note: string) => void;
  deleteNote: (tradeId: string) => void;
}

export const useNotesStore = create<NotesStore>()(
  persist(
    (set) => ({
      notes: {},

      setNote: (tradeId, note) =>
        set((state) => ({
          notes: { ...state.notes, [tradeId]: note },
        })),

      deleteNote: (tradeId) =>
        set((state) => {
          const { [tradeId]: _, ...rest } = state.notes;
          return { notes: rest };
        }),
    }),
    {
      name: "swipetrade-notes",
    },
  ),
);
