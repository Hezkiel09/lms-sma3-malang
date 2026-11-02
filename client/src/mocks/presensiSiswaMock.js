
export const mockStudents = [
  ["10294", "Aisyah Putri"],
  ["10234", "Arya Pratama"],
  ["10295", "Bima Sakti"],
  ["10242", "Citra Maharani"],
  ["10239", "Dimas Prakoso"],
  ["10241", "Fajar Ramadhan"],
  ["10243", "Galih Saputra"],
  ["10244", "Hana Permata"],
  ["10245", "Indra Kusuma"],
  ["10246", "Karina Anindya"],
  ["10237", "Lestari Wijaya"],
  ["10235", "Naura Putri"],
  ["10293", "Rafi Putra"],
  ["10236", "Rafli Nugroho"],
  ["10240", "Salsabila Rahma"],
  ["10250", "Putri Nanda"],
  ["10266", "Bening Aisyah"],
  ["10279", "Putra Baskara"],
  ["10280", "Rohmla Nur"],
  ["10281", "Aditya Pratama"],
  ["10282", "Bella Maharani"],
  ["10283", "Chandra Saputra"],
  ["10284", "Dewi Anggraini"],
  ["10285", "Eka Firmansyah"],
  ["10286", "Farhan Akbar"],
  ["10287", "Gita Amelia"],
  ["10288", "Hafiz Maulana"],
  ["10289", "Intan Permata"],
  ["10290", "Jihan Safira"],
  ["10291", "Kevin Ramadhan"],
  ["10292", "Laila Putri"],
  ["10296", "Muhammad Rizky"],
].map(([nis, name]) => ({
  id: `student-${nis}`,
  nis,
  name,
}));

export function createMockAttendances(
  sessionId,
  method,
  total = 32
) {
  return mockStudents.slice(0, total).map((student) => ({
    id: `${sessionId}-${student.id}`,
    student,
    status: method === "manual" ? "hadir" : "alpha",
    recorded_at:
      method === "manual" ? new Date().toISOString() : null,
    time: null,
    source_text:
      method === "manual" ? "Dicatat guru" : "",
    notes: "",
    corrected_by_teacher: method === "manual",
  }));
}
