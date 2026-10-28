import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageSquare, Plus, Trash2, Calendar } from 'lucide-react';
import { notesApi } from '../../api/notesApi.js';
import { useAuth } from '../../hooks/useAuth.js';
import Button from '../ui/Button.jsx';
import { formatDateTime } from '../../utils/formatters.js';

const NotesSection = ({ entityType, entityId }) => {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['notes', entityType, entityId],
    queryFn: () => notesApi.getByEntity(entityType, entityId),
    enabled: !!entityId,
  });

  const notes = data?.data || [];

  const addNoteMutation = useMutation({
    mutationFn: (newNote) => notesApi.create(newNote),
    onSuccess: () => {
      setContent('');
      setErrorMsg('');
      queryClient.invalidateQueries({ queryKey: ['notes', entityType, entityId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err) => setErrorMsg(err.message || 'Failed to add note'),
  });

  const deleteNoteMutation = useMutation({
    mutationFn: (noteId) => notesApi.delete(noteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes', entityType, entityId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-metrics'] });
    },
    onError: (err) => setErrorMsg(err.message || 'Failed to delete note'),
  });

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    addNoteMutation.mutate({
      content: content.trim(),
      entityType,
      entityId,
    });
  };

  const canDeleteNote = (note) => {
    if (isAdmin) return true;
    const authorId = note.author?._id || note.author;
    return authorId?.toString() === user?._id?.toString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded p-5 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          <h2 className="text-sm font-bold text-gray-900">Activity Timeline & Notes</h2>
        </div>
        <span className="text-xs text-gray-400">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
      </div>

      {errorMsg && (
        <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
          {errorMsg}
        </div>
      )}

      {/* Add Note Form */}
      <form onSubmit={handleAddNote} className="space-y-2">
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add a call summary, meeting note, or follow-up update..."
          className="w-full p-2.5 text-xs bg-white border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 resize-none"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            size="sm"
            variant="primary"
            disabled={!content.trim() || addNoteMutation.isPending}
            className="gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {addNoteMutation.isPending ? 'Adding...' : 'Post Note'}
          </Button>
        </div>
      </form>

      {/* Notes Timeline List */}
      <div className="pt-2">
        {isLoading ? (
          <div className="text-center py-6 text-xs text-gray-500">Loading timeline notes...</div>
        ) : notes.length === 0 ? (
          <div className="text-center py-6 text-xs text-gray-400">
            No activity notes recorded yet. Post the first update above.
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => (
              <div
                key={note._id}
                className="p-3 bg-gray-50 border border-gray-200 rounded text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800">
                      {note.author?.name || 'User'}
                    </span>
                    <span className="text-gray-400 flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3" />
                      {formatDateTime(note.createdAt)}
                    </span>
                  </div>

                  {canDeleteNote(note) && (
                    <button
                      onClick={() => deleteNoteMutation.mutate(note._id)}
                      className="text-gray-400 hover:text-red-600 p-0.5 rounded"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-gray-700 whitespace-pre-wrap">{note.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesSection;
