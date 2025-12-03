import NewCampaign from "../../pages/admin/NewCampaign";
import MembersPanel from "../../pages/admin/MembersPanel";
import ContactMessagesPanel from "../../pages/admin/ContactMessagesPanel";
import NewEventPanel from "../../pages/admin/NewEventPanel";
export default function AdminMain({ tab }) {
  return (
    <section className="flex-1 rounded-2xl border border-white/10 bg-slate-950/85 px-3 py-3 shadow-xl sm:px-4 sm:py-4">
      {tab === "members" && <MembersPanel />}
      {tab === "contacts" && <ContactMessagesPanel />}
      {tab === "campaign" && <NewCampaign />}
      {tab === "event" && <NewEventPanel />}
    </section>
  );
}
