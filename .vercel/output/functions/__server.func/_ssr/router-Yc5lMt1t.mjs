import { Q as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { Q as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { c as createRouter, a as createRootRouteWithContext, L as Link, O as Outlet, H as HeadContent, S as Scripts, b as createFileRoute, l as lazyRouteComponent } from "../_libs/tanstack__react-router.mjs";
import { K as redirect } from "../_libs/tanstack__router-core.mjs";
import { j as jsxRuntimeExports, r as reactExports } from "../_libs/react.mjs";
import { s as supabase, b as broadcastAuthChange, g as getAuthBroadcastChannel, p as performGlobalSignOut } from "./client-BqZHQrkq.mjs";
import { T as Toaster$1 } from "../_libs/sonner.mjs";
import { c as createClient } from "../_libs/supabase__supabase-js.mjs";
import { v as verifyWebhookRequest, W as WebhookError } from "../_libs/lovable.dev__webhooks-js.mjs";
import { r as render } from "../_libs/react-email__render.mjs";
import { t as template } from "./tz-CU05rO0J.mjs";
import { s as sendLovableEmail, p as parseEmailWebhookPayload } from "../_libs/lovable.dev__email-js.mjs";
import { e as enqueueDriverNotificationForStop } from "./driver-emails.functions-CYCYga1W.mjs";
import { H as HeartHandshake, S as Sparkles, X, D as Download } from "../_libs/lucide-react.mjs";
import { H as Html } from "../_libs/react-email__html.mjs";
import { H as Head } from "../_libs/react-email__head.mjs";
import { P as Preview } from "../_libs/react-email__preview.mjs";
import { B as Body } from "../_libs/react-email__body.mjs";
import { C as Container } from "../_libs/react-email__container.mjs";
import { H as Heading } from "../_libs/react-email__heading.mjs";
import { T as Text } from "../_libs/react-email__text.mjs";
import { L as Link$1 } from "../_libs/react-email__link.mjs";
import { B as Button } from "../_libs/react-email__button.mjs";
import "../_libs/react-dom.mjs";
import "util";
import "crypto";
import "async_hooks";
import "stream";
import "node:stream";
import "../_libs/isbot.mjs";
import "../_libs/tanstack__history.mjs";
import "../_libs/cookie-es.mjs";
import "../_libs/seroval.mjs";
import "../_libs/seroval-plugins.mjs";
import "node:stream/web";
import "../_libs/supabase__postgrest-js.mjs";
import "../_libs/supabase__realtime-js.mjs";
import "../_libs/supabase__phoenix.mjs";
import "../_libs/supabase__storage-js.mjs";
import "../_libs/iceberg-js.mjs";
import "../_libs/supabase__auth-js.mjs";
import "tslib";
import "../_libs/supabase__functions-js.mjs";
import "../_libs/prettier.mjs";
import "../_libs/html-to-text.mjs";
import "../_libs/selderee__plugin-htmlparser2.mjs";
import "../_libs/selderee.mjs";
import "../_libs/parseley.mjs";
import "../_libs/leac.mjs";
import "../_libs/peberminta.mjs";
import "../_libs/domhandler.mjs";
import "../_libs/domelementtype.mjs";
import "../_libs/htmlparser2.mjs";
import "../_libs/entities.mjs";
import "../_libs/deepmerge.mjs";
import "../_libs/dom-serializer.mjs";
import "./createMiddleware-BvN2ghIY.mjs";
import "./server-Dm1gvL4M.mjs";
import "node:async_hooks";
import "../_libs/h3-v2.mjs";
import "../_libs/rou3.mjs";
import "../_libs/srvx.mjs";
import "../_libs/react-email__section.mjs";
import "../_libs/react-email__img.mjs";
import "./createSsrRpc-Bob-CuPr.mjs";
const appCss = "/assets/styles-Cqr2QBgS.css";
const Ctx$1 = reactExports.createContext({
  user: null,
  session: null,
  profile: null,
  fullName: "",
  avatarUrl: "",
  loading: true,
  roles: [],
  realRoles: [],
  isAdmin: false,
  realIsAdmin: false,
  simulatedRole: null,
  isSimulating: false,
  setSimulatedRole: () => {
  },
  approvalStatus: "unknown",
  isApproved: false,
  signOut: async () => {
  },
  refresh: async () => {
  }
});
function AuthProvider({ children }) {
  const [session, setSession] = reactExports.useState(null);
  const [profile, setProfile] = reactExports.useState(null);
  const [fullName, setFullName] = reactExports.useState("");
  const [avatarUrl, setAvatarUrl] = reactExports.useState("");
  const [loading, setLoading] = reactExports.useState(true);
  const [roles, setRoles] = reactExports.useState([]);
  const [approvalStatus, setApprovalStatus] = reactExports.useState("unknown");
  const [simulatedRole, setSimulatedRoleState] = reactExports.useState(() => {
    if (typeof window === "undefined") return null;
    const saved = localStorage.getItem("kck_kruh_simulated_role");
    if (saved && ["admin", "coordinator", "driver", "viewer"].includes(saved)) {
      return saved;
    }
    return null;
  });
  const setSimulatedRole = (role) => {
    setSimulatedRoleState(role);
    if (typeof window !== "undefined") {
      if (role) {
        localStorage.setItem("kck_kruh_simulated_role", role);
      } else {
        localStorage.removeItem("kck_kruh_simulated_role");
      }
    }
  };
  const ADMIN_BOOTSTRAP_EMAILS = ["ales.lajlar@gmail.com", "whitney.lajlar@gmail.com"];
  const userEmail = session?.user?.email?.toLowerCase()?.trim();
  const isPrimaryAdmin = !!userEmail && ADMIN_BOOTSTRAP_EMAILS.includes(userEmail);
  const loadUserMeta = async (userId, email) => {
    try {
      const emailToMatch = (email || userEmail || "").toLowerCase().trim();
      const [
        { data: rolesData },
        { data: profById },
        { data: profByAuth },
        { data: profByEmail }
      ] = await Promise.all([
        supabase.from("user_roles").select("role").eq("user_id", userId),
        supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
        supabase.from("profiles").select("*").eq("auth_user_id", userId).maybeSingle(),
        emailToMatch ? supabase.from("profiles").select("*").ilike("email", emailToMatch).maybeSingle() : Promise.resolve({ data: null })
      ]);
      const prof = profById || profByAuth || profByEmail;
      const collectedRoles = new Set(
        (rolesData ?? []).map((r) => r.role).filter(Boolean)
      );
      if (prof) {
        if (prof.is_driver) collectedRoles.add("driver");
        if (prof.kruh_role && ["driver", "coordinator", "admin"].includes(prof.kruh_role)) {
          collectedRoles.add(prof.kruh_role);
        }
        if (prof.role) {
          const rLower = String(prof.role).toLowerCase();
          if (rLower.includes("admin") || rLower.includes("leader")) {
            collectedRoles.add("admin");
          }
        }
      }
      let matchedPerson = null;
      try {
        const queryFilters = [];
        if (prof?.id) queryFilters.push(`profile_id.eq.${prof.id}`);
        else if (userId) queryFilters.push(`profile_id.eq.${userId}`);
        if (emailToMatch) queryFilters.push(`email.ilike.${emailToMatch}`);
        if (queryFilters.length > 0) {
          const { data: person } = await supabase.from("people").select("id, full_name, profile_id, email").or(queryFilters.join(",")).limit(1).maybeSingle();
          matchedPerson = person;
          if (person?.id) {
            const { data: prs } = await supabase.from("people_roles").select("role").eq("person_id", person.id);
            (prs ?? []).forEach((r) => {
              if (r.role) collectedRoles.add(r.role);
            });
          }
        }
      } catch (e) {
        console.warn("Could not check linked person/roles:", e);
      }
      if (isPrimaryAdmin) {
        collectedRoles.add("admin");
      }
      const isKnownMember = Boolean(prof || matchedPerson || collectedRoles.size > 0 || isPrimaryAdmin);
      let status = prof?.approval_status ? prof.approval_status : isKnownMember ? "approved" : "approved";
      if (prof?.allowed_apps && Array.isArray(prof.allowed_apps) && !prof.allowed_apps.includes("kruh-zivljenja") && !isPrimaryAdmin) {
        status = "rejected";
      }
      setProfile(prof || null);
      const metaName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || "";
      const rawName = prof?.full_name || prof?.name || matchedPerson?.name || metaName || (emailToMatch ? emailToMatch.split("@")[0] : "");
      setFullName(rawName);
      setAvatarUrl(prof?.avatar_url || session?.user?.user_metadata?.avatar_url || session?.user?.user_metadata?.picture || "");
      setRoles(Array.from(collectedRoles));
      setApprovalStatus(isPrimaryAdmin ? "approved" : status);
    } catch (err) {
      console.warn("Failed to load user meta:", err);
      if (isPrimaryAdmin) {
        setRoles(["admin"]);
        setApprovalStatus("approved");
      } else {
        setApprovalStatus("approved");
      }
    }
  };
  const syncSession = async (s) => {
    setSession(s);
    if (s?.user) {
      await loadUserMeta(s.user.id, s.user.email);
    } else {
      setProfile(null);
      setFullName("");
      setAvatarUrl("");
      setRoles([]);
      setApprovalStatus("unknown");
    }
    setLoading(false);
  };
  reactExports.useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      syncSession(data.session);
    }).catch(() => setLoading(false));
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      syncSession(s);
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        broadcastAuthChange("GLOBAL_SIGNIN");
      } else if (event === "SIGNED_OUT") {
        broadcastAuthChange("GLOBAL_SIGNOUT");
      }
    });
    const channel = getAuthBroadcastChannel();
    if (channel) {
      channel.onmessage = (e) => {
        if (e.data?.type === "GLOBAL_SIGNOUT") {
          syncSession(null);
        } else if (e.data?.type === "GLOBAL_SIGNIN") {
          supabase.auth.getSession().then(({ data }) => {
            syncSession(data.session);
          });
        }
      };
    }
    const handleTabFocus = () => {
      supabase.auth.getSession().then(({ data }) => {
        syncSession(data.session);
      }).catch(() => {
      });
    };
    window.addEventListener("focus", handleTabFocus);
    document.addEventListener("visibilitychange", handleTabFocus);
    return () => {
      sub.subscription.unsubscribe();
      if (channel) channel.close();
      window.removeEventListener("focus", handleTabFocus);
      document.removeEventListener("visibilitychange", handleTabFocus);
    };
  }, []);
  const signOut = async () => {
    await performGlobalSignOut();
    window.location.href = "/login";
  };
  const refresh = async () => {
    if (session?.user) await loadUserMeta(session.user.id, session.user.email);
  };
  const realIsAdmin = isPrimaryAdmin || roles.includes("admin");
  const realRoles = isPrimaryAdmin && !roles.includes("admin") ? [...roles, "admin"] : roles;
  let effectiveIsAdmin = realIsAdmin;
  let effectiveRoles = realRoles;
  const isSimulating = realIsAdmin && simulatedRole !== null && simulatedRole !== "admin";
  if (realIsAdmin && simulatedRole) {
    if (simulatedRole === "admin") {
      effectiveIsAdmin = true;
      effectiveRoles = realRoles;
    } else if (simulatedRole === "coordinator") {
      effectiveIsAdmin = false;
      effectiveRoles = ["coordinator"];
    } else if (simulatedRole === "driver") {
      effectiveIsAdmin = false;
      effectiveRoles = ["driver"];
    } else if (simulatedRole === "viewer") {
      effectiveIsAdmin = false;
      effectiveRoles = [];
    }
  }
  const effectiveIsApproved = isPrimaryAdmin || approvalStatus === "approved";
  const effectiveStatus = isPrimaryAdmin ? "approved" : approvalStatus;
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Ctx$1.Provider,
    {
      value: {
        user: session?.user ?? null,
        session,
        profile,
        fullName,
        avatarUrl,
        loading,
        roles: effectiveRoles,
        realRoles,
        isAdmin: effectiveIsAdmin,
        realIsAdmin,
        simulatedRole: realIsAdmin ? simulatedRole : null,
        isSimulating,
        setSimulatedRole,
        approvalStatus: effectiveStatus,
        isApproved: effectiveIsApproved,
        signOut,
        refresh
      },
      children
    }
  );
}
const useAuth = () => reactExports.useContext(Ctx$1);
const dict = {
  // Brand
  appName: { sl: "KRUH ŽIVLJENJA", en: "KRUH ŽIVLJENJA" },
  tagline: {
    sl: `"Zastonj ste prejeli, zastonj dajte" (Mat 10,8) 
"Jezus jim je rekel: 'Jaz sem kruh življenja. Kdor pride k meni, ne bo lačen, in kdor vame veruje, ne bo nikoli žejen'" (Jn 6,35)`,
    en: `"Freely you have received; freely give" (Mat 10:8 NIV) 
"Then Jesus declared, 'I am the bread of life. Whoever comes to me will never go hungry, and whoever believes in me will never be thirsty'" (John 6.35)`
  },
  verseMatthew: {
    sl: "»Tako kot ste brezplačno prejeli, tudi brezplačno dajajte.« (Matej 10,8)",
    en: "»Freely you have received; freely give.« (Matthew 10:8)"
  },
  verseJohn: {
    sl: "»Jezus jim je rekel: 'Jaz sem kruh življenja. Kdor pride k meni, ne bo lačen, in kdor vame veruje, ne bo nikoli žejen.'« (Jn 6,35)",
    en: "»Jesus declared: 'I am the bread of life. Whoever comes to me will never go hungry, and whoever believes in me will never be thirsty.'« (John 6:35)"
  },
  bannerMotto: {
    sl: "Živa vera se vidi v tem, kar dajemo.",
    en: "Living faith is shown in what we give."
  },
  bannerNeedBread: {
    sl: "POTREBUJEŠ KRUH? TUKAJ JE ZATE.",
    en: "NEED BREAD? HERE IT IS FOR YOU."
  },
  bannerFreelyGiven: {
    sl: "ZASTONJ PREJETO. ZASTONJ DANO.",
    en: "FREELY RECEIVED. FREELY GIVEN."
  },
  bannerBlessingQuote: {
    sl: "»Večji blagoslov je dajati kakor prejemati.«",
    en: "»It is more blessed to give than to receive.«"
  },
  bannerJesus: {
    sl: "— Jezus",
    en: "— Jesus"
  },
  installApp: { sl: "Namesti aplikacijo", en: "Install app" },
  // Auth
  signIn: { sl: "Prijava", en: "Sign in" },
  signInGoogle: { sl: "Prijava z Google", en: "Sign in with Google" },
  signOut: { sl: "Odjava", en: "Sign out" },
  signingIn: { sl: "Prijavljanje…", en: "Signing in…" },
  // Nav
  dashboard: { sl: "Pregled", en: "Dashboard" },
  planner: { sl: "Načrtovalec", en: "Planner" },
  people: { sl: "Osebe", en: "People" },
  recipients: { sl: "Prejemnikov", en: "Recipients" },
  templates: { sl: "Predloge", en: "Templates" },
  admin: { sl: "Admin", en: "Admin" },
  recurringTemplates: { sl: "Ponavljajoče predloge", en: "Recurring templates" },
  applyToFuture: { sl: "Uporabi za prihodnje termine", en: "Apply to future dates" },
  appliedToFuture: { sl: "Predloga uporabljena", en: "Template applied" },
  defaultDriver: { sl: "Privzeti voznik", en: "Default driver" },
  defaultCoordinator: { sl: "Privzeti razdeljevalec", en: "Default distributor" },
  fillBlanksOnly: { sl: "Napolni le prazne", en: "Fill blanks only" },
  overrideExisting: { sl: "Prepiši obstoječe", en: "Override existing" },
  defaultsSaved: { sl: "Privzete vrednosti shranjene", en: "Defaults saved" },
  newHousehold: { sl: "Novo gospodinjstvo", en: "New household" },
  address: { sl: "Naslov", en: "Address" },
  contactName: { sl: "Kontaktna oseba", en: "Contact person" },
  addToTemplate: { sl: "Dodaj v predlogo", en: "Add to template" },
  removeFromTemplate: { sl: "Odstrani iz predloge", en: "Remove from template" },
  noRule: { sl: "Ta termin ni vezan na ponavljajoče pravilo", en: "This date is not linked to a recurring rule" },
  searchHouseholds: { sl: "Išči gospodinjstvo…", en: "Search households…" },
  ruleExists: { sl: "Predloga za ta dan in pogostost že obstaja", en: "A template for this day and frequency already exists" },
  ruleHint: { sl: "Lokacije, voznike in razdeljevalce dodaš v zavihku Predloge.", en: "Add locations, drivers, and distributors in the Templates tab." },
  sharedRecipients: { sl: "Skupni prejemniki (za cel dan)", en: "Shared recipients (whole day)" },
  locationStops: { sl: "Postaje (lokacije)", en: "Stops (locations)" },
  addStopToTemplate: { sl: "Dodaj postajo", en: "Add stop" },
  // Roles
  driver: { sl: "Voznik", en: "Driver" },
  coordinator: { sl: "Razdeljevalec", en: "Distributor" },
  recipient: { sl: "Prejemnik", en: "Recipient" },
  volunteer: { sl: "Prostovoljec", en: "Volunteer" },
  viewer: { sl: "Gledalec", en: "Viewer" },
  adminRole: { sl: "Admin", en: "Admin" },
  adminSimulation: { sl: "ADMIN SIMULACIJA", en: "ADMIN SIMULATION" },
  simulatingRole: { sl: "Simulacija", en: "Simulating" },
  resetSimulation: { sl: "Ponastavi", en: "Reset" },
  // Dashboard
  upcomingDates: { sl: "Prihajajoči termini", en: "Upcoming dates" },
  upcomingAssignments: { sl: "Prihajajoče zadolžitve", en: "Upcoming assignments" },
  nextDate: { sl: "Naslednji termin", en: "Next date" },
  todayLabel: { sl: "Danes", en: "Today" },
  drivers: { sl: "Vozniki", en: "Drivers" },
  coordinators: { sl: "Razdeljevalci", en: "Distributors" },
  recipientsForDay: { sl: "Prejemniki za ta dan", en: "Recipients for this day" },
  noRecipients: { sl: "Ni prejemnikov", en: "No recipients" },
  viewRecipients: { sl: "Poglej prejemnike", en: "View recipients" },
  lastAssignment: { sl: "Zadnja dostava", en: "Last assignment" },
  noPreviousDate: { sl: "Ni prejšnjih terminov", en: "No previous dates" },
  applyScopeTitle: { sl: "Uporabi spremembo za…", en: "Apply change to…" },
  applyScopeHint: { sl: "Ta postaja izhaja iz ponavljajoče predloge. Izberi obseg spremembe.", en: "This stop comes from a recurring template. Choose the scope of the change." },
  scopeOnlyThis: { sl: "Samo ta dan", en: "Only this date" },
  scopeThisAndFuture: { sl: "Ta dan in vsi prihodnji", en: "This date and all future" },
  scopeUpdateTemplate: { sl: "Posodobi predlogo (ta + prihodnji)", en: "Update template (this + future)" },
  scopeApplied: { sl: "Sprememba uporabljena", en: "Change applied" },
  pickedUpByDriver: { sl: "Prevzame voznik", en: "Picked up by driver" },
  forceIncludeLabel: { sl: "Vseeno vključi", en: "Include anyway" },
  linkedPickupHouseholds: { sl: "Povezana gospodinjstva za prevzem", en: "Linked pickup households" },
  linkedPickupHint: { sl: "Ko je ta oseba voznik, bodo izbrana gospodinjstva samodejno izvzeta iz aktivnega seznama za ta dan.", en: "When this person drives, the selected households are auto-excluded from that day's active list." },
  // Ministry Year
  ministryYear: { sl: "Leto služenja", en: "Ministry year" },
  selectYear: { sl: "Izberi leto", en: "Select year" },
  createYear: { sl: "Ustvari novo leto", en: "Create new year" },
  generateYear: { sl: "Ustvari termine za leto", en: "Generate year schedule" },
  yearGenerated: { sl: "Termini ustvarjeni", en: "Schedule generated" },
  // Planner
  date: { sl: "Datum", en: "Date" },
  weekday: { sl: "Dan", en: "Day" },
  location: { sl: "Lokacija", en: "Location" },
  status: { sl: "Status", en: "Status" },
  complete: { sl: "Urejeno", en: "Complete" },
  incomplete: { sl: "Nepopolno", en: "Incomplete" },
  pending: { sl: "V čakanju", en: "Pending" },
  cancelled: { sl: "Odpovedano", en: "Cancelled" },
  notes: { sl: "Opombe", en: "Notes" },
  unassigned: { sl: "Ni dodeljen", en: "Unassigned" },
  assignMeAsDriver: { sl: "Dodeli mene kot voznika", en: "Assign me as driver" },
  assignMeAsDistributor: { sl: "Dodeli mene kot razdeljevalca", en: "Assign me as distributor" },
  confirmSelfAssignTitle: { sl: "Potrdi dodelitev", en: "Confirm assignment" },
  confirmSelfAssignDriver: { sl: "Ali se želiš dodeliti kot voznik za ta dan?", en: "Assign yourself as driver for this day?" },
  confirmSelfAssignDistributor: { sl: "Ali se želiš dodeliti kot razdeljevalec za ta dan?", en: "Assign yourself as distributor for this day?" },
  markComplete: { sl: "Označi kot opravljeno", en: "Mark complete" },
  markIncomplete: { sl: "Razveljavi opravljeno", en: "Mark not done" },
  completedBy: { sl: "Opravil", en: "Completed by" },
  nextUpcoming: { sl: "NASL.\n", en: "Next up" },
  pickupCompleted: { sl: "Prevzem opravljen", en: "Pickup completed" },
  confirmAssign: { sl: "Potrdi dodelitev", en: "Confirm assignment" },
  alreadyAssigned: { sl: "Že dodeljeno", en: "Already assigned" },
  notLinkedToPerson: { sl: "Tvoj račun ni povezan z osebo. Obrni se na administratorja.", en: "Your account is not linked to a person. Contact an admin." },
  viewOnly: { sl: "Samo za ogled", en: "View only" },
  noDates: { sl: "Ni terminov. Ustvari termine v Administraciji.", en: "No dates yet. Generate them from Admin." },
  // Date detail
  back: { sl: "Nazaj", en: "Back" },
  previousDay: { sl: "Prejšnji dan", en: "Previous day" },
  nextDay: { sl: "Naslednji dan", en: "Next day" },
  assignDriver: { sl: "Dodeli voznika", en: "Assign driver" },
  assignCoordinator: { sl: "Dodeli razdeljevalca", en: "Assign distributor" },
  assignedRecipients: { sl: "Dodeljeni prejemniki", en: "Assigned recipients" },
  addRecipient: { sl: "Dodaj prejemnika", en: "Add recipient" },
  addManualName: { sl: "Dodaj ročno (ime)", en: "Add manually (name)" },
  selectHousehold: { sl: "Izberi gospodinjstvo", en: "Select household" },
  selectPerson: { sl: "Izberi osebo", en: "Select person" },
  saveNotes: { sl: "Shrani opombe", en: "Save notes" },
  notePlaceholder: { sl: "Posebne podrobnosti, dostavne opombe, manjkajoči izdelki…", en: "Special pickup details, delivery notes, missing items…" },
  remove: { sl: "Odstrani", en: "Remove" },
  saved: { sl: "Shranjeno", en: "Saved" },
  // People
  fullName: { sl: "Polno ime", en: "Full name" },
  firstName: { sl: "Ime", en: "First name" },
  lastName: { sl: "Priimek", en: "Last name" },
  nameNeedsReview: { sl: "Ime potrebuje pregled", en: "Name needs review" },
  phone: { sl: "Telefon", en: "Phone" },
  email: { sl: "E-pošta", en: "Email" },
  active: { sl: "Aktiven", en: "Active" },
  inactive: { sl: "Neaktiven", en: "Inactive" },
  addPerson: { sl: "Dodaj osebo", en: "Add person" },
  edit: { sl: "Uredi", en: "Edit" },
  save: { sl: "Shrani", en: "Save" },
  cancel: { sl: "Prekliči", en: "Cancel" },
  delete: { sl: "Izbriši", en: "Delete" },
  roles: { sl: "Vloge", en: "Roles" },
  // Recipients
  household: { sl: "Gospodinjstvo", en: "Household" },
  households: { sl: "Gospodinjstva", en: "Households" },
  addHousehold: { sl: "Dodaj gospodinjstvo", en: "Add household" },
  size: { sl: "Velikost", en: "Size" },
  individuals: { sl: "Posamezniki", en: "Individuals" },
  alsoRecipient: { sl: "Označi tudi kot prejemnika", en: "Also mark as recipient" },
  recipientDetails: { sl: "Podatki prejemnika", en: "Recipient details" },
  recipientActive: { sl: "Prejemnik aktiven", en: "Recipient active" },
  householdName: { sl: "Ime gospodinjstva", en: "Household name" },
  householdSize: { sl: "Število oseb", en: "Number of people" },
  driverPickupHouseholdsTitle: { sl: "Gospodinjstva za prevzem", en: "Pickup households" },
  driverPickupHouseholdsHelp: { sl: "Ko ta oseba vozi, bodo ta gospodinjstva izključena iz aktivnega seznama.", en: "When this person drives, these households will be excluded from the active list." },
  // Delete
  deleteEntry: { sl: "Odstrani osebo", en: "Remove person" },
  confirmDelete: { sl: "Odstrani iz Kruh Življenja", en: "Remove from Kruh Življenja" },
  deleteWarning: { sl: "Ali ste prepričani, da želite to osebo odstraniti iz aplikacije Kruh Življenja?", en: "Are you sure you want to remove this person from Kruh Življenja?" },
  archiveInsteadWarning: {
    sl: "Ta oseba je zabeležena v načrtovalniku ali zgodovini. Skrita bo z aktivnih seznamov v Kruh Življenja, zgodovina pa ostane ohranjena. Profil v cerkveni bazi ostane povsem nespremenjen.",
    en: "This entry is used in the planner or history. It will be hidden from active lists in Kruh Življenja while preserving history. Their church profile remains untouched."
  },
  permanentDeleteWarning: {
    sl: "Ta oseba bo odstranjena samo iz aplikacije Kruh Življenja. Njen profil v bazi cerkve ostane povsem nespremenjen in varen.",
    en: "This person will only be removed from Kruh Življenja. Their profile in the church database remains completely untouched and safe."
  },
  archive: { sl: "Arhiviraj v aplikaciji", en: "Archive in app" },
  deletePermanently: { sl: "Odstrani iz aplikacije", en: "Remove from app" },
  deleted: { sl: "Odstranjeno iz aplikacije", en: "Removed from app" },
  archived: { sl: "Arhivirano v aplikaciji", en: "Archived in app" },
  checkingUsage: { sl: "Preverjam uporabo…", en: "Checking usage…" },
  // Admin
  manageUsers: { sl: "Upravljanje uporabnikov", en: "Manage users" },
  manageRoles: { sl: "Upravljanje vlog", en: "Manage roles" },
  ministryYears: { sl: "Ministrska leta", en: "Ministry years" },
  recurringRules: { sl: "Ponavljajoča pravila", en: "Recurring rules" },
  locations: { sl: "Lokacije", en: "Locations" },
  addLocation: { sl: "Dodaj lokacijo", en: "Add location" },
  newLocation: { sl: "Nova lokacija", en: "New location" },
  changeLocation: { sl: "Zamenjaj lokacijo", en: "Change location" },
  newEntry: { sl: "Nov vnos", en: "New entry" },
  addEntry: { sl: "Dodaj vnos", en: "Add entry" },
  entryAdded: { sl: "Vnos dodan", en: "Entry added" },
  entryExists: { sl: "Vnos za ta datum že obstaja", en: "Entry for this date already exists" },
  oneOffEntry: { sl: "Enkratni vnos", en: "One-off entry" },
  addOneOffEntry: { sl: "Dodaj enkratni vnos", en: "Add one-off entry" },
  optional: { sl: "neobvezno", en: "optional" },
  recipientsLabel: { sl: "Prejemniki", en: "Recipients" },
  notesLabel: { sl: "Opombe", en: "Notes" },
  stops: { sl: "Postaje", en: "Stops" },
  stop: { sl: "Postaja", en: "Stop" },
  addStop: { sl: "Dodaj postajo", en: "Add stop" },
  removeStop: { sl: "Odstrani postajo", en: "Remove stop" },
  noStops: { sl: "Ni postaj", en: "No stops" },
  stopExists: { sl: "Ta lokacija je že na tem dnevu", en: "This location is already on this day" },
  addRule: { sl: "Dodaj pravilo", en: "Add rule" },
  weekly: { sl: "Tedensko", en: "Weekly" },
  biweekly: { sl: "Vsakih 14 dni", en: "Bi-weekly" },
  startYear: { sl: "Začetno leto (sept.)", en: "Start year (Sep)" },
  // Admin tabs & labels
  activeTeam: { sl: "Aktivna ekipa", en: "Active team" },
  driversTab: { sl: "Vozniki", en: "Drivers" },
  coordinatorsTab: { sl: "Razdeljevalci", en: "Distributors" },
  recipientsTab: { sl: "Prejemniki", en: "Recipients" },
  rejectedTab: { sl: "Zavrnjeni", en: "Rejected" },
  allMembersTab: { sl: "Vsi člani", en: "All members" },
  inPeopleBadge: { sl: "v bazi oseb", en: "in People list" },
  searchUsersPlaceholder: { sl: "Išči po imenu, e-pošti ali telefonu…", en: "Search by name, email or phone…" },
  recipientStatusUpdated: { sl: "Status prejemnika posodobljen", en: "Recipient status updated" },
  // Recurring & Templates
  recurringScheduleTitle: { sl: "Ponavljajoči tedenski urnik & predloge", en: "Recurring weekly schedule & templates" },
  recurringScheduleDesc: {
    sl: "Določite, katere dni v tednu se izvajajo prevzemi, katere postaje/lokacije se obiščejo in katera gospodinjstva prejmejo pomoč.",
    en: "Define which weekdays food pickups occur, which stops/locations are visited, and which recipient households receive assistance."
  },
  addWeekdayRule: { sl: "Dodaj nov dan v tednu za prevzem:", en: "Add new weekday for pickup:" },
  noRecurringRules: {
    sl: 'Ni dodanih ponavljajočih pravil. Zgoraj izberite dan in kliknite "+ Dodaj pravilo".',
    en: 'No recurring rules added. Select a day above and click "+ Add rule".'
  },
  seedDefaultRules: { sl: "Nastavi privzeti urnik (Pon & Čet)", en: "Set default schedule (Mon & Thu)" },
  manageUsersDesc: {
    sl: "Pregled in dodeljevanje vlog (Voznik, Razdeljevalec, Administrator, Prejemnik) za služenje pri Kruhu Življenja.",
    en: "Overview and assignment of roles (Driver, Distributor, Administrator, Recipient) for Kruh Življenja service."
  },
  peopleSubtitle: {
    sl: "Združen pregled vseh prostovoljcev, voznikov, razdeljevalcev in prejemnikov.",
    en: "Unified overview of all volunteers, drivers, distributors, and recipients."
  },
  ministryYearCardTitle: { sl: "Generiranje ministrskega leta", en: "Ministry Year Generation" },
  ministryYearCardDesc: {
    sl: "Ustvari ali posodobi vse termine in postaje v koledarju za izbrano leto na podlagi ponavljajočih pravil.",
    en: "Create or refresh all dates and stops in the calendar for the selected year based on recurring rules."
  },
  generateMinistryYearBtn: { sl: "Generiraj koledar za leto", en: "Generate calendar for year" },
  datesGeneratedCount: { sl: "generiranih terminov", en: "dates generated" },
  notGeneratedYet: { sl: "Ni še generirano za to leto", en: "Not yet generated for this year" },
  // Misc
  loading: { sl: "Nalaganje…", en: "Loading…" },
  error: { sl: "Napaka", en: "Error" },
  notLoggedIn: { sl: "Niste prijavljeni", en: "Not signed in" },
  language: { sl: "Jezik", en: "Language" },
  // Approval
  pendingApprovalTitle: { sl: "Račun čaka na potrditev", en: "Account awaiting approval" },
  pendingApprovalBody: {
    sl: "Vaš račun čaka, da ga administrator potrdi. Po potrditvi boste imeli dostop do zasebnih razdelkov aplikacije.",
    en: "Your account is awaiting admin approval. Once approved, you'll get access to the private sections of the app."
  },
  accessRejectedTitle: { sl: "Dostop zavrnjen", en: "Access rejected" },
  accessRejectedBody: {
    sl: "Vaš dostop je bil zavrnjen. Obrnite se na administratorja za več informacij.",
    en: "Your access has been rejected. Please contact an administrator for more information."
  },
  openPublicDashboard: { sl: "Odpri javni pregled", en: "Open public dashboard" },
  checkAgain: { sl: "Preveri znova", en: "Check again" },
  pendingUsers: { sl: "Čakajoči uporabniki", en: "Pending users" },
  approvedUsers: { sl: "Potrjeni uporabniki", en: "Approved users" },
  rejectedUsers: { sl: "Zavrnjeni uporabniki", en: "Rejected users" },
  approve: { sl: "Potrdi", en: "Approve" },
  reject: { sl: "Zavrni", en: "Reject" },
  reactivate: { sl: "Ponovno aktiviraj", en: "Reactivate" },
  noPendingUsers: { sl: "Ni čakajočih uporabnikov", en: "No pending users" },
  signedUpOn: { sl: "Prijavil se", en: "Signed up" },
  userApproved: { sl: "Uporabnik potrjen", en: "User approved" },
  userRejected: { sl: "Uporabnik zavrnjen", en: "User rejected" },
  personLinked: { sl: "Povezano z osebo", en: "Linked to person" },
  personCreated: { sl: "Nova oseba ustvarjena", en: "Person created" },
  matchPersonTitle: { sl: "Najdene možne ujemajoče osebe", en: "Possible matching people found" },
  matchPersonBody: { sl: "Najdene so možne ujemajoče osebe (po e-pošti ali imenu). Poveži z obstoječo ali ustvari novo.", en: "Possible matches were found (by email or name). Link to an existing one or create new." },
  linkToThisPerson: { sl: "Poveži s to osebo", en: "Link to this person" },
  createNewPerson: { sl: "Ustvari novo osebo", en: "Create new person" },
  matchByEmail: { sl: "Ujemanje po e-pošti", en: "Email match" },
  matchByName: { sl: "Ujemanje po imenu", en: "Name match" },
  syncAllToPeople: { sl: "Sinhroniziraj vse v Osebe", en: "Sync all to People" },
  syncAllSuccess: { sl: "Člani uspešno sinhronizirani v Osebe", en: "Members synced to People successfully" },
  addToPeople: { sl: "Dodaj med osebe", en: "Add to People" },
  alreadyInPeople: { sl: "Že med osebami", en: "Already in People" },
  regenerateDates: { sl: "Osveži termine", en: "Refresh dates" },
  datesGenerated: { sl: "Termini za leto uspešno ustvarjeni", en: "Schedule dates created successfully" },
  roleUpdated: { sl: "Vloga posodobljena", en: "Role updated" },
  // Email queue admin
  emailQueue: { sl: "E-pošta", en: "Email queue" },
  emailQueueTitle: { sl: "Čakalna vrsta e-pošte", en: "Email queue" },
  emailSummaryPending: { sl: "V čakanju", en: "Queued" },
  emailSummarySent: { sl: "Predano (30 dni)", en: "Handed off (30d)" },
  emailSummarySentToday: { sl: "Predano danes", en: "Handed off today" },
  emailSummaryDelivered: { sl: "Dostavljeno", en: "Delivered" },
  emailSummaryFailed: { sl: "Napaka", en: "Failed" },
  emailSummarySkipped: { sl: "Preskočeno", en: "Skipped" },
  emailSummarySuppressed: { sl: "Blokirano", en: "Suppressed" },
  emailFilterStatus: { sl: "Status", en: "Status" },
  emailFilterType: { sl: "Tip", en: "Type" },
  emailFilterAll: { sl: "Vse", en: "All" },
  emailTypeAssignment: { sl: "Dodelitev", en: "Assignment" },
  emailTypeChange: { sl: "Sprememba", en: "Change" },
  emailTypeReminder: { sl: "Opomnik 24h", en: "24h reminder" },
  emailColRecipient: { sl: "Prejemnik", en: "Recipient" },
  emailColType: { sl: "Tip", en: "Type" },
  emailColStop: { sl: "Postaja / datum", en: "Stop / date" },
  emailColCreated: { sl: "Ustvarjeno", en: "Created" },
  emailColSent: { sl: "Predano ponudniku", en: "Handed to provider" },
  emailColProviderRef: { sl: "ID ponudnika", en: "Provider ref" },
  emailStatusInfo: {
    sl: "»Predano ponudniku« pomeni, da je naš sistem e-pošto izročil ponudniku. Ne pomeni, da je prispela v nabiralnik. Dostava je potrjena šele po prejetju povratne informacije ponudnika (npr. zavrnitev ali pritožba).",
    en: "“Handed to provider” means our system handed the email to the provider. It does NOT mean the message reached the inbox. Delivery is only confirmed via provider callbacks (bounces, complaints, suppressions)."
  },
  emailStatusTipPending: { sl: "V naši čakalni vrsti, še ni poskusa.", en: "In our queue, not yet attempted." },
  emailStatusTipSent: { sl: "Ponudnik je sprejel zahtevo. Dostava v nabiralnik ni potrjena.", en: "Provider accepted the request. Inbox delivery not confirmed." },
  emailStatusTipDelivered: { sl: "Ponudnik potrjuje dostavo prejemnikovemu strežniku.", en: "Provider confirms delivery to the recipient's mail server." },
  emailStatusTipBounced: { sl: "Ponudnik javlja, da e-pošta ni mogla biti dostavljena.", en: "Provider reports the email could not be delivered." },
  emailStatusTipComplained: { sl: "Prejemnik je e-pošto označil kot vsiljeno.", en: "Recipient marked the email as spam." },
  emailStatusTipFailed: { sl: "Napaka pri klicu ponudnika; sistem bo poskusil znova.", en: "Provider call failed; system will retry." },
  emailStatusTipDlq: { sl: "Preseženo število poskusov ali rok – ne bo več poskusov.", en: "Retries or TTL exhausted — no further attempts." },
  emailStatusTipSuppressed: { sl: "Naslov je na seznamu blokad; ni poslano.", en: "Address is on the suppression list; not sent." },
  emailColStatus: { sl: "Status", en: "Status" },
  emailColError: { sl: "Napaka", en: "Error" },
  emailCronTitle: { sl: "Razporejeni opravki (cron)", en: "Scheduled jobs (cron)" },
  emailCronJob: { sl: "Opravilo", en: "Job" },
  emailCronSchedule: { sl: "Razpored", en: "Schedule" },
  emailCronActive: { sl: "Aktivno", en: "Active" },
  emailCronLastRun: { sl: "Zadnji zagon", en: "Last run" },
  emailCronStatus: { sl: "Status", en: "Status" },
  emailToolsTitle: { sl: "Orodja za testiranje", en: "Testing tools" },
  emailSendTestToMe: { sl: "Pošlji testno e-pošto meni", en: "Send test email to me" },
  emailManualTrigger: { sl: "Ročno sproži obvestilo", en: "Manually trigger notification" },
  emailPickStop: { sl: "Izberi postajo z voznikom", en: "Choose an assigned stop" },
  emailPreviewBtn: { sl: "Predogled", en: "Preview" },
  emailTriggerBtn: { sl: "Sproži", en: "Trigger" },
  emailNoRows: { sl: "Ni zapisov.", en: "No entries yet." },
  emailNoDriverEmail: { sl: "Voznik nima e-pošte", en: "Driver has no email" },
  emailPreviewTitle: { sl: "Predogled e-pošte", en: "Email preview" },
  emailTestSent: { sl: "Testna e-pošta v čakalni vrsti", en: "Test email queued" },
  emailTriggered: { sl: "Obvestilo sproženo", en: "Notification triggered" },
  emailDomainWarning: { sl: "Domena pošiljatelja še ni potrjena – pošta bo zaustavljena.", en: "Sender domain not verified yet — emails will be rejected." },
  monthsShort: {
    sl: ["Jan", "Feb", "Mar", "Apr", "Maj", "Jun", "Jul", "Avg", "Sep", "Okt", "Nov", "Dec"],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  },
  monthsLong: {
    sl: ["januar", "februar", "marec", "april", "maj", "junij", "julij", "avgust", "september", "oktober", "november", "december"],
    en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
  },
  weekdaysShort: {
    sl: ["Ned", "Pon", "Tor", "Sre", "Čet", "Pet", "Sob"],
    en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  },
  // Email templates editor
  emailTemplates: { sl: "Predloge e-pošte", en: "Email templates" },
  etTitle: { sl: "Predloge e-pošte", en: "Email templates" },
  etTemplates: { sl: "Predloge", en: "Templates" },
  etAssignment: { sl: "Dodelitev voznika", en: "Driver assignment" },
  etAssignmentSub: { sl: "Ko je voznik dodeljen.", en: "When a driver is newly assigned." },
  etChange: { sl: "Sprememba razporeda", en: "Schedule change" },
  etChangeSub: { sl: "Ko se obstoječa dodelitev spremeni.", en: "When an existing assignment changes." },
  etReminder: { sl: "24h opomnik", en: "24h reminder" },
  etReminderSub: { sl: "Dan pred prevzemom.", en: "The day before pickup." },
  etTest: { sl: "Testno sporočilo", en: "Test message" },
  etTestSub: { sl: "Gumb 'Pošlji test' v vrsti e-pošte.", en: "Email Queue 'Send test' button." },
  etSubject: { sl: "Zadeva", en: "Subject" },
  etBody: { sl: "Vsebina", en: "Body" },
  etFooter: { sl: "Podpis", en: "Footer" },
  etFooterPlaceholder: { sl: "Lep pozdrav,\nKruh življenja", en: "Best regards,\nKruh življenja" },
  etPlaceholders: { sl: "Oznake", en: "Placeholders" },
  etPlaceholdersHelp: { sl: "Klikni za vstavitev v izbrano polje.", en: "Click to insert into the focused field." },
  etSave: { sl: "Shrani", en: "Save" },
  etSaved: { sl: "Shranjeno", en: "Saved" },
  etResetDefault: { sl: "Ponastavi na privzeto", en: "Reset to default" },
  etConfirmReset: { sl: "Ponastavim na privzeto vsebino?", en: "Reset to default content?" },
  etReset: { sl: "Ponastavljeno na privzeto", en: "Reset to default" },
  etEdit: { sl: "Urejanje", en: "Edit" },
  etPreview: { sl: "Predogled", en: "Preview" },
  etRefreshPreview: { sl: "Osveži predogled", en: "Refresh preview" },
  etUsingDefault: { sl: "Privzeto (še ni shranjeno)", en: "Default (not yet saved)" },
  etBrand: { sl: "Blagovna znamka e-pošte", en: "Email brand" },
  etBrandHelp: { sl: "Velja za vse predloge — logotip, glava in podpis.", en: "Applies to all templates — logo, header, footer." },
  etBrandSaved: { sl: "Blagovna znamka shranjena", en: "Brand saved" },
  etSaveBrand: { sl: "Shrani blagovno znamko", en: "Save brand" },
  etAppName: { sl: "Ime aplikacije", en: "App name" },
  etPrimaryColor: { sl: "Osnovna barva", en: "Primary color" },
  etLogoUrl: { sl: "URL logotipa (https)", en: "Logo URL (https)" },
  etHeaderUrl: { sl: "URL slike glave (https)", en: "Header image URL (https)" },
  etGlobalFooter: { sl: "Privzeti podpis (če predloga nima svojega)", en: "Default footer (if template omits one)" },
  etGlobalFooterPlaceholder: { sl: "npr. Ministrstvo Kruh življenja", en: "e.g. Kruh življenja ministry" },
  etProviderManaged: { sl: "Avtentikacijska e-pošta", en: "Authentication emails" },
  etProviderManagedDesc: {
    sl: "Sporočila za prijavo, ponastavitev gesla in vabila ureja avtentikacijski ponudnik in jih tukaj ni mogoče urejati.",
    en: "Sign-in, password reset and invite emails are managed by the authentication provider and cannot be edited here."
  },
  // Stop messages (Planner thread + Dashboard latest update)
  messages: { sl: "Sporočila", en: "Messages" },
  noMessages: { sl: "Še ni sporočil", en: "No messages yet" },
  messagePlaceholder: { sl: "Napiši kratko sporočilo o prevzemu…", en: "Write a short pickup update…" },
  send: { sl: "Pošlji", en: "Send" },
  latestUpdate: { sl: "Zadnja posodobitev", en: "Latest update" },
  chipBread: { sl: "Kruh", en: "Bread" },
  chipSandwiches: { sl: "Sendviči", en: "Sandwiches" },
  chipFruit: { sl: "Sadje", en: "Fruit" },
  chipVegetables: { sl: "Zelenjava", en: "Vegetables" },
  chipMeat: { sl: "Meso", en: "Meat" },
  chipDesserts: { sl: "Sladice", en: "Desserts" },
  chipMilk: { sl: "Mleko", en: "Milk" },
  chipYogurts: { sl: "Jogurti", en: "Yogurts" },
  chipSalads: { sl: "Solate", en: "Salads" },
  chipPastries: { sl: "Pecivo", en: "Pastries" },
  chipExtraAmount: { sl: "Več kot običajno", en: "Extra amount" },
  chipSmallAmount: { sl: "Manj kot običajno", en: "Small amount" },
  modifierHint: { sl: "Najprej izberi živilo, nato dodaj + ali −.", en: "Pick a food item first, then apply + or −." }
};
const Ctx = reactExports.createContext({
  lang: "sl",
  setLang: () => {
  },
  t: (k) => k,
  tArr: () => []
});
function I18nProvider({ children }) {
  const [lang, setLangState] = reactExports.useState("sl");
  reactExports.useEffect(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("kz_lang") : null;
    if (saved === "sl" || saved === "en") setLangState(saved);
  }, []);
  const setLang = (l) => {
    setLangState(l);
    if (typeof window !== "undefined") localStorage.setItem("kz_lang", l);
  };
  const t = (k) => {
    const v = dict[k]?.[lang];
    return typeof v === "string" ? v : k;
  };
  const tArr = (k) => {
    const v = dict[k]?.[lang];
    return Array.isArray(v) ? v : [];
  };
  return /* @__PURE__ */ jsxRuntimeExports.jsx(Ctx.Provider, { value: { lang, setLang, t, tArr }, children });
}
const useI18n = () => reactExports.useContext(Ctx);
const Toaster = ({ ...props }) => {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    Toaster$1,
    {
      className: "toaster group",
      toastOptions: {
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground"
        }
      },
      ...props
    }
  );
};
function registerPWA() {
  if (typeof window === "undefined") return;
  if (!("serviceWorker" in navigator)) return;
  const isInIframe = (() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  })();
  const host = window.location.hostname;
  const isPreviewHost = host.includes("id-preview--") || host.includes("lovableproject.com") || host.endsWith(".lovable.dev");
  if (isInIframe || isPreviewHost) {
    navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {
    });
    return;
  }
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch(() => {
    });
  });
}
function PwaInstallBanner() {
  const { lang } = useI18n();
  const [deferredPrompt, setDeferredPrompt] = reactExports.useState(null);
  const [isVisible, setIsVisible] = reactExports.useState(false);
  const [isDismissed, setIsDismissed] = reactExports.useState(false);
  reactExports.useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(display-mode: standalone)").matches) {
      return;
    }
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!sessionStorage.getItem("kruh_pwa_dismissed")) {
        setIsVisible(true);
      }
    };
    const installedHandler = () => {
      setIsVisible(false);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    const timer = setTimeout(() => {
      if (!sessionStorage.getItem("kruh_pwa_dismissed") && !window.matchMedia("(display-mode: standalone)").matches) {
        setIsVisible(true);
      }
    }, 3500);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
      clearTimeout(timer);
    };
  }, []);
  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      alert(
        lang === "sl" ? "Za namestitev aplikacije Kruh življenja na telefon izberite »Dodaj na začetni zaslon« v meniju brskalnika." : 'To install Bread of Life on your home screen, tap "Add to Home Screen" in your browser menu.'
      );
      setIsVisible(false);
    }
  };
  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    sessionStorage.setItem("kruh_pwa_dismissed", "true");
  };
  if (!isVisible || isDismissed) return null;
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 max-w-sm w-full bg-[#26170E] text-white p-4 rounded-2xl shadow-2xl border border-amber-700/40 animate-in slide-in-from-bottom-6 duration-300", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-start justify-between gap-3 mb-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2.5", children: [
        /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "w-8 h-8 rounded-xl bg-[#A06F3A] text-white flex items-center justify-center font-black text-sm border border-amber-400/30 shadow-xs", children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeartHandshake, { className: "w-4 h-4 text-amber-100" }) }),
        /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { children: [
          /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-xs font-black tracking-wide text-white flex items-center gap-1.5", children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lang === "sl" ? "Namestite Kruh življenja" : "Install Bread of Life App" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx(Sparkles, { className: "w-3 h-3 text-amber-300" })
          ] }),
          /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "text-[10px] text-amber-200/90", children: lang === "sl" ? "Razdeljevanje hrane, urnik & obvestila" : "Food distribution, schedules & alerts" })
        ] })
      ] }),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleDismiss,
          className: "text-stone-400 hover:text-white transition-colors cursor-pointer p-1",
          "aria-label": "Dismiss",
          children: /* @__PURE__ */ jsxRuntimeExports.jsx(X, { className: "w-4 h-4" })
        }
      )
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "flex items-center gap-2 pt-2", children: [
      /* @__PURE__ */ jsxRuntimeExports.jsxs(
        "button",
        {
          onClick: handleInstallClick,
          className: "flex-1 py-2 px-3 rounded-xl bg-[#A06F3A] hover:bg-[#8B5E34] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-all border border-amber-400/20",
          children: [
            /* @__PURE__ */ jsxRuntimeExports.jsx(Download, { className: "w-3.5 h-3.5" }),
            /* @__PURE__ */ jsxRuntimeExports.jsx("span", { children: lang === "sl" ? "Namesti na telefon / PC" : "Add to Home Screen" })
          ]
        }
      ),
      /* @__PURE__ */ jsxRuntimeExports.jsx(
        "button",
        {
          onClick: handleDismiss,
          className: "py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium transition-colors cursor-pointer",
          children: lang === "sl" ? "Kasneje" : "Later"
        }
      )
    ] })
  ] });
}
const Route$l = createRootRouteWithContext()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "KRUH ŽIVLJENJA" },
      { name: "description", content: "Načrtovanje prevzemov in razdeljevanja hrane / Food pickup and distribution planner" },
      { property: "og:title", content: "KRUH ŽIVLJENJA" },
      { name: "twitter:title", content: "KRUH ŽIVLJENJA" },
      { property: "og:description", content: "Načrtovanje prevzemov in razdeljevanja hrane / Food pickup and distribution planner" },
      { name: "twitter:description", content: "Načrtovanje prevzemov in razdeljevanja hrane / Food pickup and distribution planner" },
      { property: "og:image", content: "/LOGO-kruh.webp" },
      { name: "twitter:image", content: "/LOGO-kruh.webp" },
      { name: "theme-color", content: "#744927" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-title", content: "Kruh življenja" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" }
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400&family=Outfit:wght@400;500;600;700;800;900&family=Fraunces:wght@500;600;700&display=swap" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "icon", type: "image/webp", href: "/LOGO-kruh.webp" },
      { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
      { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.webmanifest" }
    ]
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: () => /* @__PURE__ */ jsxRuntimeExports.jsx("div", { className: "flex min-h-screen items-center justify-center bg-background px-4", children: /* @__PURE__ */ jsxRuntimeExports.jsxs("div", { className: "text-center", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("h1", { className: "text-6xl font-bold text-primary", children: "404" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx("p", { className: "mt-2 text-muted-foreground", children: "Stran ne obstaja / Page not found" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Link, { to: "/", className: "mt-6 inline-block text-primary underline", children: "Domov / Home" })
  ] }) })
});
function RootShell({ children }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsxs("html", { lang: "sl", children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx("head", { children: /* @__PURE__ */ jsxRuntimeExports.jsx(HeadContent, {}) }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs("body", { children: [
      children,
      /* @__PURE__ */ jsxRuntimeExports.jsx(Scripts, {})
    ] })
  ] });
}
function RootComponent() {
  const { queryClient } = Route$l.useRouteContext();
  reactExports.useEffect(() => {
    registerPWA();
  }, []);
  return /* @__PURE__ */ jsxRuntimeExports.jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsxRuntimeExports.jsx(I18nProvider, { children: /* @__PURE__ */ jsxRuntimeExports.jsxs(AuthProvider, { children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Outlet, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(PwaInstallBanner, {}),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Toaster, { richColors: true, position: "top-right" })
  ] }) }) });
}
const $$splitComponentImporter$b = () => import("./pending-approval-CyUTIKzP.mjs");
const Route$k = createFileRoute("/pending-approval")({
  component: lazyRouteComponent($$splitComponentImporter$b, "component")
});
const $$splitComponentImporter$a = () => import("./login-BUuaCHn1.mjs");
const Route$j = createFileRoute("/login")({
  component: lazyRouteComponent($$splitComponentImporter$a, "component")
});
const $$splitComponentImporter$9 = () => import("./dashboard-CgddIiJT.mjs");
const Route$i = createFileRoute("/dashboard")({
  component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
const $$splitComponentImporter$8 = () => import("../_authenticated-6fii2Ywx.mjs");
const Route$h = createFileRoute("/_authenticated")({
  component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
const Route$g = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard", replace: true });
  }
});
function redactEmail$2(email) {
  if (!email) return "***";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "***";
  return `${localPart[0]}***@${domain}`;
}
const Route$f = createFileRoute("/email/unsubscribe")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const supabaseUrl = "https://ptdvcobgplmngnhkjqag.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }
        const url = new URL(request.url);
        const token = url.searchParams.get("token");
        if (!token) {
          return Response.json({ error: "Token is required" }, { status: 400 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: tokenRecord, error: lookupError } = await supabase2.from("email_unsubscribe_tokens").select("*").eq("token", token).maybeSingle();
        if (lookupError || !tokenRecord) {
          return Response.json({ error: "Invalid or expired token" }, { status: 404 });
        }
        if (tokenRecord.used_at) {
          return Response.json({ valid: false, reason: "already_unsubscribed" });
        }
        return Response.json({ valid: true });
      },
      POST: async ({ request }) => {
        const supabaseUrl = "https://ptdvcobgplmngnhkjqag.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }
        const url = new URL(request.url);
        let token = url.searchParams.get("token");
        const contentType = request.headers.get("content-type") ?? "";
        if (contentType.includes("application/x-www-form-urlencoded")) {
          const formText = await request.text();
          const params = new URLSearchParams(formText);
          if (!params.get("List-Unsubscribe")) {
            const formToken = params.get("token");
            if (formToken) {
              token = formToken;
            }
          }
        } else {
          try {
            const body = await request.json();
            if (body.token) {
              token = body.token;
            }
          } catch {
          }
        }
        if (!token) {
          return Response.json({ error: "Token is required" }, { status: 400 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: tokenRecord, error: lookupError } = await supabase2.from("email_unsubscribe_tokens").select("*").eq("token", token).maybeSingle();
        if (lookupError || !tokenRecord) {
          return Response.json({ error: "Invalid or expired token" }, { status: 404 });
        }
        if (tokenRecord.used_at) {
          return Response.json({ success: false, reason: "already_unsubscribed" });
        }
        const { data: updated, error: updateError } = await supabase2.from("email_unsubscribe_tokens").update({ used_at: (/* @__PURE__ */ new Date()).toISOString() }).eq("token", token).is("used_at", null).select().maybeSingle();
        if (updateError) {
          console.error("Failed to mark token as used", { error: updateError, token });
          return Response.json({ error: "Failed to process unsubscribe" }, { status: 500 });
        }
        if (!updated) {
          return Response.json({ success: false, reason: "already_unsubscribed" });
        }
        const { error: suppressError } = await supabase2.from("suppressed_emails").upsert(
          { email: tokenRecord.email.toLowerCase(), reason: "unsubscribe" },
          { onConflict: "email" }
        );
        if (suppressError) {
          console.error("Failed to suppress email", {
            error: suppressError,
            email_redacted: redactEmail$2(tokenRecord.email)
          });
          return Response.json({ error: "Failed to process unsubscribe" }, { status: 500 });
        }
        console.log("Email unsubscribed", {
          email_redacted: redactEmail$2(tokenRecord.email)
        });
        return Response.json({ success: true });
      }
    }
  }
});
const $$splitComponentImporter$7 = () => import("./templates-D0Q-99xE.mjs");
const Route$e = createFileRoute("/_authenticated/templates")({
  component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
const $$splitComponentImporter$6 = () => import("./recipients-CLrM-DN1.mjs");
const Route$d = createFileRoute("/_authenticated/recipients")({
  component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
const $$splitComponentImporter$5 = () => import("./people-CljMHPfW.mjs");
const Route$c = createFileRoute("/_authenticated/people")({
  component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
const $$splitComponentImporter$4 = () => import("./email-templates-B4ZnaPaA.mjs");
const Route$b = createFileRoute("/_authenticated/email-templates")({
  component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
const $$splitComponentImporter$3 = () => import("./email-queue-BQB22RX7.mjs");
const Route$a = createFileRoute("/_authenticated/email-queue")({
  component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
const $$splitComponentImporter$2 = () => import("./admin-DgGydi3X.mjs");
const Route$9 = createFileRoute("/_authenticated/admin")({
  component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
const $$splitComponentImporter$1 = () => import("./planner.index-BQx0zotp.mjs");
const Route$8 = createFileRoute("/_authenticated/planner/")({
  component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
function parseSuppressionPayload(body) {
  const parsed = JSON.parse(body);
  if (!parsed.data) {
    throw new Error("Missing data field in payload");
  }
  const data = parsed.data;
  if (!data.email || !data.reason) {
    throw new Error("Missing required fields: email, reason");
  }
  return data;
}
function mapReasonToStatus(reason) {
  switch (reason) {
    case "bounce":
      return "bounced";
    case "complaint":
      return "complained";
    default:
      return "suppressed";
  }
}
function mapReasonToMessage(reason) {
  switch (reason) {
    case "bounce":
      return "Permanent bounce — email address is invalid or rejected";
    case "complaint":
      return "Spam complaint — recipient marked email as spam";
    case "unsubscribe":
      return "Recipient unsubscribed";
    default:
      return "Email suppressed";
  }
}
const Route$7 = createFileRoute("/lovable/email/suppression")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        const supabaseUrl = "https://ptdvcobgplmngnhkjqag.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }
        let payload;
        try {
          const verified = await verifyWebhookRequest({
            req: request,
            secret: apiKey,
            parser: parseSuppressionPayload
          });
          payload = verified.payload;
        } catch (error) {
          if (error instanceof WebhookError) {
            switch (error.code) {
              case "invalid_signature":
                console.error("Invalid webhook signature");
                return Response.json({ error: "Invalid signature" }, { status: 401 });
              case "stale_timestamp":
                console.error("Stale webhook timestamp");
                return Response.json({ error: "Stale timestamp" }, { status: 401 });
              case "invalid_payload":
              case "invalid_json":
                console.error("Invalid payload", { code: error.code });
                return Response.json({ error: "Invalid payload" }, { status: 400 });
              default:
                console.error("Webhook verification failed", {
                  code: error.code,
                  message: error.message
                });
                return Response.json({ error: "Verification failed" }, { status: 401 });
            }
          }
          console.error("Unexpected error during verification", { error });
          return Response.json({ error: "Internal error" }, { status: 500 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const normalizedEmail = payload.email.toLowerCase();
        const { error: suppressError } = await supabase2.from("suppressed_emails").upsert(
          {
            email: normalizedEmail,
            reason: payload.reason,
            metadata: payload.metadata ?? null
          },
          { onConflict: "email" }
        );
        if (suppressError) {
          console.error("Failed to upsert suppressed email", {
            error: suppressError,
            email_redacted: normalizedEmail[0] + "***@" + normalizedEmail.split("@")[1]
          });
          return Response.json({ error: "Failed to write suppression" }, { status: 500 });
        }
        const sendLogStatus = mapReasonToStatus(payload.reason);
        const sendLogMessage = mapReasonToMessage(payload.reason);
        const { error: insertError } = await supabase2.from("email_send_log").insert({
          message_id: payload.message_id ?? null,
          template_name: "system",
          recipient_email: normalizedEmail,
          status: sendLogStatus,
          error_message: sendLogMessage,
          metadata: payload.metadata ?? null
        });
        if (insertError) {
          console.warn("Failed to insert email_send_log", {
            error: insertError
          });
        }
        console.log("Suppression processed", {
          email_redacted: normalizedEmail[0] + "***@" + normalizedEmail.split("@")[1],
          reason: payload.reason,
          is_retry: payload.is_retry,
          retry_count: payload.retry_count,
          has_message_id: !!payload.message_id
        });
        return Response.json({ success: true });
      }
    }
  }
});
const $$splitComponentImporter = () => import("./planner._id-DCfodh9Q.mjs");
const Route$6 = createFileRoute("/_authenticated/planner/$id")({
  component: lazyRouteComponent($$splitComponentImporter, "component")
});
const TEMPLATES = {
  "driver-notification": template
};
const SITE_NAME$2 = "kruhzivljenja";
const SENDER_DOMAIN$1 = "notify.kruhzivljenja.kalvarija.si";
const FROM_DOMAIN$1 = "kruhzivljenja.kalvarija.si";
function redactEmail$1(email) {
  if (!email) return "***";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "***";
  return `${localPart[0]}***@${domain}`;
}
function generateToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}
const Route$5 = createFileRoute("/lovable/email/transactional/send")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const supabaseUrl = "https://ptdvcobgplmngnhkjqag.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: { user }, error: authError } = await supabase2.auth.getUser(token);
        if (authError || !user) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        let templateName;
        let recipientEmail;
        let idempotencyKey;
        let messageId;
        let templateData = {};
        try {
          const body = await request.json();
          templateName = body.templateName || body.template_name;
          recipientEmail = body.recipientEmail || body.recipient_email;
          messageId = crypto.randomUUID();
          idempotencyKey = body.idempotencyKey || body.idempotency_key || messageId;
          if (body.templateData && typeof body.templateData === "object") {
            templateData = body.templateData;
          }
        } catch {
          return Response.json(
            { error: "Invalid JSON in request body" },
            { status: 400 }
          );
        }
        if (!templateName) {
          return Response.json(
            { error: "templateName is required" },
            { status: 400 }
          );
        }
        const template2 = TEMPLATES[templateName];
        if (!template2) {
          console.error("Template not found in registry", { templateName });
          return Response.json(
            {
              error: `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(", ")}`
            },
            { status: 404 }
          );
        }
        const effectiveRecipient = template2.to || recipientEmail;
        if (!effectiveRecipient) {
          return Response.json(
            {
              error: "recipientEmail is required (unless the template defines a fixed recipient)"
            },
            { status: 400 }
          );
        }
        const { data: suppressed, error: suppressionError } = await supabase2.from("suppressed_emails").select("id").eq("email", effectiveRecipient.toLowerCase()).maybeSingle();
        if (suppressionError) {
          console.error("Suppression check failed — refusing to send", {
            error: suppressionError,
            recipient_redacted: redactEmail$1(effectiveRecipient)
          });
          return Response.json(
            { error: "Failed to verify suppression status" },
            { status: 500 }
          );
        }
        if (suppressed) {
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "suppressed"
          });
          console.log("Email suppressed", {
            templateName,
            recipient_redacted: redactEmail$1(effectiveRecipient)
          });
          return Response.json({ success: false, reason: "email_suppressed" });
        }
        const normalizedEmail = effectiveRecipient.toLowerCase();
        let unsubscribeToken;
        const { data: existingToken, error: tokenLookupError } = await supabase2.from("email_unsubscribe_tokens").select("token, used_at").eq("email", normalizedEmail).maybeSingle();
        if (tokenLookupError) {
          console.error("Token lookup failed", {
            error: tokenLookupError,
            email_redacted: redactEmail$1(normalizedEmail)
          });
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "failed",
            error_message: "Failed to look up unsubscribe token"
          });
          return Response.json(
            { error: "Failed to prepare email" },
            { status: 500 }
          );
        }
        if (existingToken && !existingToken.used_at) {
          unsubscribeToken = existingToken.token;
        } else if (!existingToken) {
          unsubscribeToken = generateToken();
          const { error: tokenError } = await supabase2.from("email_unsubscribe_tokens").upsert(
            { token: unsubscribeToken, email: normalizedEmail },
            { onConflict: "email", ignoreDuplicates: true }
          );
          if (tokenError) {
            console.error("Failed to create unsubscribe token", {
              error: tokenError
            });
            await supabase2.from("email_send_log").insert({
              message_id: messageId,
              template_name: templateName,
              recipient_email: effectiveRecipient,
              status: "failed",
              error_message: "Failed to create unsubscribe token"
            });
            return Response.json(
              { error: "Failed to prepare email" },
              { status: 500 }
            );
          }
          const { data: storedToken, error: reReadError } = await supabase2.from("email_unsubscribe_tokens").select("token").eq("email", normalizedEmail).maybeSingle();
          if (reReadError || !storedToken) {
            console.error("Failed to read back unsubscribe token after upsert", {
              error: reReadError,
              email_redacted: redactEmail$1(normalizedEmail)
            });
            await supabase2.from("email_send_log").insert({
              message_id: messageId,
              template_name: templateName,
              recipient_email: effectiveRecipient,
              status: "failed",
              error_message: "Failed to confirm unsubscribe token storage"
            });
            return Response.json(
              { error: "Failed to prepare email" },
              { status: 500 }
            );
          }
          unsubscribeToken = storedToken.token;
        } else {
          console.warn("Unsubscribe token already used but email not suppressed", {
            email_redacted: redactEmail$1(normalizedEmail)
          });
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "suppressed",
            error_message: "Unsubscribe token used but email missing from suppressed list"
          });
          return Response.json({ success: false, reason: "email_suppressed" });
        }
        const element = reactExports.createElement(template2.component, templateData);
        const html = await render(element);
        const plainText = await render(element, { plainText: true });
        const resolvedSubject = typeof template2.subject === "function" ? template2.subject(templateData) : template2.subject;
        await supabase2.from("email_send_log").insert({
          message_id: messageId,
          template_name: templateName,
          recipient_email: effectiveRecipient,
          status: "pending"
        });
        const { error: enqueueError } = await supabase2.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: messageId,
            to: effectiveRecipient,
            from: `${SITE_NAME$2} <noreply@${FROM_DOMAIN$1}>`,
            sender_domain: SENDER_DOMAIN$1,
            subject: resolvedSubject,
            html,
            text: plainText,
            purpose: "transactional",
            label: templateName,
            idempotency_key: idempotencyKey,
            unsubscribe_token: unsubscribeToken,
            queued_at: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
        if (enqueueError) {
          console.error("Failed to enqueue email", {
            error: enqueueError,
            templateName,
            recipient_redacted: redactEmail$1(effectiveRecipient)
          });
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: templateName,
            recipient_email: effectiveRecipient,
            status: "failed",
            error_message: "Failed to enqueue email"
          });
          return Response.json(
            { error: "Failed to enqueue email" },
            { status: 500 }
          );
        }
        console.log("Transactional email enqueued", {
          templateName,
          recipient_redacted: redactEmail$1(effectiveRecipient)
        });
        return Response.json({ success: true, queued: true });
      }
    }
  }
});
const Route$4 = createFileRoute("/lovable/email/transactional/preview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        const token = authHeader?.replace(/^Bearer\s+/i, "");
        if (token !== apiKey) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const templateNames = Object.keys(TEMPLATES);
        const results = [];
        for (const name of templateNames) {
          const entry = TEMPLATES[name];
          const displayName = entry.displayName || name;
          if (!entry.previewData) {
            results.push({
              templateName: name,
              displayName,
              subject: "",
              html: "",
              status: "preview_data_required"
            });
            continue;
          }
          try {
            const html = await render(
              reactExports.createElement(entry.component, entry.previewData)
            );
            const resolvedSubject = typeof entry.subject === "function" ? entry.subject(entry.previewData) : entry.subject;
            results.push({
              templateName: name,
              displayName,
              subject: resolvedSubject,
              html,
              status: "ready"
            });
          } catch (err) {
            console.error("Failed to render template for preview", {
              template: name,
              error: err
            });
            results.push({
              templateName: name,
              displayName,
              subject: "",
              html: "",
              status: "render_failed",
              errorMessage: err instanceof Error ? err.message : String(err)
            });
          }
        }
        return Response.json({ templates: results });
      }
    }
  }
});
const MAX_RETRIES = 5;
const DEFAULT_BATCH_SIZE = 10;
const DEFAULT_SEND_DELAY_MS = 200;
const DEFAULT_AUTH_TTL_MINUTES = 15;
const DEFAULT_TRANSACTIONAL_TTL_MINUTES = 60;
function isRateLimited(error) {
  if (error && typeof error === "object" && "status" in error) {
    return error.status === 429;
  }
  return error instanceof Error && error.message.includes("429");
}
function isForbidden(error) {
  if (error && typeof error === "object" && "status" in error) {
    return error.status === 403;
  }
  return error instanceof Error && error.message.includes("403");
}
function getRetryAfterSeconds(error) {
  if (error && typeof error === "object" && "retryAfterSeconds" in error) {
    return error.retryAfterSeconds ?? 60;
  }
  return 60;
}
async function moveToDlq(supabase2, queue, msg, reason) {
  const payload = msg.message;
  await supabase2.from("email_send_log").insert({
    message_id: payload.message_id,
    template_name: payload.label || queue,
    recipient_email: payload.to,
    status: "dlq",
    error_message: reason
  });
  const { error } = await supabase2.rpc("move_to_dlq", {
    source_queue: queue,
    dlq_name: `${queue}_dlq`,
    message_id: msg.msg_id,
    payload
  });
  if (error) {
    console.error("Failed to move message to DLQ", { queue, msg_id: msg.msg_id, reason, error });
  }
}
const Route$3 = createFileRoute("/lovable/email/queue/process")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        const supabaseUrl = "https://ptdvcobgplmngnhkjqag.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!apiKey || !supabaseUrl || !supabaseServiceKey) {
          console.error("Missing required environment variables");
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        if (!authHeader?.startsWith("Bearer ")) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        const token = authHeader.slice("Bearer ".length).trim();
        if (token !== supabaseServiceKey) {
          return Response.json({ error: "Forbidden" }, { status: 403 });
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const { data: state } = await supabase2.from("email_send_state").select("retry_after_until, batch_size, send_delay_ms, auth_email_ttl_minutes, transactional_email_ttl_minutes").single();
        if (state?.retry_after_until && new Date(state.retry_after_until) > /* @__PURE__ */ new Date()) {
          return Response.json({ skipped: true, reason: "rate_limited" });
        }
        const batchSize = state?.batch_size ?? DEFAULT_BATCH_SIZE;
        const sendDelayMs = state?.send_delay_ms ?? DEFAULT_SEND_DELAY_MS;
        const ttlMinutes = {
          auth_emails: state?.auth_email_ttl_minutes ?? DEFAULT_AUTH_TTL_MINUTES,
          transactional_emails: state?.transactional_email_ttl_minutes ?? DEFAULT_TRANSACTIONAL_TTL_MINUTES
        };
        let totalProcessed = 0;
        for (const queue of ["auth_emails", "transactional_emails"]) {
          const { data: messages, error: readError } = await supabase2.rpc("read_email_batch", {
            queue_name: queue,
            batch_size: batchSize,
            vt: 30
          });
          if (readError) {
            console.error("Failed to read email batch", { queue, error: readError });
            continue;
          }
          if (!messages?.length) continue;
          const messageIds = Array.from(
            new Set(
              messages.map(
                (msg) => msg?.message?.message_id && typeof msg.message.message_id === "string" ? msg.message.message_id : null
              ).filter((id) => Boolean(id))
            )
          );
          const failedAttemptsByMessageId = /* @__PURE__ */ new Map();
          if (messageIds.length > 0) {
            const { data: failedRows, error: failedRowsError } = await supabase2.from("email_send_log").select("message_id").in("message_id", messageIds).eq("status", "failed");
            if (failedRowsError) {
              console.error("Failed to load failed-attempt counters", {
                queue,
                error: failedRowsError
              });
            } else {
              for (const row of failedRows ?? []) {
                const messageId = row?.message_id;
                if (typeof messageId !== "string" || !messageId) continue;
                failedAttemptsByMessageId.set(
                  messageId,
                  (failedAttemptsByMessageId.get(messageId) ?? 0) + 1
                );
              }
            }
          }
          for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            const payload = msg.message;
            const failedAttempts = payload?.message_id && typeof payload.message_id === "string" ? failedAttemptsByMessageId.get(payload.message_id) ?? 0 : msg.read_ct ?? 0;
            const queuedAt = payload.queued_at ?? msg.enqueued_at;
            if (queuedAt) {
              const ageMs = Date.now() - new Date(queuedAt).getTime();
              const maxAgeMs = ttlMinutes[queue] * 60 * 1e3;
              if (ageMs > maxAgeMs) {
                console.warn("Email expired (TTL exceeded)", {
                  queue,
                  msg_id: msg.msg_id,
                  queued_at: queuedAt,
                  ttl_minutes: ttlMinutes[queue]
                });
                await moveToDlq(supabase2, queue, msg, `TTL exceeded (${ttlMinutes[queue]} minutes)`);
                continue;
              }
            }
            if (failedAttempts >= MAX_RETRIES) {
              await moveToDlq(supabase2, queue, msg, `Max retries (${MAX_RETRIES}) exceeded (attempted ${failedAttempts} times)`);
              continue;
            }
            if (payload.message_id) {
              const { data: alreadySent } = await supabase2.from("email_send_log").select("id").eq("message_id", payload.message_id).eq("status", "sent").maybeSingle();
              if (alreadySent) {
                console.warn("Skipping duplicate send (already sent)", {
                  queue,
                  msg_id: msg.msg_id,
                  message_id: payload.message_id
                });
                const { error: dupDelError } = await supabase2.rpc("delete_email", {
                  queue_name: queue,
                  message_id: msg.msg_id
                });
                if (dupDelError) {
                  console.error("Failed to delete duplicate message from queue", { queue, msg_id: msg.msg_id, error: dupDelError });
                }
                continue;
              }
            }
            try {
              const providerResp = await sendLovableEmail(
                {
                  run_id: payload.run_id,
                  to: payload.to,
                  from: payload.from,
                  sender_domain: payload.sender_domain,
                  subject: payload.subject,
                  html: payload.html,
                  text: payload.text,
                  purpose: payload.purpose,
                  label: payload.label,
                  idempotency_key: payload.idempotency_key,
                  unsubscribe_token: payload.unsubscribe_token,
                  message_id: payload.message_id
                },
                { apiKey, sendUrl: process.env.LOVABLE_SEND_URL }
              );
              await supabase2.from("email_send_log").insert({
                message_id: payload.message_id,
                template_name: payload.label || queue,
                recipient_email: payload.to,
                status: "sent",
                provider_message_id: providerResp?.message_id ?? null,
                provider_response: providerResp ?? null
              });
              const { error: delError } = await supabase2.rpc("delete_email", {
                queue_name: queue,
                message_id: msg.msg_id
              });
              if (delError) {
                console.error("Failed to delete sent message from queue", { queue, msg_id: msg.msg_id, error: delError });
              }
              totalProcessed++;
            } catch (error) {
              const errorMsg = error instanceof Error ? error.message : String(error);
              console.error("Email send failed", {
                queue,
                msg_id: msg.msg_id,
                read_ct: msg.read_ct,
                failed_attempts: failedAttempts,
                error: errorMsg
              });
              if (isRateLimited(error)) {
                await supabase2.from("email_send_log").insert({
                  message_id: payload.message_id,
                  template_name: payload.label || queue,
                  recipient_email: payload.to,
                  status: "failed",
                  error_message: errorMsg.slice(0, 1e3)
                });
                const retryAfterSecs = getRetryAfterSeconds(error);
                await supabase2.from("email_send_state").update({
                  retry_after_until: new Date(
                    Date.now() + retryAfterSecs * 1e3
                  ).toISOString(),
                  updated_at: (/* @__PURE__ */ new Date()).toISOString()
                }).eq("id", 1);
                return Response.json({ processed: totalProcessed, stopped: "rate_limited" });
              }
              if (isForbidden(error)) {
                await moveToDlq(supabase2, queue, msg, errorMsg.slice(0, 1e3));
                return Response.json({ processed: totalProcessed, stopped: "forbidden" });
              }
              await supabase2.from("email_send_log").insert({
                message_id: payload.message_id,
                template_name: payload.label || queue,
                recipient_email: payload.to,
                status: "failed",
                error_message: errorMsg.slice(0, 1e3)
              });
              if (payload?.message_id && typeof payload.message_id === "string") {
                failedAttemptsByMessageId.set(payload.message_id, failedAttempts + 1);
              }
            }
            if (i < messages.length - 1) {
              await new Promise((r) => setTimeout(r, sendDelayMs));
            }
          }
        }
        return Response.json({ processed: totalProcessed });
      }
    }
  }
});
const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Head, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Preview, { children: [
    "Confirm your email for ",
    siteName
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Body, { style: main$5, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { style: container$5, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { style: h1$5, children: "Confirm your email" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: text$5, children: [
      "Thanks for signing up for",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { href: siteUrl, style: link$2, children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: siteName }) }),
      "!"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: text$5, children: [
      "Please confirm your email address (",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { href: `mailto:${recipient}`, style: link$2, children: recipient }),
      ") by clicking the button below:"
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: button$4, href: confirmationUrl, children: "Verify Email" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: footer$5, children: "If you didn't create an account, you can safely ignore this email." })
  ] }) })
] });
const main$5 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$5 = { padding: "20px 25px" };
const h1$5 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text$5 = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const link$2 = { color: "inherit", textDecoration: "underline" };
const button$4 = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none"
};
const footer$5 = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Head, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Preview, { children: [
    "You've been invited to join ",
    siteName
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Body, { style: main$4, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { style: container$4, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { style: h1$4, children: "You've been invited" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: text$4, children: [
      "You've been invited to join",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { href: siteUrl, style: link$1, children: /* @__PURE__ */ jsxRuntimeExports.jsx("strong", { children: siteName }) }),
      ". Click the button below to accept the invitation and create your account."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: button$3, href: confirmationUrl, children: "Accept Invitation" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: footer$4, children: "If you weren't expecting this invitation, you can safely ignore this email." })
  ] }) })
] });
const main$4 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$4 = { padding: "20px 25px" };
const h1$4 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text$4 = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const link$1 = { color: "inherit", textDecoration: "underline" };
const button$3 = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none"
};
const footer$4 = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const MagicLinkEmail = ({
  siteName,
  confirmationUrl
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Head, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Preview, { children: [
    "Your login link for ",
    siteName
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Body, { style: main$3, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { style: container$3, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { style: h1$3, children: "Your login link" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: text$3, children: [
      "Click the button below to log in to ",
      siteName,
      ". This link will expire shortly."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: button$2, href: confirmationUrl, children: "Log In" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: footer$3, children: "If you didn't request this link, you can safely ignore this email." })
  ] }) })
] });
const main$3 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$3 = { padding: "20px 25px" };
const h1$3 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text$3 = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const button$2 = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none"
};
const footer$3 = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const RecoveryEmail = ({
  siteName,
  confirmationUrl
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Head, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Preview, { children: [
    "Reset your password for ",
    siteName
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Body, { style: main$2, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { style: container$2, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { style: h1$2, children: "Reset your password" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: text$2, children: [
      "We received a request to reset your password for ",
      siteName,
      ". Click the button below to choose a new password."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: button$1, href: confirmationUrl, children: "Reset Password" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: footer$2, children: "If you didn't request a password reset, you can safely ignore this email. Your password will not be changed." })
  ] }) })
] });
const main$2 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$2 = { padding: "20px 25px" };
const h1$2 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text$2 = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const button$1 = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none"
};
const footer$2 = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const EmailChangeEmail = ({
  siteName,
  oldEmail,
  newEmail,
  confirmationUrl
}) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Head, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsxs(Preview, { children: [
    "Confirm your email change for ",
    siteName
  ] }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Body, { style: main$1, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { style: container$1, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { style: h1$1, children: "Confirm your email change" }),
    /* @__PURE__ */ jsxRuntimeExports.jsxs(Text, { style: text$1, children: [
      "You requested to change your email address for ",
      siteName,
      " from",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { href: `mailto:${oldEmail}`, style: link, children: oldEmail }),
      " ",
      "to",
      " ",
      /* @__PURE__ */ jsxRuntimeExports.jsx(Link$1, { href: `mailto:${newEmail}`, style: link, children: newEmail }),
      "."
    ] }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: text$1, children: "Click the button below to confirm this change:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Button, { style: button, href: confirmationUrl, children: "Confirm Email Change" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: footer$1, children: "If you didn't request this change, please secure your account immediately." })
  ] }) })
] });
const main$1 = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container$1 = { padding: "20px 25px" };
const h1$1 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text$1 = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const link = { color: "inherit", textDecoration: "underline" };
const button = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "14px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none"
};
const footer$1 = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const ReauthenticationEmail = ({ token }) => /* @__PURE__ */ jsxRuntimeExports.jsxs(Html, { lang: "en", dir: "ltr", children: [
  /* @__PURE__ */ jsxRuntimeExports.jsx(Head, {}),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Preview, { children: "Your verification code" }),
  /* @__PURE__ */ jsxRuntimeExports.jsx(Body, { style: main, children: /* @__PURE__ */ jsxRuntimeExports.jsxs(Container, { style: container, children: [
    /* @__PURE__ */ jsxRuntimeExports.jsx(Heading, { style: h1, children: "Confirm reauthentication" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: text, children: "Use the code below to confirm your identity:" }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: codeStyle, children: token }),
    /* @__PURE__ */ jsxRuntimeExports.jsx(Text, { style: footer, children: "This code will expire shortly. If you didn't request this, you can safely ignore this email." })
  ] }) })
] });
const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "20px 25px" };
const h1 = {
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 20px"
};
const text = {
  fontSize: "14px",
  color: "#55575d",
  lineHeight: "1.5",
  margin: "0 0 25px"
};
const codeStyle = {
  fontFamily: "Courier, monospace",
  fontSize: "22px",
  fontWeight: "bold",
  color: "#000000",
  margin: "0 0 30px"
};
const footer = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
const EMAIL_SUBJECTS = {
  signup: "Confirm your email",
  invite: "You've been invited",
  magiclink: "Your login link",
  recovery: "Reset your password",
  email_change: "Confirm your new email",
  reauthentication: "Your verification code"
};
const EMAIL_TEMPLATES$1 = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail
};
const SITE_NAME$1 = "kruhzivljenja";
const SENDER_DOMAIN = "notify.kruhzivljenja.kalvarija.si";
const ROOT_DOMAIN = "kruhzivljenja.kalvarija.si";
const FROM_DOMAIN = "kruhzivljenja.kalvarija.si";
function redactEmail(email) {
  if (!email) return "***";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "***";
  return `${localPart[0]}***@${domain}`;
}
const Route$2 = createFileRoute("/lovable/email/auth/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          console.error("LOVABLE_API_KEY not configured");
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        let payload;
        let run_id = "";
        try {
          const verified = await verifyWebhookRequest({
            req: request,
            secret: apiKey,
            parser: parseEmailWebhookPayload
          });
          payload = verified.payload;
          run_id = payload.run_id;
        } catch (error) {
          if (error instanceof WebhookError) {
            switch (error.code) {
              case "invalid_signature":
              case "missing_timestamp":
              case "invalid_timestamp":
              case "stale_timestamp":
                console.error("Invalid webhook signature", { error: error.message });
                return Response.json(
                  { error: "Invalid signature" },
                  { status: 401 }
                );
              case "invalid_payload":
              case "invalid_json":
                console.error("Invalid webhook payload", { error: error.message });
                return Response.json(
                  { error: "Invalid webhook payload" },
                  { status: 400 }
                );
            }
          }
          console.error("Webhook verification failed", { error });
          return Response.json(
            { error: "Invalid webhook payload" },
            { status: 400 }
          );
        }
        if (!run_id) {
          console.error("Webhook payload missing run_id");
          return Response.json(
            { error: "Invalid webhook payload" },
            { status: 400 }
          );
        }
        if (payload.version !== "1") {
          console.error("Unsupported payload version", { version: payload.version, run_id });
          return Response.json(
            { error: `Unsupported payload version: ${payload.version}` },
            { status: 400 }
          );
        }
        const emailType = payload.data.action_type;
        console.log("Received auth event", {
          emailType,
          email_redacted: redactEmail(payload.data.email),
          run_id
        });
        const EmailTemplate = EMAIL_TEMPLATES$1[emailType];
        if (!EmailTemplate) {
          console.error("Unknown email type", { emailType, run_id });
          return Response.json(
            { error: `Unknown email type: ${emailType}` },
            { status: 400 }
          );
        }
        const templateProps = {
          siteName: SITE_NAME$1,
          siteUrl: `https://${ROOT_DOMAIN}`,
          recipient: payload.data.email,
          confirmationUrl: payload.data.url,
          token: payload.data.token,
          email: payload.data.email,
          oldEmail: payload.data.old_email,
          newEmail: payload.data.new_email
        };
        const element = reactExports.createElement(EmailTemplate, templateProps);
        const html = await render(element);
        const text2 = await render(element, { plainText: true });
        const supabaseUrl = "https://ptdvcobgplmngnhkjqag.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          console.error("Missing Supabase environment variables");
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const supabase2 = createClient(supabaseUrl, supabaseServiceKey);
        const messageId = crypto.randomUUID();
        await supabase2.from("email_send_log").insert({
          message_id: messageId,
          template_name: emailType,
          recipient_email: payload.data.email,
          status: "pending"
        });
        const { error: enqueueError } = await supabase2.rpc("enqueue_email", {
          queue_name: "auth_emails",
          payload: {
            run_id,
            message_id: messageId,
            to: payload.data.email,
            from: `${SITE_NAME$1} <noreply@${FROM_DOMAIN}>`,
            sender_domain: SENDER_DOMAIN,
            subject: EMAIL_SUBJECTS[emailType] || "Notification",
            html,
            text: text2,
            purpose: "transactional",
            label: emailType,
            queued_at: (/* @__PURE__ */ new Date()).toISOString()
          }
        });
        if (enqueueError) {
          console.error("Failed to enqueue auth email", { error: enqueueError, run_id, emailType });
          await supabase2.from("email_send_log").insert({
            message_id: messageId,
            template_name: emailType,
            recipient_email: payload.data.email,
            status: "failed",
            error_message: "Failed to enqueue email"
          });
          return Response.json(
            { error: "Failed to enqueue email" },
            { status: 500 }
          );
        }
        console.log("Auth email enqueued", {
          emailType,
          email_redacted: redactEmail(payload.data.email),
          run_id
        });
        return Response.json({ success: true, queued: true });
      }
    }
  }
});
const EMAIL_TEMPLATES = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail
};
const SITE_NAME = "kruhzivljenja";
const SAMPLE_PROJECT_URL = "https://kruhzivljenja.lovable.app";
const SAMPLE_EMAIL = "user@example.test";
const SAMPLE_DATA = {
  signup: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    recipient: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL
  },
  magiclink: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL
  },
  recovery: {
    siteName: SITE_NAME,
    confirmationUrl: SAMPLE_PROJECT_URL
  },
  invite: {
    siteName: SITE_NAME,
    siteUrl: SAMPLE_PROJECT_URL,
    confirmationUrl: SAMPLE_PROJECT_URL
  },
  email_change: {
    siteName: SITE_NAME,
    oldEmail: SAMPLE_EMAIL,
    email: SAMPLE_EMAIL,
    newEmail: SAMPLE_EMAIL,
    confirmationUrl: SAMPLE_PROJECT_URL
  },
  reauthentication: {
    token: "123456"
  }
};
const Route$1 = createFileRoute("/lovable/email/auth/preview")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return Response.json(
            { error: "Server configuration error" },
            { status: 500 }
          );
        }
        const authHeader = request.headers.get("Authorization");
        if (!authHeader || authHeader !== `Bearer ${apiKey}`) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }
        let type;
        try {
          const body = await request.json();
          type = body.type;
        } catch {
          return Response.json(
            { error: "Invalid JSON in request body" },
            { status: 400 }
          );
        }
        const EmailTemplate = EMAIL_TEMPLATES[type];
        if (!EmailTemplate) {
          return Response.json(
            { error: `Unknown email type: ${type}` },
            { status: 400 }
          );
        }
        const sampleData = SAMPLE_DATA[type] || {};
        const html = await render(reactExports.createElement(EmailTemplate, sampleData));
        return new Response(html, {
          status: 200,
          headers: { "Content-Type": "text/html; charset=utf-8" }
        });
      }
    }
  }
});
const Route = createFileRoute("/api/public/hooks/driver-reminders")({
  server: {
    handlers: {
      POST: async () => {
        const supabaseUrl = "https://ptdvcobgplmngnhkjqag.supabase.co";
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        if (!supabaseServiceKey) {
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }
        const admin = createClient(supabaseUrl, supabaseServiceKey);
        const tomorrow = /* @__PURE__ */ new Date();
        tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
        const dateStr = tomorrow.toISOString().slice(0, 10);
        const { data: dates, error } = await admin.from("schedule_dates").select("id, schedule_stops(id, driver_id)").eq("date", dateStr);
        if (error) {
          return Response.json({ error: error.message }, { status: 500 });
        }
        const stopIds = [];
        for (const d of dates ?? []) {
          for (const s of d.schedule_stops ?? []) {
            if (s.driver_id) stopIds.push(s.id);
          }
        }
        const results = [];
        for (const stopId of stopIds) {
          try {
            const r = await enqueueDriverNotificationForStop(stopId, "reminder");
            results.push({ stopId, ...r });
          } catch (e) {
            results.push({
              stopId,
              status: "skipped",
              reason: e instanceof Error ? e.message : "unknown"
            });
          }
        }
        return Response.json({ date: dateStr, processed: results.length, results });
      }
    }
  }
});
const PendingApprovalRoute = Route$k.update({
  id: "/pending-approval",
  path: "/pending-approval",
  getParentRoute: () => Route$l
});
const LoginRoute = Route$j.update({
  id: "/login",
  path: "/login",
  getParentRoute: () => Route$l
});
const DashboardRoute = Route$i.update({
  id: "/dashboard",
  path: "/dashboard",
  getParentRoute: () => Route$l
});
const AuthenticatedRoute = Route$h.update({
  id: "/_authenticated",
  getParentRoute: () => Route$l
});
const IndexRoute = Route$g.update({
  id: "/",
  path: "/",
  getParentRoute: () => Route$l
});
const EmailUnsubscribeRoute = Route$f.update({
  id: "/email/unsubscribe",
  path: "/email/unsubscribe",
  getParentRoute: () => Route$l
});
const AuthenticatedTemplatesRoute = Route$e.update({
  id: "/templates",
  path: "/templates",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedRecipientsRoute = Route$d.update({
  id: "/recipients",
  path: "/recipients",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedPeopleRoute = Route$c.update({
  id: "/people",
  path: "/people",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedEmailTemplatesRoute = Route$b.update({
  id: "/email-templates",
  path: "/email-templates",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedEmailQueueRoute = Route$a.update({
  id: "/email-queue",
  path: "/email-queue",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedAdminRoute = Route$9.update({
  id: "/admin",
  path: "/admin",
  getParentRoute: () => AuthenticatedRoute
});
const AuthenticatedPlannerIndexRoute = Route$8.update({
  id: "/planner/",
  path: "/planner/",
  getParentRoute: () => AuthenticatedRoute
});
const LovableEmailSuppressionRoute = Route$7.update({
  id: "/lovable/email/suppression",
  path: "/lovable/email/suppression",
  getParentRoute: () => Route$l
});
const AuthenticatedPlannerIdRoute = Route$6.update({
  id: "/planner/$id",
  path: "/planner/$id",
  getParentRoute: () => AuthenticatedRoute
});
const LovableEmailTransactionalSendRoute = Route$5.update({
  id: "/lovable/email/transactional/send",
  path: "/lovable/email/transactional/send",
  getParentRoute: () => Route$l
});
const LovableEmailTransactionalPreviewRoute = Route$4.update({
  id: "/lovable/email/transactional/preview",
  path: "/lovable/email/transactional/preview",
  getParentRoute: () => Route$l
});
const LovableEmailQueueProcessRoute = Route$3.update({
  id: "/lovable/email/queue/process",
  path: "/lovable/email/queue/process",
  getParentRoute: () => Route$l
});
const LovableEmailAuthWebhookRoute = Route$2.update({
  id: "/lovable/email/auth/webhook",
  path: "/lovable/email/auth/webhook",
  getParentRoute: () => Route$l
});
const LovableEmailAuthPreviewRoute = Route$1.update({
  id: "/lovable/email/auth/preview",
  path: "/lovable/email/auth/preview",
  getParentRoute: () => Route$l
});
const ApiPublicHooksDriverRemindersRoute = Route.update({
  id: "/api/public/hooks/driver-reminders",
  path: "/api/public/hooks/driver-reminders",
  getParentRoute: () => Route$l
});
const AuthenticatedRouteChildren = {
  AuthenticatedAdminRoute,
  AuthenticatedEmailQueueRoute,
  AuthenticatedEmailTemplatesRoute,
  AuthenticatedPeopleRoute,
  AuthenticatedRecipientsRoute,
  AuthenticatedTemplatesRoute,
  AuthenticatedPlannerIdRoute,
  AuthenticatedPlannerIndexRoute
};
const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren
);
const rootRouteChildren = {
  IndexRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  DashboardRoute,
  LoginRoute,
  PendingApprovalRoute,
  EmailUnsubscribeRoute,
  LovableEmailSuppressionRoute,
  ApiPublicHooksDriverRemindersRoute,
  LovableEmailAuthPreviewRoute,
  LovableEmailAuthWebhookRoute,
  LovableEmailQueueProcessRoute,
  LovableEmailTransactionalPreviewRoute,
  LovableEmailTransactionalSendRoute
};
const routeTree = Route$l._addFileChildren(rootRouteChildren)._addFileTypes();
const getRouter = () => {
  const queryClient = new QueryClient();
  const router2 = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0
  });
  return router2;
};
const router = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  getRouter
}, Symbol.toStringTag, { value: "Module" }));
export {
  useI18n as a,
  router as r,
  useAuth as u
};
