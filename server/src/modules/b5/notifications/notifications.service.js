import { supabaseAdmin } from '../../../config/supabase.js';

/**
 * Service: mengambil daftar notifikasi untuk guru.
 * GET /api/v1/b5/notifications
 */
export const getNotificationsService = async () => {
  // Ambil pengumpulan tugas terbaru dari database
  const { data: recentSubmissions, error } = await supabaseAdmin
    .schema('b5')
    .from('submissions')
    .select('id, assignment_id, student_id, submitted_at, status')
    .order('submitted_at', { ascending: false })
    .limit(10);

  if (error) {
    console.warn('[getNotificationsService] Gagal mengambil submissions:', error.message);
  }

  const notifications = [];

  if (recentSubmissions && recentSubmissions.length > 0) {
    for (const sub of recentSubmissions) {
      // Ambil nama siswa
      const { data: student } = await supabaseAdmin
        .schema('master')
        .from('students')
        .select('name')
        .eq('id', sub.student_id)
        .maybeSingle();

      // Ambil judul tugas
      const { data: assignment } = await supabaseAdmin
        .schema('b5')
        .from('assignments')
        .select('id, title')
        .eq('id', sub.assignment_id)
        .maybeSingle();

      if (student && assignment) {
        notifications.push({
          id: sub.id,
          text: `${student.name} mengumpulkan tugas ${assignment.title}`,
          time: sub.submitted_at ? new Date(sub.submitted_at).toLocaleDateString('id-ID') : 'Baru saja',
          assignmentId: assignment.id,
          read: false,
        });
      }
    }
  }

  // Jika belum ada aktivitas di DB, sediakan notifikasi status sistem terkini
  if (notifications.length === 0) {
    // Ambil tugas terakhir yang dibuat
    const { data: latestAssignment } = await supabaseAdmin
      .schema('b5')
      .from('assignments')
      .select('id, title, created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestAssignment) {
      notifications.push({
        id: 'sys-notif-1',
        text: `Tugas "${latestAssignment.title}" aktif. Menunggu pengumpulan siswa.`,
        time: 'Hari ini',
        assignmentId: latestAssignment.id,
        read: false,
      });
    }
  }

  return notifications;
};
