import React, { useState } from 'react';
import { useElectionStore } from './store';
import ConfigPanel from './components/ConfigPanel';
import BatchList from './components/BatchList';
import VoteEntry from './components/VoteEntry';
import Dashboard from './components/Dashboard';
import DataSync from './components/DataSync';
import { Vote, AppState } from './types';
import { Settings, CheckSquare, BarChart3, Database } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

type Tab = 'CONFIG' | 'ENTRY' | 'DASHBOARD' | 'DATA';

export default function App() {
  const { state, setConfig, addBatch, setActiveBatch, addVote, removeVote, clearData, restoreData } = useElectionStore();
  const [activeTab, setActiveTab] = useState<Tab>(state.config ? 'ENTRY' : 'CONFIG');

  const handleSaveConfig = (config: any) => {
    setConfig(config);
    setActiveTab('ENTRY');
  };

  const handleAddBatch = (name: string, expectedCount: number) => {
    const newBatch = {
      id: Date.now().toString(),
      name,
      expectedCount,
      createdAt: Date.now(),
    };
    addBatch(newBatch);
    if (!state.activeBatchId) {
      setActiveBatch(newBatch.id);
    }
  };

  const handleSaveVote = (voteData: Omit<Vote, 'id' | 'timestamp'>) => {
    const newVote: Vote = {
      ...voteData,
      id: Date.now().toString(),
      timestamp: Date.now(),
    };
    addVote(newVote);
  };

  const handleClearData = () => {
    clearData();
    setActiveTab('CONFIG');
  };

  const handleRestoreData = (data: AppState) => {
    restoreData(data);
    setActiveTab('ENTRY');
  };

  const recentVotes = state.votes.filter(v => v.batchId === state.activeBatchId);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <header className="bg-indigo-900 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <CheckSquare className="w-8 h-8 text-indigo-300" />
              <h1 className="text-xl font-bold tracking-tight">Hệ thống Kiểm phiếu Nhanh</h1>
              <span className="text-sm font-medium text-indigo-300 sm:hidden">| NDK</span>
              <span className="hidden sm:inline-block text-lg font-medium text-indigo-200">
                | Nguyễn Duy Khánh
              </span>                         
            </div>
            
            <nav className="flex space-x-1">
              <button
                onClick={() => setActiveTab('CONFIG')}
                className={twMerge(
                  "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                  activeTab === 'CONFIG' ? "bg-indigo-800 text-white" : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                )}
              >
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">Cấu hình</span>
              </button>
              
              <button
                onClick={() => setActiveTab('ENTRY')}
                disabled={!state.config}
                className={twMerge(
                  "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                  activeTab === 'ENTRY' ? "bg-indigo-800 text-white" : "text-indigo-200 hover:bg-indigo-800 hover:text-white",
                  !state.config && "opacity-50 cursor-not-allowed"
                )}
              >
                <CheckSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Nhập phiếu</span>
              </button>
              
              <button
                onClick={() => setActiveTab('DASHBOARD')}
                disabled={!state.config}
                className={twMerge(
                  "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                  activeTab === 'DASHBOARD' ? "bg-indigo-800 text-white" : "text-indigo-200 hover:bg-indigo-800 hover:text-white",
                  !state.config && "opacity-50 cursor-not-allowed"
                )}
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Kết quả</span>
              </button>

              <button
                onClick={() => setActiveTab('DATA')}
                className={twMerge(
                  "px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                  activeTab === 'DATA' ? "bg-indigo-800 text-white" : "text-indigo-200 hover:bg-indigo-800 hover:text-white"
                )}
              >
                <Database className="w-4 h-4" />
                <span className="hidden sm:inline">Dữ liệu</span>
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        {activeTab === 'CONFIG' && (
          <ConfigPanel onSave={handleSaveConfig} />
        )}

        {activeTab === 'ENTRY' && state.config && (
          <div className="flex flex-col lg:flex-row gap-6 h-full">
            <div className="w-full lg:w-1/4 flex-shrink-0">
              <BatchList
                batches={state.batches}
                votes={state.votes}
                activeBatchId={state.activeBatchId}
                onAddBatch={handleAddBatch}
                onSelectBatch={setActiveBatch}
              />
            </div>
            <div className="w-full lg:w-3/4 flex-grow">
              {state.activeBatchId ? (
                <VoteEntry
                  config={state.config}
                  batch={state.batches.find(b => b.id === state.activeBatchId)!}
                  onSaveVote={handleSaveVote}
                  onRemoveVote={removeVote}
                  recentVotes={recentVotes}
                />
              ) : (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-4">
                    <CheckSquare className="w-10 h-10 text-indigo-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">Chưa chọn sấp phiếu</h2>
                  <p className="text-gray-500 max-w-md">
                    Vui lòng tạo một sấp phiếu mới hoặc chọn một sấp phiếu bên trái để bắt đầu nhập dữ liệu.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'DASHBOARD' && state.config && (
          <Dashboard state={state} />
        )}

        {activeTab === 'DATA' && (
          <DataSync state={state} onRestore={handleRestoreData} onClear={handleClearData} />
        )}
      </main>
    </div>
  );
}
