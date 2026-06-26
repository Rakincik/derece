import prisma from '@/lib/db';
import FAQClient from './FAQClient';

export const revalidate = 3600;

export default async function FAQPage() {
  let settings = {};

  try {
    const rawSettings = await prisma.setting.findMany();
    // Convert settings list to key-value object
    settings = rawSettings.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});
  } catch (err) {
    console.warn('SSS sayfası veritabanı bağlantı hatası, varsayılan statik verilerle yükleniyor:', err.message);
  }

  return <FAQClient settings={settings} />;
}
