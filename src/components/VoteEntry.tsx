import React, { useState, useEffect, useCallback } from 'react';
import { Candidate, InvalidReason, Vote, ElectionConfig, Batch } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function VoteEntry({
  config,
  batch,
  onSaveVote,
  onRemoveVote,
  recentVotes,
}: {
  config: ElectionConfig;
  batch: Batch;
  onSaveVote: (vote: Omit<Vote, 'id' | 'timestamp'>) => void;
  onRemoveVote: (id: string) => void;
  recentVotes: Vote[];
}) {
  const [inputMode, setInputMode] = useState<'SELECTED' | 'CROSSED'>('SELECTED');
  const [activeIds, setActiveIds] = useState<Set<string>>(new Set());

  // Calculate actual selected candidates based on input mode
  const getSelectedCandidates = useCallback(() => {
    if (inputMode === 'SELECTED') {
      return Array.from(activeIds);
    } else {
      // CROSSED mode: selected are those NOT in activeIds
      return config.candidates
        .filter((c) => !activeIds.has(c.id))
        .map((c) => c.id);
    }
  }, [activeIds, inputMode, config.candidates]);

  const handleToggle = (id: string) => {
    setActiveIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSave = (isValid: boolean, invalidReason?: InvalidReason) => {
    const selected = getSelectedCandidates();
    
    let finalValid = isValid;
    let finalReason = invalidReason;

    // Auto validation logic if user tries to save as valid
    if (isValid) {
      if (selected.length === 0) {
        finalValid = false;
        finalReason = 'ALL_CROSSED';
      } else if (selected.length > config.maxSelectable) {
        finalValid = false;
        finalReason = 'TOO_MANY';
      }
    }

    onSaveVote({
      batchId: batch.id,
      isValid: finalValid,
      invalidReason: finalReason,
      selectedCandidateIds: selected,
    });
    
    setActiveIds(new Set());
  };

  // Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input field somewhere else
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const key = e.key;
      
      // Number keys 1-9
      const num = parseInt(key);
      if (!isNaN(num) && num > 0 && num <= config.candidates.length) {
        const candidateId = config.candidates[num - 1].id;
        handleToggle(candidateId);
      }

      // Enter to save valid
      if (key === 'Enter') {
        e.preventDefault();
        handleSave(true);
      }

      // Hotkeys for invalid
      if (key.toLowerCase() === 'q') handleSave(false, 'WRONG_TEMPLATE');
      if (key.toLowerCase() === 'w') handleSave(false, 'NO_STAMP');
      if (key.toLowerCase() === 'e') handleSave(false, 'ADDED_NAMES');
      if (key.toLowerCase() === 'r') handleSave(false, 'OTHER');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [config.candidates, activeIds, inputMode]);

  // Unsaved changes warning
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (activeIds.size > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeIds]);

  const selectedCount = getSelectedCandidates().length;
  const isOverLimit = selectedCount > config.maxSelectable;
  const currentSTT = recentVotes.length + 1;

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Nhập Phiếu Bầu
          <span className="text-indigo-600 text-lg ml-3 font-semibold bg-indigo-50 px-3 py-1 rounded-lg border border-indigo-100">
            STT: {currentSTT} / {batch.expectedCount}
          </span>
        </h2>
        
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => { setInputMode('SELECTED'); setActiveIds(new Set()); }}
            className={twMerge(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              inputMode === 'SELECTED' ? "bg-blue-600 shadow-md text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            )}
          >
            Chế độ: Nhập người ĐƯỢC BẦU
          </button>
          <button
            onClick={() => { setInputMode('CROSSED'); setActiveIds(new Set()); }}
            className={twMerge(
              "px-4 py-2 rounded-md text-sm font-medium transition-colors",
              inputMode === 'CROSSED' ? "bg-red-600 shadow-md text-white" : "text-gray-500 hover:text-gray-700 hover:bg-gray-200"
            )}
          >
            Chế độ: Nhập người BỊ GẠCH
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {config.candidates.map((candidate, index) => {
          const isToggled = activeIds.has(candidate.id);
          const isSelected = inputMode === 'SELECTED' ? isToggled : !isToggled;
          
          return (
            <button
              key={candidate.id}
              onClick={() => handleToggle(candidate.id)}
              className={twMerge(
                "p-4 rounded-xl border-2 text-left transition-all relative overflow-hidden",
                isSelected 
                  ? "border-blue-600 bg-blue-600 shadow-md" 
                  : "border-gray-200 bg-white hover:border-gray-300 opacity-60"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={twMerge(
                  "w-8 h-8 rounded-full flex items-center justify-center font-bold text-lg",
                  isSelected ? "bg-white text-blue-600 shadow-sm" : "bg-gray-200 text-gray-600"
                )}>
                  {index + 1}
                </div>
                <span className={twMerge(
                  "font-semibold text-lg",
                  isSelected ? "text-white" : "text-gray-500 line-through"
                )}>
                  {candidate.name}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6 flex justify-between items-center border border-gray-200">
        <div>
          <p className="text-sm text-gray-500 mb-1">Số lượng đã chọn:</p>
          <p className={twMerge(
            "text-2xl font-bold",
            isOverLimit ? "text-red-600" : "text-indigo-600"
          )}>
            {selectedCount} / {config.maxSelectable}
          </p>
        </div>
        
        {isOverLimit && (
          <div className="bg-red-100 text-red-700 px-4 py-2 rounded-md font-medium text-sm">
            Cảnh báo: Bầu quá số lượng quy định ({config.maxSelectable})
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <button
          onClick={() => handleSave(true)}
          className="col-span-2 sm:col-span-4 py-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md text-lg flex items-center justify-center gap-2"
        >
          <span>Lưu Phiếu Hợp Lệ</span>
          <span className="bg-indigo-800 text-xs px-2 py-1 rounded text-indigo-200">Enter</span>
        </button>
        
        <button onClick={() => handleSave(false, 'WRONG_TEMPLATE')} className="py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium flex flex-col items-center justify-center gap-1">
          <span>Sai mẫu quy định</span>
          <span className="bg-white text-xs px-1.5 py-0.5 rounded border border-red-100">Q</span>
        </button>
        <button onClick={() => handleSave(false, 'NO_STAMP')} className="py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium flex flex-col items-center justify-center gap-1">
          <span>Không dấu</span>
          <span className="bg-white text-xs px-1.5 py-0.5 rounded border border-red-100">W</span>
        </button>
        <button onClick={() => handleSave(false, 'ADDED_NAMES')} className="py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium flex flex-col items-center justify-center gap-1">
          <span>Ghi thêm</span>
          <span className="bg-white text-xs px-1.5 py-0.5 rounded border border-red-100">E</span>
        </button>
        <button onClick={() => handleSave(false, 'OTHER')} className="py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 text-sm font-medium flex flex-col items-center justify-center gap-1">
          <span>Lý do khác</span>
          <span className="bg-white text-xs px-1.5 py-0.5 rounded border border-red-100">R</span>
        </button>
      </div>

      <div className="mt-auto border-t pt-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Phiếu vừa nhập (Sấp hiện tại)</h3>
          {recentVotes.length > 0 && (
            <button
              onClick={() => onRemoveVote(recentVotes[recentVotes.length - 1].id)}
              className="text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 bg-red-50 rounded"
            >
              Hoàn tác phiếu cuối (Xóa)
            </button>
          )}
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {recentVotes.slice(-10).reverse().map((vote, i) => (
            <div key={vote.id} className={twMerge(
              "flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-sm border relative group",
              vote.isValid 
                ? "bg-emerald-50 border-emerald-200 text-emerald-700" 
                : "bg-red-50 border-red-200 text-red-700"
            )}>
              {vote.isValid ? vote.selectedCandidateIds.length : 'X'}
              <button
                onClick={() => onRemoveVote(vote.id)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                ×
              </button>
            </div>
          ))}
          {recentVotes.length === 0 && (
            <p className="text-sm text-gray-400 italic">Chưa có phiếu nào</p>
          )}
        </div>
      </div>
    </div>
  );
}
