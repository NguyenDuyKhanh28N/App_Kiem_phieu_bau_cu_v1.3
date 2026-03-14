import React, { useState } from 'react';
import { Batch, Vote } from '../types';

export default function BatchList({
  batches,
  votes,
  activeBatchId,
  onAddBatch,
  onSelectBatch,
}: {
  batches: Batch[];
  votes: Vote[];
  activeBatchId: string | null;
  onAddBatch: (name: string, expectedCount: number) => void;
  onSelectBatch: (id: string) => void;
}) {
  const [newBatchName, setNewBatchName] = useState('');
  const [expectedCount, setExpectedCount] = useState(50);

  const handleAdd = () => {
    if (newBatchName.trim() && expectedCount > 0) {
      onAddBatch(newBatchName.trim(), expectedCount);
      setNewBatchName('');
    }
  };

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-800">Quản lý Sấp Phiếu</h3>
      
      <div className="flex flex-col gap-3 mb-4">
        <input
          type="text"
          value={newBatchName}
          onChange={(e) => setNewBatchName(e.target.value)}
          placeholder="Tên sấp (VD: Sấp 1)"
          className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
        />
        <div className="flex gap-2 items-center">
          <div className="relative w-24">
            <input
              type="number"
              value={expectedCount}
              onChange={(e) => setExpectedCount(parseInt(e.target.value) || 0)}
              className="w-full p-2 border border-gray-300 rounded-md text-sm text-center focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              min="1"
              title="Số phiếu dự kiến"
            />
          </div>
          <button
            onClick={handleAdd}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors whitespace-nowrap"
          >
            Thêm sấp
          </button>
        </div>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {batches.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Chưa có sấp phiếu nào.</p>
        ) : (
          batches.map((batch) => {
            const batchVotes = votes.filter(v => v.batchId === batch.id).length;
            const isComplete = batchVotes >= batch.expectedCount;
            return (
              <button
                key={batch.id}
                onClick={() => onSelectBatch(batch.id)}
                className={`w-full text-left px-4 py-3 rounded-md transition-colors flex justify-between items-center ${
                  activeBatchId === batch.id
                    ? 'bg-indigo-50 border-indigo-200 border text-indigo-700 font-medium'
                    : 'bg-gray-50 border-transparent border hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span>{batch.name}</span>
                <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                  isComplete ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                }`}>
                  {batchVotes}/{batch.expectedCount}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
