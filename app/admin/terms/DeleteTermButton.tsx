'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteTermButton({ termId }: { termId: number }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Bạn có chắc chắn muốn xóa thuật ngữ này?')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/admin/terms/${termId}/delete`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to delete term');
      }

      router.refresh();
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa thuật ngữ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-red-600 hover:text-red-900 disabled:opacity-50"
    >
      {loading ? 'Đang xóa...' : 'Xóa'}
    </button>
  );
}

