import { CONSTITUTION_PDF_URL } from "../constitutionPdf";
import { useI18n } from "../i18n";
import { SITE_URL } from "../links";
import { ProfilePage } from "../ProfilePage";
import { LinkList } from "./LinkList";

const JIWABAKTI_HREF = "https://jiwabakti.com.my/";
const PBB_WIKI_MS = "https://ms.wikipedia.org/wiki/Parti_Pesaka_Bumiputera_Bersatu_Sarawak";

export function SayaPage() {
  const { t } = useI18n();
  const year = String(Math.max(2026, new Date().getFullYear()));
  return (
    <div className="app-page">
      <h1 className="app-page-title">{t("profileTitle")}</h1>
      <ProfilePage />
      <LinkList
        title={t("sayaLinksTitle")}
        items={[
          { href: SITE_URL, title: t("sayaSite"), hint: t("appSiteLink") },
          { href: PBB_WIKI_MS, title: t("kenaliAbout") },
          { href: CONSTITUTION_PDF_URL, title: t("kenaliConstitution") },
          { href: JIWABAKTI_HREF, title: t("jiwaBaktiLink") },
        ]}
      />
      <p className="app-legal">{t("footerCopyright").replace(/\{\{endYear\}\}/g, year)}</p>
    </div>
  );
}
