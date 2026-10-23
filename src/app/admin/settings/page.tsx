import { verifyAdminSession } from "@/lib/server/dal";
import { getPaymentSettings, getSiteSettings } from "@/lib/server/db";
import SegmentedControl from "@/components/admin/SegmentedControl";
import BannerSettings from "./BannerSettings";
import NotificationSettingsForm from "./NotificationSettings";
import PaymentSettingsForm from "./PaymentSettings";
import BackupSettings from "./BackupSettings";

const TAB_OPTIONS = [
  { value: "banner", label: "Banner" },
  { value: "notifications", label: "Notifications" },
  { value: "payment", label: "Payment" },
  { value: "backup", label: "Backup" },
];

export default async function AdminSettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await verifyAdminSession();
  const { tab = "banner" } = await searchParams;

  const [siteSettings, paymentSettings] = await Promise.all([getSiteSettings(), getPaymentSettings()]);

  return (
    <div>
      <h1 className="mb-8 font-display text-[22px] font-black tracking-tight md:text-2xl md:font-semibold">Settings</h1>

      <div className="mb-8">
        <SegmentedControl options={TAB_OPTIONS} paramName="tab" />
      </div>

      {tab === "notifications" ? (
        <NotificationSettingsForm settings={siteSettings.notifications} />
      ) : tab === "payment" ? (
        <PaymentSettingsForm settings={paymentSettings} />
      ) : tab === "backup" ? (
        <BackupSettings />
      ) : (
        <BannerSettings home={siteSettings.banners.home} rental={siteSettings.banners.rental} />
      )}
    </div>
  );
}
