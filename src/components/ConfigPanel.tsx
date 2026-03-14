import React, { useState } from 'react';
import { Candidate, ElectionConfig } from '../types';

export default function ConfigPanel({ onSave }: { onSave: (config: ElectionConfig) => void }) {
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: '1', name: 'Nguyễn Văn A', order: 1 },
    { id: '2', name: 'Trần Văn B', order: 2 },
    { id: '3', name: 'Hoàng Thị C', order: 3 },
    { id: '4', name: 'Phạm Văn D', order: 4 },
    { id: '5', name: 'Nguyễn Thị Đ', order: 5 },
  ]);
  const [maxSelectable, setMaxSelectable] = useState(3);

  const handleAddCandidate = () => {
    if (candidates.length >= 9) {
      alert('Chỉ hỗ trợ tối đa 9 ứng cử viên để dùng phím tắt 1-9.');
      return;
    }
    const newId = (candidates.length + 1).toString();
    setCandidates([...candidates, { id: newId, name: '', order: candidates.length + 1 }]);
  };

  const handleUpdateCandidate = (id: string, name: string) => {
    setCandidates(candidates.map(c => c.id === id ? { ...c, name } : c));
  };

  const handleRemoveCandidate = (id: string) => {
    setCandidates(candidates.filter(c => c.id !== id));
  };

  const handleSave = () => {
    if (candidates.some(c => !c.name.trim())) {
      alert('Vui lòng nhập đầy đủ tên ứng cử viên.');
      return;
    }
    onSave({ candidates, maxSelectable });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Cấu hình Bầu cử</h2>
      
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Số lượng đại biểu được bầu (Max)
        </label>
        <input
          type="number"
          min="1"
          max={candidates.length}
          value={maxSelectable}
          onChange={(e) => setMaxSelectable(parseInt(e.target.value) || 1)}
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Danh sách Ưng cử viên
          </label>
          <button
            onClick={handleAddCandidate}
            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
          >
            + Thêm ứng cử viên
          </button>
        </div>
        
        <div className="space-y-3">
          {candidates.map((candidate, index) => (
            <div key={candidate.id} className="flex items-center gap-3">
              <span className="w-8 text-center font-bold text-gray-500">{index + 1}</span>
              <input
                type="text"
                value={candidate.name}
                onChange={(e) => handleUpdateCandidate(candidate.id, e.target.value)}
                placeholder="Tên ứng cử viên"
                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                onClick={() => handleRemoveCandidate(candidate.id)}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md"
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors"
      >
        Lưu cấu hình và Bắt đầu
      </button>
    </div>
  );
}
