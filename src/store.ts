import { useState, useEffect } from 'react';
import { AppState, Vote, Batch, ElectionConfig } from './types';

const initialState: AppState = {
  config: null,
  batches: [],
  votes: [],
  activeBatchId: null,
};

export const useElectionStore = () => {
  const [state, setState] = useState<AppState>(() => {
    const saved = localStorage.getItem('electionState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return { ...initialState, ...parsed };
      } catch (e) {}
    }
    return initialState;
  });

  useEffect(() => {
    localStorage.setItem('electionState', JSON.stringify(state));
  }, [state]);

  const setConfig = (config: ElectionConfig) => setState(s => ({ ...s, config }));
  const addBatch = (batch: Batch) => setState(s => ({ ...s, batches: [...s.batches, batch] }));
  const setActiveBatch = (id: string) => setState(s => ({ ...s, activeBatchId: id }));
  const addVote = (vote: Vote) => setState(s => ({ ...s, votes: [...s.votes, vote] }));
  const removeVote = (id: string) => setState(s => ({ ...s, votes: s.votes.filter(v => v.id !== id) }));
  const clearData = () => setState(initialState);
  const restoreData = (data: AppState) => setState(data);

  return { state, setConfig, addBatch, setActiveBatch, addVote, removeVote, clearData, restoreData };
};
