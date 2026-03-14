import React, { useState } from 'react';
import { AppState, InvalidReason } from '../types';
import * as XLSX from 'xlsx';

export default function DataSync({
  state,
  onRestore,
  onClear,
}: {
  state: AppState;
  onRestore: (data: AppState) => void;
  onClear: () => void;
}) {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(state, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kiem-phieu-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data && data.config && data.votes && data.batches) {
          onRestore(data);
          setAlertMessage('Phục hồi dữ liệu thành công!');
        } else {
          setAlertMessage('File không đúng định dạng.');
        }
      } catch (err) {
        setAlertMessage('Lỗi đọc file JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleExportExcel = () => {
    if (!state.config) return;

    const wb = XLSX.utils.book_new();

    // Sheet 1: Tổng hợp
    const summaryData = [
      ['TỔNG HỢP KẾT QUẢ KIỂM PHIẾU'],
      [],
      ['Tổng số phiếu', state.votes.length],
      ['Phiếu hợp lệ', state.votes.filter(v => v.isValid).length],
      ['Phiếu không hợp lệ', state.votes.filter(v => !v.isValid).length],
      [],
      ['KẾT QUẢ ỨNG CỬ VIÊN'],
      ['STT', 'Tên ứng cử viên', 'Số phiếu đạt', 'Tỷ lệ % (so với tổng phiếu)'],
    ];

    const candidateResults: Record<string, number> = {};
    state.config.candidates.forEach(c => candidateResults[c.id] = 0);
    state.votes.filter(v => v.isValid).forEach(v => {
      v.selectedCandidateIds.forEach(id => {
        if (candidateResults[id] !== undefined) {
          candidateResults[id]++;
        }
      });
    });

    state.config.candidates.forEach((c, i) => {
      const votes = candidateResults[c.id];
      const percentage = state.votes.length > 0 ? ((votes / state.votes.length) * 100).toFixed(3) + '%' : '0.000%';
      summaryData.push([i + 1, c.name, votes, percentage]);
    });

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng hợp');

    // Sheet 2: Chi tiết phiếu
    const invalidReasonLabels: Record<InvalidReason, string> = {
      WRONG_TEMPLATE: 'Sai mẫu quy định',
      NO_STAMP: 'Không có dấu',
      TOO_MANY: 'Bầu quá số lượng',
      ALL_CROSSED: 'Gạch xóa hết',
      ADDED_NAMES: 'Ghi thêm tên',
      OTHER: 'Lý do khác',
    };

    const detailData: any[][] = [
      ['ID Phiếu', 'Sấp', 'Hợp lệ', 'Lý do không hợp lệ', 'Số người bầu', 'Chi tiết người bầu (ID)'],
    ];

    state.votes.forEach(v => {
      const batchName = state.batches.find(b => b.id === v.batchId)?.name || 'Không rõ';
      detailData.push([
        v.id,
        batchName,
        v.isValid ? 'Có' : 'Không',
        v.invalidReason ? invalidReasonLabels[v.invalidReason] : '',
        v.selectedCandidateIds.length,
        v.selectedCandidateIds.join(', '),
      ]);
    });

    const wsDetail = XLSX.utils.aoa_to_sheet(detailData);
    XLSX.utils.book_append_sheet(wb, wsDetail, 'Chi tiết phiếu');

    XLSX.writeFile(wb, `ket-qua-kiem-phieu-${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative">
      {alertMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl max-w-sm w-full mx-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Thông báo</h3>
            <p className="text-gray-600 mb-6">{alertMessage}</p>
            <button
              onClick={() => setAlertMessage('')}
              className="w-full py-2 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      <h2 className="text-2xl font-bold text-gray-800 mb-6">Quản lý Dữ liệu</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Xuất dữ liệu</h3>
          <div className="space-y-3">
            <button
              onClick={handleExportExcel}
              className="w-full py-3 bg-emerald-600 text-white font-bold rounded-md hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              Xuất báo cáo Excel
            </button>
            <button
              onClick={handleExportJSON}
              className="w-full py-3 bg-indigo-600 text-white font-bold rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
            >
              Sao lưu dữ liệu (JSON)
            </button>
          </div>
        </div>

        <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Phục hồi & Xóa</h3>
          <div className="space-y-3">
            <label className="w-full py-3 bg-blue-600 text-white font-bold rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer">
              Phục hồi từ File JSON
              <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
            </label>
            {!showClearConfirm ? (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-3 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                Xóa toàn bộ dữ liệu
              </button>
            ) : (
              <div className="w-full p-4 bg-red-50 border border-red-200 rounded-md flex flex-col gap-3">
                <p className="text-sm text-red-700 font-medium text-center">Bạn có chắc chắn muốn XÓA TOÀN BỘ dữ liệu? Hành động này không thể hoàn tác!</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    onClick={() => {
                      setShowClearConfirm(false);
                      onClear();
                    }}
                    className="flex-1 py-2 bg-red-600 text-white font-bold rounded-md hover:bg-red-700 transition-colors"
                  >
                    Xác nhận Xóa
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
