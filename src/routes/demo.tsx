import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Home, Sparkles, Users, DollarSign, Plus, Trash2, ArrowRight, Lock, Play, LogOut } from "lucide-react";
import {
  seedProperties, seedGuests, seedCleanings, seedCleaners, computeKpis,
  type DemoProperty, type DemoGuest, type DemoCleaning,
} from "@/lib/demo-seed";

const KEY_LEAD = "hostlyb_demo_lead";
const KEY_ACCESS = "hostlyb_demo_access_count";
const KEY_DATA = "hostlyb_demo_state_v1";
const MAX_ACCESS = 2;

export const Route = createFileRoute("/demo")({
  head: () => ({ meta: [
    { title: "Demo · Hostlyb" },
    { name: "robots", content: "noindex, nofollow" },
    { name: "description", content: "Experimente o Hostlyb com dados de exemplo — 2 acessos grátis." },
  ] }),
  component: DemoPage,
});

function DemoPage() {
  const navigate = useNavigate();
  const [accessCount, setAccessCount] = useState<number>(0);
  const [blocked, setBlocked] = useState(false);
  const [tab, setTab] = useState<"dashboard" | "imoveis" | "hospedes" | "limpezas">("dashboard");

  const [props, setProps] = useState<DemoProperty[]>(() => loadOr(seedProperties, "p"));
  const [guests, setGuests] = useState<DemoGuest[]>(() => loadOr(seedGuests, "g"));
  const [cleanings, setCleanings] = useState<DemoCleaning[]>(() => loadOr(seedCleanings, "cl"));

  // gate: must have lead + within 2 accesses
  useEffect(() => {
    try {
      const hasLead = localStorage.getItem(KEY_LEAD) === "1";
      if (!hasLead) { navigate({ to: "/" as any }); return; }
      const prev = Number(localStorage.getItem(KEY_ACCESS) || "0");
      const next = prev + 1;
      localStorage.setItem(KEY_ACCESS, String(next));
      setAccessCount(next);
      if (next > MAX_ACCESS) setBlocked(true);
    } catch {}
  }, [navigate]);

  // persist edits during the session
  useEffect(() => {
    try {
      localStorage.setItem(KEY_DATA, JSON.stringify({ props, guests, cleanings }));
    } catch {}
  }, [props, guests, cleanings]);

  if (blocked) return <BlockedScreen />;

  const kpis = computeKpis(props, guests, cleanings);

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <DemoHeader accessCount={accessCount} maxAccess={MAX_ACCESS} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 16px 80px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 18 }}>
          {[
            { id: "dashboard", label: "Dashboard", icon: DollarSign },
            { id: "imoveis", label: "Imóveis", icon: Home },
            { id: "hospedes", label: "Hóspedes", icon: Users },
            { id: "limpezas", label: "Limpezas", icon: Sparkles },
          ].map(({ id, label, icon: Ic }) => (
            <button key={id} onClick={() => setTab(id as any)}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px", borderRadius: 999, border: "1px solid #EFEFEF",
                background: tab === id ? "#FF6B6B" : "#fff", color: tab === id ? "#fff" : "#212121",
                fontWeight: 700, fontSize: 13, cursor: "pointer",
              }}>
              <Ic size={14} /> {label}
            </button>
          ))}
        </div>

        {tab === "dashboard" && <Dashboard kpis={kpis} props={props} guests={guests} />}
        {tab === "imoveis" && <ImoveisTab props={props} setProps={setProps} />}
        {tab === "hospedes" && <HospedesTab guests={guests} setGuests={setGuests} props={props} />}
        {tab === "limpezas" && <LimpezasTab cleanings={cleanings} setCleanings={setCleanings} props={props} />}

        <div style={{ marginTop: 28, padding: 20, background: "#fff", border: "1px solid #EFEFEF", borderRadius: 16, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#616161", marginBottom: 12 }}>
            Gostou? Crie sua conta e comece com <strong>7 dias grátis</strong>.
          </p>
          <Link to={"/signup" as any}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FF6B6B", color: "#fff", padding: "10px 22px", borderRadius: 999, fontWeight: 700, fontSize: 14 }}>
            Criar conta grátis <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function loadOr<T>(seed: T[], _prefix: string): T[] {
  try {
    const raw = localStorage.getItem(KEY_DATA);
    if (!raw) return seed;
    const parsed = JSON.parse(raw);
    const k = seed === (seedProperties as unknown) ? "props" : seed === (seedGuests as unknown) ? "guests" : "cleanings";
    return parsed?.[k] ?? seed;
  } catch { return seed; }
}

function DemoHeader({ accessCount, maxAccess }: { accessCount: number; maxAccess: number }) {
  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 30, background: "#fff",
      borderBottom: "1px solid #EFEFEF", padding: "10px 16px",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontWeight: 900, fontSize: 18, color: "#111" }}>
          Host<span style={{ color: "#FF6B6B" }}>lyb</span>
        </span>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 999, background: "#FFF1F1", color: "#FF6B6B" }}>
          DEMO
        </span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#616161" }}>
        <span>Acesso {accessCount}/{maxAccess}</span>
        <Link to="/" style={{ color: "#616161", display: "inline-flex", alignItems: "center", gap: 4 }}>
          <LogOut size={12} /> Sair
        </Link>
      </div>
    </header>
  );
}

