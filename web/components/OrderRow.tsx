'use client';

import { useState } from 'react';
import type { OrderListItem, OrderDetail, CommentItem } from '@/services/orders.service';
import ordersService from '@/services/orders.service';
import { authService } from '@/lib/api/auth.service';

function formatDate(dateString: string | null) {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export default function OrderRow({
  order,
  onOrderUpdated,
  onEditClick,
}: {
  order: OrderListItem;
  onOrderUpdated?: (updated: OrderListItem) => void;
  onEditClick?: (order: OrderListItem, detail: OrderDetail) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [detail, setDetail] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const user = authService.getStoredUser();
  const canComment =
    user && (!order.manager?.id || order.manager.id === user.id);

  const toggleExpand = async () => {
    if (expanded) {
      setExpanded(false);
      setDetail(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ordersService.getOrder(order.id);
      setDetail(data);
      setExpanded(true);
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await ordersService.addComment(order.id, commentText.trim());
      const updated = await ordersService.getOrder(order.id);
      setDetail(updated);
      setCommentText('');
      onOrderUpdated?.({
        ...order,
        manager: updated.manager ?? order.manager,
        status: updated.status ?? order.status,
      });
    } catch (e: unknown) {
      setError((e as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const display = {
    course: order.course?.code ?? '—',
    format: order.format?.name ?? '—',
    type: order.type?.name ?? '—',
    status: order.status?.name ?? '—',
    manager: order.manager?.name ?? '—',
    group: order.group?.name ?? '—',
  };

  return (
    <>
      <tr
        onClick={toggleExpand}
        className={`border-b cursor-pointer hover:bg-gray-50 text-gray-900 ${expanded ? 'bg-green-50' : ''}`}
      >
        <td className="px-4 py-3">{order.id}</td>
        <td className="px-4 py-3">{order.name ?? '—'}</td>
        <td className="px-4 py-3">{order.surname ?? '—'}</td>
        <td className="px-4 py-3">{order.email ?? '—'}</td>
        <td className="px-4 py-3">{order.phone ?? '—'}</td>
        <td className="px-4 py-3">{order.age ?? '—'}</td>
        <td className="px-4 py-3">{display.course}</td>
        <td className="px-4 py-3">{display.format}</td>
        <td className="px-4 py-3">{display.type}</td>
        <td className="px-4 py-3">
          <span
            className={`px-2 py-1 rounded text-xs ${
              display.status === 'In work' ? 'bg-yellow-100 text-yellow-800' :
              display.status === 'New' ? 'bg-blue-100 text-blue-800' :
              display.status === 'Aggre' ? 'bg-green-100 text-green-800' :
              display.status === 'Disaggre' ? 'bg-red-100 text-red-800' :
              'bg-gray-100 text-gray-800'
            }`}
          >
            {display.status}
          </span>
        </td>
        <td className="px-4 py-3">{order.sum ?? '—'}</td>
        <td className="px-4 py-3">{order.alreadyPaid ?? '—'}</td>
        <td className="px-4 py-3">{display.manager}</td>
        <td className="px-4 py-3">{display.group}</td>
        <td className="px-4 py-3 whitespace-nowrap">{formatDate(order.created_at)}</td>
      </tr>
      {expanded && (
        <tr className="text-gray-900">
          <td colSpan={15} className="bg-green-50/50 p-4 border-b">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-800"><strong>Message:</strong> {detail?.message ?? 'null'}</p>
                  <p className="text-sm text-gray-800 mt-1"><strong>UTM:</strong> {detail?.utm ?? 'null'}</p>
                </div>
                <div>
                  {detail?.comments && detail.comments.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {detail.comments.map((c: CommentItem) => (
                        <div key={c.id} className="bg-white rounded p-2 text-sm border text-gray-900">
                          <p>{c.comment ?? ''}</p>
                          <p className="text-gray-500 text-xs mt-1">
                            {c.user?.name ?? 'User'} — {formatDate(c.createdAt)}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                  {canComment && (
                    <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
                      <textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Comment"
                        className="w-full px-3 py-2 border border-gray-400 rounded min-h-[80px] bg-white text-gray-900 placeholder-gray-500"
                        disabled={submitting}
                      />
                      <button
                        type="submit"
                        disabled={submitting || !commentText.trim()}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 w-fit"
                      >
                        {submitting ? 'Submitting...' : 'SUBMIT'}
                      </button>
                    </form>
                  )}
                  {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
                </div>
              </div>
            )}
            {canComment && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (detail && onEditClick) onEditClick(order, detail);
                  }}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  EDIT
                </button>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}
