import React, { useMemo, useState } from 'react';
import { AppState, Candidate, InvalidReason } from '../types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export default function Dashboard({ state }: { state: AppState }) {
  const { config, votes, batches } = state;
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  if (!config) return null;

  const stats = useMemo(() => {
    const totalVotes = votes.length;
    const validVotes = votes.filter(v => v.isValid);
    const invalidVotes = votes.filter(v => !v.isValid);

    // Distribution by number of selected candidates
    const distribution: Record<number, number> = {};
    for (let i = 1; i <= config.maxSelectable; i++) {
      distribution[i] = 0;
    }

    validVotes.forEach(v => {
      const count = v.selectedCandidateIds.length;
      if (distribution[count] !== undefined) {
        distribution[count]++;
      }
    });

    // Total candidate votes (lượt phiếu)
    let totalCandidateVotesFromDistribution = 0;
    Object.entries(distribution).forEach(([count, numVotes]) => {
      totalCandidateVotesFromDistribution += parseInt(count) * numVotes;
    });

    // Candidate results
    const candidateResults: Record<string, number> = {};
    config.candidates.forEach(c => candidateResults[c.id] = 0);

    validVotes.forEach(v => {
      v.selectedCandidateIds.forEach(id => {
        if (candidateResults[id] !== undefined) {
          candidateResults[id]++;
        }
      });
    });

    let totalCandidateVotesFromResults = 0;
    Object.values(candidateResults).forEach(count => {
      totalCandidateVotesFromResults += count;
    });

    const isMatch = totalCandidateVotesFromDistribution === totalCandidateVotesFromResults;

    // Invalid reasons breakdown
    const invalidBreakdown: Record<InvalidReason, number> = {
      WRONG_TEMPLATE: 0,
      NO_STAMP: 0,
      TOO_MANY: 0,
      ALL_CROSSED: 0,
      ADDED_NAMES: 0,
      OTHER: 0,
    };

    invalidVotes.forEach(v => {
      if (v.invalidReason) {
        invalidBreakdown[v.invalidReason]++;
      }
    });

    return {
      totalVotes,
      validVotes: validVotes.length,
      invalidVotes: invalidVotes.length,
      distribution,
      candidateResults,
      totalCandidateVotesFromDistribution,
      totalCandidateVotesFromResults,
      isMatch,
      invalidBreakdown,
    };
  }, [votes, config]);

  const invalidReasonLabels: Record<InvalidReason, string> = {
    WRONG_TEMPLATE: 'Sai mẫu quy định',
    NO_STAMP: 'Không có dấu',
    TOO_MANY: 'Bầu quá số lượng',
    ALL_CROSSED: 'Gạch xóa hết',
    ADDED_NAMES: 'Ghi thêm tên',
    OTHER: 'Lý do khác',
  };

  const totalPages = Math.ceil(config.candidates.length / itemsPerPage);
  const paginatedCandidates = config.candidates.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full overflow-y-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Kết quả Kiểm phiếu</h2>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
          <p className="text-sm font-medium text-blue-600 mb-1">Tổng số phiếu</p>
          <p className="text-3xl font-bold text-blue-900">{stats.totalVotes}</p>
        </div>
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
          <p className="text-sm font-medium text-emerald-600 mb-1">Hợp lệ</p>
          <p className="text-3xl font-bold text-emerald-900">{stats.validVotes}</p>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <p className="text-sm font-medium text-red-600 mb-1">Không hợp lệ</p>
          <p className="text-3xl font-bold text-red-900">{stats.invalidVotes}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Phân loại phiếu hợp lệ */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Phân loại phiếu hợp lệ</h3>
          <div className="space-y-3">
            {Object.entries(stats.distribution).map(([count, numVotes]) => (
              <div key={count} className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100">
                <span className="text-gray-700 font-medium">Phiếu bầu {count} người</span>
                <div className="text-right">
                  <span className="font-bold text-gray-900">{numVotes}</span>
                  <span className="text-gray-500 text-sm ml-1">phiếu</span>
                  <span className="text-indigo-600 text-sm font-medium ml-3">
                    ({numVotes} x {count} = {Number(numVotes) * parseInt(count)} lượt)
                  </span>
                </div>
              </div>
            ))}
            <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-4">
              <span className="text-indigo-900 font-bold">Tổng số lượt phiếu</span>
              <span className="font-bold text-indigo-900 text-xl">{stats.totalCandidateVotesFromDistribution}</span>
            </div>
          </div>
        </div>

        {/* Kết quả ứng cử viên */}
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Kết quả Ứng cử viên</h3>
          <div className="space-y-3">
            {paginatedCandidates.map(candidate => {
              const voteCount = stats.candidateResults[candidate.id];
              const percentage = stats.totalVotes > 0 ? ((voteCount / stats.totalVotes) * 100).toFixed(3) : '0.000';
              
              return (
                <div key={candidate.id} className="relative bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
                  <div 
                    className="absolute top-0 left-0 h-full bg-blue-100/50 transition-all duration-500"
                    style={{ width: `${Math.min(100, parseFloat(percentage))}%` }}
                  ></div>
                  <div className="relative z-10 flex justify-between items-center p-3">
                    <span className="text-gray-800 font-semibold">{candidate.name}</span>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="font-bold text-gray-900 text-lg">{voteCount}</span>
                        <span className="text-gray-500 text-sm ml-1">phiếu</span>
                      </div>
                      <div className="w-28 text-right bg-blue-50 border border-blue-200 px-2 py-1 rounded-md shadow-sm">
                        <span className="font-bold text-blue-700">{percentage}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Trước
                </button>
                <span className="text-sm text-gray-500">
                  Trang {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-white border border-gray-300 rounded-md disabled:opacity-50"
                >
                  Sau
                </button>
              </div>
            )}

            <div className="flex justify-between items-center bg-indigo-50 p-3 rounded-lg border border-indigo-100 mt-4">
              <span className="text-indigo-900 font-bold">Tổng cộng</span>
              <span className="font-bold text-indigo-900 text-xl">{stats.totalCandidateVotesFromResults}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Đối soát */}
      <div className={twMerge(
        "p-4 rounded-xl border mb-8 flex items-center justify-between",
        stats.isMatch 
          ? "bg-emerald-50 border-emerald-200" 
          : "bg-red-50 border-red-200"
      )}>
        <div>
          <h3 className={twMerge(
            "text-lg font-bold mb-1",
            stats.isMatch ? "text-emerald-800" : "text-red-800"
          )}>
            Đối soát kết quả
          </h3>
          <p className={twMerge(
            "text-sm",
            stats.isMatch ? "text-emerald-600" : "text-red-600"
          )}>
            {stats.isMatch 
              ? "Số liệu thống kê loại phiếu và kết quả ứng cử viên khớp nhau." 
              : "Cảnh báo: Số liệu không khớp! Vui lòng kiểm tra lại."}
          </p>
        </div>
        <div className={twMerge(
          "px-4 py-2 rounded-lg font-bold text-lg",
          stats.isMatch ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
        )}>
          {stats.totalCandidateVotesFromDistribution} = {stats.totalCandidateVotesFromResults}
        </div>
      </div>

      {/* Chi tiết phiếu không hợp lệ */}
      {stats.invalidVotes > 0 && (
        <div>
          <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2">Chi tiết phiếu không hợp lệ</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(stats.invalidBreakdown).map(([reason, count]) => {
              if (count === 0) return null;
              return (
                <div key={reason} className="bg-red-50 p-3 rounded-lg border border-red-100 flex justify-between items-center">
                  <span className="text-red-700 text-sm font-medium">{invalidReasonLabels[reason as InvalidReason]}</span>
                  <span className="font-bold text-red-900">{count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
