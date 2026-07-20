'use client';

import { useState } from 'react';
import type { Order, OrderDetail, CommentItem } from '@/services/orders.service';
import { OrderStatusLabels, CourseFormatLabels, CourseTypeLabels } from '@/lib/reference/lists';
import { useAuth } from '@/lib/auth/auth-context';
import { useToggleState } from '@/hooks/useToggler';
import { useOrderDetail } from '@/hooks/orders/useOrderDetail';
import { useOrderActions } from '@/hooks/orders/useOrderActions';
import { formatDate } from '@/lib/utils/dates';

type Props = {
  order: Order,
  onEditClick?: (order: Order, detail: OrderDetail) => void
}

export default function OrderRow({
  order,
  onEditClick,
}: Props) {
  const [isExpanded, openExpanded, closeExpanded] = useToggleState(false);
  const [comment, setComment] = useState('');

  const { user } = useAuth();
  const { addComment } = useOrderActions();

  const canComment =
    user && (!order.manager?.id || order.manager.id === user.id);

  const { data: detail, isPending: loading } = useOrderDetail(order.id, isExpanded);

  const toggleExpand = () => {
    if (isExpanded) {
      closeExpanded();
    } else {
      openExpanded();
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim() || addComment.isPending) {return;}
    await addComment.mutateAsync({ orderId: order.id, comment: comment.trim() });
    setComment('');
  };

  const display = {
    course: order.course ?? '—',
    format: order.courseFormat ? CourseFormatLabels[order.courseFormat] : '—',
    type: order.courseType ? CourseTypeLabels[order.courseType] : '—',
    status: order.status ? OrderStatusLabels[order.status] : '—',
    manager: order.manager?.name ?? '—',
    group: order.group?.name ?? '—',
  };

  return (
    <>
      <tr
        onClick={toggleExpand}
        className={`border-b cursor-pointer hover:bg-gray-50 text-gray-900 ${isExpanded ? 'bg-green-50' : ''}`}
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
              order.status === 'In work' ? 'bg-yellow-100 text-yellow-800' :
              order.status === 'New' ? 'bg-blue-100 text-blue-800' :
              order.status === 'Agree' ? 'bg-green-100 text-green-800' :
              order.status === 'Disagree' ? 'bg-red-100 text-red-800' :
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
        <td className="px-4 py-3 whitespace-nowrap">{formatDate(order.createdAt)}</td>
      </tr>
      {isExpanded && (
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
                          <p>{c.text}</p>
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
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Comment"
                        className="w-full px-3 py-2 border border-gray-400 rounded min-h-[80px] bg-white text-gray-900 placeholder-gray-500"
                        disabled={addComment.isPending}
                      />
                      <button
                        type="submit"
                        disabled={addComment.isPending || !comment.trim()}
                        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50 w-fit"
                      >
                        {addComment.isPending ? 'Submitting...' : 'SUBMIT'}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            )}
            {canComment && (
              <div className="mt-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (detail && onEditClick) {onEditClick(order, detail);}
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
