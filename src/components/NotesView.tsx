'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Pin, 
  Trash2, 
  Edit2, 
  CheckSquare, 
  Square, 
  X,
  Sparkles
} from 'lucide-react';
import { FinancialNote } from '@/lib/types';
import { formatDateVietnamese } from '@/lib/utils';

interface NotesViewProps {
  notes: FinancialNote[];
  onCreateNote: (note: Partial<FinancialNote>) => Promise<void>;
  onUpdateNote: (id: string, note: Partial<FinancialNote>) => Promise<void>;
  onDeleteNote: (id: string) => Promise<void>;
}

export function NotesView({
  notes,
  onCreateNote,
  onUpdateNote,
  onDeleteNote,
}: NotesViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<FinancialNote | null>(null);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [color, setColor] = useState('blue');
  const [tags, setTags] = useState('');
  const [isPinned, setIsPinned] = useState(false);

  const openCreateModal = () => {
    setEditingNote(null);
    setTitle('');
    setContent('');
    setColor('blue');
    setTags('');
    setIsPinned(false);
    setIsModalOpen(true);
  };

  const openEditModal = (note: FinancialNote) => {
    setEditingNote(note);
    setTitle(note.title);
    setContent(note.content);
    setColor(note.color || 'blue');
    setTags(note.tags || '');
    setIsPinned(Boolean(note.is_pinned));
    setIsModalOpen(true);
  };

  const handleSaveNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title && !content) return;

    if (editingNote) {
      await onUpdateNote(editingNote.id, {
        title: title || 'Ghi chú',
        content,
        color,
        tags,
        is_pinned: isPinned,
      });
    } else {
      await onCreateNote({
        title: title || 'Ghi chú',
        content,
        color,
        tags,
        is_pinned: isPinned,
      });
    }
    setIsModalOpen(false);
  };

  const handleToggleChecklist = async (note: FinancialNote, lineIndex: number) => {
    const lines = note.content.split('\n');
    const targetLine = lines[lineIndex];

    if (targetLine.includes('- [ ]')) {
      lines[lineIndex] = targetLine.replace('- [ ]', '- [x]');
    } else if (targetLine.includes('- [x]')) {
      lines[lineIndex] = targetLine.replace('- [x]', '- [ ]');
    }

    const newContent = lines.join('\n');
    await onUpdateNote(note.id, { content: newContent });
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      n.title.toLowerCase().includes(q) ||
      n.content.toLowerCase().includes(q) ||
      (n.tags && n.tags.toLowerCase().includes(q))
    );
  });

  const COLOR_THEMES: Record<string, { bg: string; border: string; badge: string }> = {
    blue: {
      bg: 'bg-blue-50/40 dark:bg-blue-950/20',
      border: 'border-blue-200/60 dark:border-blue-900/40',
      badge: 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300',
    },
    green: {
      bg: 'bg-emerald-50/40 dark:bg-emerald-950/20',
      border: 'border-emerald-200/60 dark:border-emerald-900/40',
      badge: 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300',
    },
    amber: {
      bg: 'bg-amber-50/40 dark:bg-amber-950/20',
      border: 'border-amber-200/60 dark:border-amber-900/40',
      badge: 'bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300',
    },
    purple: {
      bg: 'bg-purple-50/40 dark:bg-purple-950/20',
      border: 'border-purple-200/60 dark:border-purple-900/40',
      badge: 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300',
    },
    rose: {
      bg: 'bg-rose-50/40 dark:bg-rose-950/20',
      border: 'border-rose-200/60 dark:border-rose-900/40',
      badge: 'bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300',
    },
    default: {
      bg: 'bg-white dark:bg-zinc-900',
      border: 'border-zinc-200/80 dark:border-zinc-800/80',
      badge: 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400',
    },
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Sổ ghi chú tài chính
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
            Kế hoạch chi tiêu, danh sách mua sắm & mục tiêu tiết kiệm
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 sm:py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 text-xs sm:text-sm font-medium shadow-sm transition-transform active:scale-95 self-stretch sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo ghi chú mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          type="text"
          placeholder="Tìm kiếm ghi chú hoặc thẻ #tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full text-xs sm:text-sm pl-9 pr-4 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
        />
      </div>

      {/* Notes Grid */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-12 sm:py-16 px-4 rounded-2xl bg-white dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mx-auto mb-3 text-zinc-400">
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Chưa có ghi chú tài chính nào
          </h3>
          <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Ghi lại dự trù chi tiêu, kế hoạch tiết kiệm hoặc danh sách cần mua.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-4 px-4 py-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 text-xs font-medium"
          >
            + Viết ghi chú đầu tiên
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filteredNotes.map((note) => {
            const theme = COLOR_THEMES[note.color] || COLOR_THEMES.default;
            const contentLines = note.content.split('\n');

            return (
              <div
                key={note.id}
                className={`group flex flex-col justify-between p-4 sm:p-5 rounded-xl sm:rounded-2xl border shadow-xs sm:shadow-sm transition-all hover:shadow-md ${theme.bg} ${theme.border}`}
              >
                <div>
                  {/* Note Top Bar: Title & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-xs sm:text-base text-zinc-900 dark:text-zinc-100 break-words leading-snug">
                      {note.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => onUpdateNote(note.id, { is_pinned: !note.is_pinned })}
                        className={`p-1.5 sm:p-1 rounded-lg transition-colors ${
                          note.is_pinned
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40'
                            : 'text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200'
                        }`}
                        title={note.is_pinned ? 'Bỏ ghim' : 'Ghim lên đầu'}
                        aria-label="Ghim ghi chú"
                      >
                        <Pin className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => openEditModal(note)}
                        className="p-1.5 sm:p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                        title="Sửa ghi chú"
                        aria-label="Sửa ghi chú"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Bạn muốn xóa ghi chú này?')) {
                            onDeleteNote(note.id);
                          }
                        }}
                        className="p-1.5 sm:p-1 rounded-lg text-zinc-400 hover:text-red-600 dark:hover:text-red-400"
                        title="Xóa ghi chú"
                        aria-label="Xóa ghi chú"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Note Body with Thumb-friendly Interactive Checklist */}
                  <div className="mt-2.5 sm:mt-3 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 space-y-1.5 break-words whitespace-pre-wrap leading-relaxed">
                    {contentLines.map((line, idx) => {
                      if (line.includes('- [ ]')) {
                        const text = line.replace('- [ ]', '').trim();
                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleChecklist(note, idx)}
                            className="flex items-start gap-2.5 cursor-pointer hover:opacity-80 active:scale-[0.99] select-none py-1"
                          >
                            <Square className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                            <span className="leading-tight">{text}</span>
                          </div>
                        );
                      }
                      if (line.includes('- [x]')) {
                        const text = line.replace('- [x]', '').trim();
                        return (
                          <div
                            key={idx}
                            onClick={() => handleToggleChecklist(note, idx)}
                            className="flex items-start gap-2.5 cursor-pointer text-zinc-400 dark:text-zinc-500 line-through select-none py-1"
                          >
                            <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span className="leading-tight">{text}</span>
                          </div>
                        );
                      }
                      return <div key={idx}>{line}</div>;
                    })}
                  </div>
                </div>

                {/* Note Footer: Tags & Date */}
                <div className="mt-3.5 pt-2.5 sm:pt-3 border-t border-zinc-200/40 dark:border-zinc-800/40 flex items-center justify-between text-[10px] sm:text-[11px] text-zinc-400">
                  <div className="flex flex-wrap gap-1">
                    {note.tags &&
                      note.tags
                        .split(',')
                        .map((t) => t.trim())
                        .filter(Boolean)
                        .map((tag, idx) => (
                          <span
                            key={idx}
                            className={`px-1.5 py-0.5 rounded-md font-medium text-[10px] ${theme.badge}`}
                          >
                            #{tag}
                          </span>
                        ))}
                  </div>
                  <span>{formatDateVietnamese(note.updated_at.split('T')[0])}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Note Modal (Bottom sheet on mobile, centered modal on desktop) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-zinc-900/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-lg rounded-t-3xl sm:rounded-2xl bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 shadow-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom sm:zoom-in-95 duration-150 p-5 sm:p-6 pb-safe sm:pb-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700 mx-auto mb-2 sm:hidden shrink-0" />

            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0">
              <h2 className="text-sm sm:text-base font-semibold text-zinc-900 dark:text-zinc-100">
                {editingNote ? 'Chỉnh sửa ghi chú' : 'Tạo ghi chú mới'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNote} className="space-y-3.5 sm:space-y-4 mt-4 overflow-y-auto">
              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Kế hoạch mua sắm tháng tới"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                  Nội dung (hỗ trợ checklist `- [ ] Việc cần làm`)
                </label>
                <textarea
                  rows={5}
                  placeholder={`- [ ] Mục tiêu 1\n- [ ] Tiết kiệm 2 triệu\n• Ghi nhớ tài chính...`}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 resize-none font-sans"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Thẻ #tags (ngăn cách bằng dấu phẩy)
                  </label>
                  <input
                    type="text"
                    placeholder="Kế hoạch, Mua sắm"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
                    Màu sắc
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    {[
                      { id: 'blue', bg: 'bg-blue-400' },
                      { id: 'green', bg: 'bg-emerald-400' },
                      { id: 'amber', bg: 'bg-amber-400' },
                      { id: 'purple', bg: 'bg-purple-400' },
                      { id: 'rose', bg: 'bg-rose-400' },
                      { id: 'default', bg: 'bg-zinc-300 dark:bg-zinc-700' },
                    ].map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setColor(c.id)}
                        className={`w-6 h-6 rounded-full ${c.bg} transition-transform ${
                          color === c.id ? 'ring-2 ring-zinc-900 dark:ring-zinc-100 scale-110' : ''
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Pin option */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="pinNote"
                  checked={isPinned}
                  onChange={(e) => setIsPinned(e.target.checked)}
                  className="rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900 w-4 h-4"
                />
                <label htmlFor="pinNote" className="text-xs text-zinc-700 dark:text-zinc-300 cursor-pointer">
                  Ghim ghi chú này lên đầu danh sách
                </label>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-5 py-2.5 sm:py-2 rounded-xl text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 shadow-sm"
                >
                  {editingNote ? 'Lưu thay đổi' : 'Tạo ghi chú'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
