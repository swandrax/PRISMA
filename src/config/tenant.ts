/**
 * PRISMA RT-04 Centralized Tenant Configuration
 * Authoritative source of truth for RT/RW, regional administration, and contact details.
 */

export const TENANT_CONFIG = {
  rt: "04",
  rw: "09",
  kelurahan: "Kemayoran",
  kecamatan: "Kemayoran",
  kota: "Jakarta Pusat",
  provinsi: "DKI Jakarta",
  kodePos: "10620",
  alamatSekretariat: "Gg. Bugis No. 95, RT 04 / RW 09, Kemayoran, Jakarta Pusat 10620",
  jamPelayanan: "08.00 - 20.00 WIB",
  kontak: {
    ketuaRt: {
      nama: "Bpk. R Erry Adu Sundaru",
      jabatan: "Ketua RT 04",
      telepon: "087872004448",
    },
    sekretaris: {
      nama: "Bpk. Swandaru Tirta",
      jabatan: "Sekretaris & IT Specialist",
      telepon: "087782380077",
    },
    bendahara: {
      nama: "Hj. Nurhayati",
      jabatan: "Bendahara RT",
      telepon: "081388992211",
    },
    keamanan: {
      nama: "Bambang Pamungkas",
      jabatan: "Seksi Keamanan & Ketertiban",
      telepon: "081299887766",
    },
    humas: {
      nama: "Dra. Siti Aminah",
      jabatan: "Seksi Humas & Hubungan Warga",
      telepon: "081577665544",
    },
  },
  portalUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://prisma-rose.vercel.app",
};