function BlockedScreen() {
  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div style={{ maxWidth: 460, textAlign: "center", background: "#fff", padding: 36, borderRadius: 24, border: "1px solid #EFEFEF" }}>
        <div style={{ width: 64, height: 64, borderRadius: 999, background: "#FFE5E5", color: "#FF6B6B", display: "grid", placeItems: "center", margin: "0 auto 18px" }}>
          <Lock size={28} />
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Demo encerrada</h1>
        <p style={{ color: "#616161", fontSize: 14, marginBottom: 22 }}>
          Você usou seus <strong>2 acessos gratuitos</strong> à demo. Para continuar, crie sua conta com 7 dias grátis e dados reais.
        </p>
        <Link to={"/signup" as any}
          style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#FF6B6B", color: "#fff", padding: "14px 28px", borderRadius: 999, fontWeight: 700 }}>
          <Play size={16} fill="#fff" /> Criar conta grátis
        </Link>
      </div>
    </div>
  );
}

function Dashboard({ kpis, props, guests }: { kpis: ReturnType<typeof computeKpis>; props: DemoProperty[]; guests: DemoGuest[] }) {
  const fmtBRL = (n: number) => `R$ ${n.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`;
  const upcoming = guests.filter((g) => g.status === "confirmado").slice(0, 4);
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 18 }}>
        <Kpi label="Receita mensal estimada" value={fmtBRL(kpis.monthlyRevenue)} accent="#00C896" />
        <Kpi label="Imóveis" value={String(kpis.totalProps)} />
        <Kpi label="Ocupados agora" value={`${kpis.occupied}/${kpis.totalProps}`} accent="#FF6B6B" />
        <Kpi label="Limpezas (7 dias)" value={String(kpis.cleaningsThisWeek)} accent="#FFB347" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        <Card title="Status dos imóveis">
          <Row label="Ocupados" value={kpis.occupied} color="#FF6B6B" />
          <Row label="Em limpeza" value={kpis.cleaning} color="#FFB347" />
          <Row label="Livres" value={kpis.free} color="#00C896" />
        </Card>
        <Card title="Próximos check-ins">
          {upcoming.length === 0 ? <p style={{ color: "#9E9E9E", fontSize: 13 }}>Nada por enquanto.</p> : (
            <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {upcoming.map((g) => {
                const p = props.find((pp) => pp.id === g.property_id);
                return (
                  <li key={g.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span>{g.name} <span style={{ color: "#9E9E9E" }}>· {p?.name}</span></span>
                    <span style={{ color: "#616161" }}>{new Date(g.checkin_date).toLocaleDateString("pt-BR")}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </>
  );
}

function ImoveisTab({ props, setProps }: { props: DemoProperty[]; setProps: (p: DemoProperty[]) => void }) {
  const [name, setName] = useState(""); const [city, setCity] = useState("");
  const add = () => {
    if (!name || !city) return;
    setProps([...props, {
      id: "p" + Date.now(), name, address: "Endereço a definir", city,
      bedrooms: 1, bathrooms: 1, status: "livre", income_monthly: 0, rating: 5,
    }]);
    setName(""); setCity("");
  };
  return (
    <Card title={`Imóveis (${props.length})`}>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        <input placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} style={inp} />
        <input placeholder="Cidade" value={city} onChange={(e) => setCity(e.target.value)} style={inp} />
        <button onClick={add} style={btn}><Plus size={14} /> Adicionar</button>
      </div>
      <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {props.map((p) => (
          <li key={p.id} style={item}>
            <div>
              <div style={{ fontWeight: 700 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#9E9E9E" }}>{p.address} · {p.city} · {p.bedrooms}q · {p.bathrooms}b</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={tag(p.status)}>{p.status}</span>
              <button onClick={() => setProps(props.filter((x) => x.id !== p.id))} style={iconBtn}><Trash2 size={14} /></button>
            </div>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function HospedesTab({ guests, setGuests, props }: { guests: DemoGuest[]; setGuests: (g: DemoGuest[]) => void; props: DemoProperty[] }) {
  return (
    <Card title={`Hóspedes (${guests.length})`}>
      <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {guests.map((g) => {
          const p = props.find((pp) => pp.id === g.property_id);
          return (
            <li key={g.id} style={item}>
              <div>
                <div style={{ fontWeight: 700 }}>{g.name}</div>
                <div style={{ fontSize: 12, color: "#9E9E9E" }}>
                  {p?.name} · {new Date(g.checkin_date).toLocaleDateString("pt-BR")} → {new Date(g.checkout_date).toLocaleDateString("pt-BR")} · R$ {g.total_value}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={tag(g.status)}>{g.status}</span>
                <button onClick={() => setGuests(guests.filter((x) => x.id !== g.id))} style={iconBtn}><Trash2 size={14} /></button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function LimpezasTab({ cleanings, setCleanings, props }: { cleanings: DemoCleaning[]; setCleanings: (c: DemoCleaning[]) => void; props: DemoProperty[] }) {
  const cleaners = seedCleaners;
  return (
    <Card title={`Limpezas (${cleanings.length})`}>
      <ul style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {cleanings.map((c) => {
          const p = props.find((pp) => pp.id === c.property_id);
          const cl = cleaners.find((x) => x.id === c.cleaner_id);
          return (
            <li key={c.id} style={item}>
              <div>
                <div style={{ fontWeight: 700 }}>{p?.name ?? "Imóvel"}</div>
                <div style={{ fontSize: 12, color: "#9E9E9E" }}>
                  {cl?.name} · {new Date(c.scheduled_date).toLocaleDateString("pt-BR")} {c.scheduled_time} · R$ {c.payment_amount}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={tag(c.status)}>{c.status}</span>
                <button onClick={() => setCleanings(cleanings.filter((x) => x.id !== c.id))} style={iconBtn}><Trash2 size={14} /></button>
              </div>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}

function Kpi({ label, value, accent = "#111" }: { label: string; value: string; accent?: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #EFEFEF" }}>
      <p style={{ color: "#9E9E9E", fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 800, color: accent }}>{value}</p>
    </div>
  );
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: 16, border: "1px solid #EFEFEF" }}>
      <h3 style={{ fontWeight: 800, fontSize: 14, marginBottom: 10, color: "#111" }}>{title}</h3>
      {children}
    </div>
  );
}
function Row({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px dashed #EFEFEF", fontSize: 13 }}>
      <span style={{ color: "#616161" }}>{label}</span>
      <span style={{ fontWeight: 800, color }}>{value}</span>
    </div>
  );
}
function tag(s: string): React.CSSProperties {
  const c = s === "ocupado" || s === "hospedado" || s === "concluido" ? "#00C896"
         : s === "limpeza" || s === "em_andamento" ? "#FFB347"
         : s === "checkout" ? "#FF6B6B"
         : "#9E9E9E";
  return { background: c + "1A", color: c, padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700, textTransform: "uppercase" };
}
const inp: React.CSSProperties = { padding: "8px 12px", border: "1px solid #E0E0E0", borderRadius: 8, fontSize: 13, flex: "1 1 140px" };
const btn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 6, background: "#FF6B6B", color: "#fff", padding: "8px 14px", borderRadius: 8, border: "none", fontWeight: 700, fontSize: 13, cursor: "pointer" };
const iconBtn: React.CSSProperties = { background: "transparent", border: "none", color: "#9E9E9E", cursor: "pointer", padding: 4 };
const item: React.CSSProperties = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", border: "1px solid #EFEFEF", borderRadius: 10 };
