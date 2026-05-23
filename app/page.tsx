"use client";

import { useEffect, useState } from "react";

type BookingDate = {
  event_date: string;
  status: "pending" | "confirmed" | string;
};

const SUPABASE_URL = "https://edsepuksrgfuecpmgubj.supabase.co/rest/v1";
const SUPABASE_KEY = "sb_publishable_FqYvoviMiaR_A7Z6k_79jA_xKnYZ6FV";

const services = [
  { name: "DJing", price: 350, desc: "Μουσική κάλυψη για γάμους, βαφτίσεις, parties και events." },
  { name: "Ηχητικός Εξοπλισμός", price: 300, desc: "Επαγγελματικός ήχος για μικρές και μεγάλες εκδηλώσεις." },
  { name: "Φωτορυθμικά", price: 150, desc: "Elegant lighting setup για ατμόσφαιρα και ένταση." },
  { name: "Καπνός Ξηρού Πάγου", price: 150, desc: "Premium εφέ για πρώτο χορό και ξεχωριστές στιγμές." },
];

const fountainOptions = [0, 2, 4, 6, 8, 10, 12];

export default function Home() {
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [fountains, setFountains] = useState(0);
  const [bookingDates, setBookingDates] = useState<BookingDate[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dateMessage, setDateMessage] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchBookingDates();
  }, []);

  const fetchBookingDates = async () => {
    const res = await fetch(`${SUPABASE_URL}/bookings?select=event_date,status`, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      setBookingDates(data);
    }
  };

  const getDateStatus = (date: string) => {
    return bookingDates.find((item) => item.event_date === date)?.status || "";
  };

  const handleDateChange = (date: string) => {
    setSelectedDate(date);
    const status = getDateStatus(date);

    if (status === "confirmed") {
      setDateMessage("🔴 Αυτή η ημερομηνία έχει κλειστεί.");
    } else if (status === "pending") {
      setDateMessage("🟠 Υπάρχει ήδη εκκρεμές αίτημα για αυτή την ημερομηνία.");
    } else {
      setDateMessage("✅ Η ημερομηνία φαίνεται διαθέσιμη.");
    }
  };

  const fountainsPrice = fountains === 0 ? 0 : fountains === 2 ? 80 : fountains * 35;

  const totalPrice =
    services
      .filter((item) => selectedServices.includes(item.name))
      .reduce((sum, item) => sum + item.price, 0) + fountainsPrice;

  const toggleService = (name: string) => {
    setSelectedServices((old) =>
      old.includes(name) ? old.filter((item) => item !== name) : [...old, name]
    );
  };

  const changeFountains = (direction: "up" | "down") => {
    const index = fountainOptions.indexOf(fountains);
    if (direction === "up" && index < fountainOptions.length - 1) {
      setFountains(fountainOptions[index + 1]);
    }
    if (direction === "down" && index > 0) {
      setFountains(fountainOptions[index - 1]);
    }
  };

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const saveBookingToSupabase = async () => {
    const res = await fetch(`${SUPABASE_URL}/bookings`, {
      method: "POST",
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        event_date: selectedDate,
        status: "pending",
      }),
    });

    return res.ok;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const status = getDateStatus(selectedDate);

    if (status === "confirmed") {
      alert("Αυτή η ημερομηνία έχει κλειστεί.");
      return;
    }

    const supabaseSaved = await saveBookingToSupabase();

    if (!supabaseSaved) {
      alert("Δεν αποθηκεύτηκε στο Supabase.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "89ec85a7-a56b-4940-885d-55d02282101b");
    formData.append("subject", "Νέα κράτηση από Kalogirou Team");
    formData.append("Ημερομηνία", selectedDate);
    formData.append("Υπηρεσίες", selectedServices.join(", "));
    formData.append("Συντριβάνια", fountains > 0 ? `${fountains} τεμάχια` : "Όχι");
    formData.append("Σύνολο", `${totalPrice}€`);

    await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    await fetchBookingDates();
    setSuccess(true);
  };

  if (success) {
    return (
      <main style={successPage}>
        <div style={successBox}>
          <p style={smallGold}>KALOGIROU TEAM</p>
          <h1 style={successTitle}>Ευχαριστούμε!</h1>
          <p style={successText}>
            Το αίτημα κράτησης στάλθηκε επιτυχώς. Θα επικοινωνήσουμε μαζί σας σύντομα.
          </p>
          <button onClick={() => setSuccess(false)} style={darkButton}>
            ΕΠΙΣΤΡΟΦΗ
          </button>
        </div>
      </main>
    );
  }

  return (
    <main style={page}>
      <nav style={nav}>
        <div style={logo}>KALOGIROU TEAM</div>
        <div style={navLinks}>
          <button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} style={navButton}>Services</button>
          <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })} style={navButton}>Pricing</button>
          <button onClick={scrollToBooking} style={navCta}>Booking</button>
        </div>
      </nav>

      <section style={hero}>
        <div style={heroText}>
          <p style={smallGold}>DJ • SOUND • LIGHTING • LIVE EVENTS</p>
          <h1 style={heroTitle}>Luxury event sound experience.</h1>
          <p style={heroSubtitle}>
            Μουσική, ηχητικός εξοπλισμός, φωτισμός και ειδικά εφέ για γάμους,
            βαφτίσεις, parties, live και πανηγύρια.
          </p>
          <div style={heroButtons}>
            <button onClick={scrollToBooking} style={darkButton}>ΚΛΕΙΣΕ EVENT</button>
            <button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} style={lightButton}>
              ΔΕΣ ΥΠΗΡΕΣΙΕΣ
            </button>
          </div>
        </div>

        <div style={heroImage}>
          <div style={imageOverlayText}>
            <span>Weddings</span>
            <span>Live Events</span>
            <span>Private Parties</span>
          </div>
        </div>
      </section>

      <section id="services" style={section}>
        <p style={smallGold}>WHAT WE OFFER</p>
        <h2 style={sectionTitle}>Υπηρεσίες για κάθε στιγμή της εκδήλωσης.</h2>

        <div style={servicesGrid}>
          {services.map((service) => (
            <button
              key={service.name}
              onClick={() => toggleService(service.name)}
              style={{
                ...serviceCard,
                borderColor: selectedServices.includes(service.name) ? "#c6a15b" : "#eee",
                background: selectedServices.includes(service.name) ? "#fffaf0" : "#fff",
              }}
            >
              <div>
                <h3 style={cardTitle}>{service.name}</h3>
                <p style={cardText}>{service.desc}</p>
              </div>
              <strong style={cardPrice}>{service.price}€</strong>
            </button>
          ))}
        </div>
      </section>

      <section style={gallerySection}>
        <div style={galleryOne}></div>
        <div style={galleryText}>
          <p style={smallGold}>EVENT ATMOSPHERE</p>
          <h2 style={sectionTitle}>Καθαρός ήχος, κομψός φωτισμός, σωστό setup.</h2>
          <p style={paragraph}>
            Από τον πρώτο χορό μέχρι το τελευταίο τραγούδι, ο στόχος είναι η εκδήλωση
            να φαίνεται και να ακούγεται επαγγελματική.
          </p>
        </div>
        <div style={galleryTwo}></div>
      </section>

      <section id="pricing" style={pricingSection}>
        <div>
          <p style={smallGold}>PRICE ESTIMATOR</p>
          <h2 style={sectionTitle}>Υπολόγισε ενδεικτικά το κόστος.</h2>
          <p style={paragraph}>
            Επίλεξε υπηρεσίες και δες άμεσα το σύνολο. Η τελική τιμή επιβεβαιώνεται μετά την επικοινωνία.
          </p>
        </div>

        <div style={pricePanel}>
          <div style={summaryLine}>
            <span>Επιλεγμένες υπηρεσίες</span>
            <strong>{selectedServices.length}</strong>
          </div>

          <div style={fountainBox}>
            <div>
              <strong>Επιδαπέδια Συντριβάνια</strong>
              <p style={miniText}>2 τεμ. = 80€ / από 4 και πάνω 35€ το τεμάχιο</p>
            </div>
            <div style={counter}>
              <button onClick={() => changeFountains("down")} style={counterBtn}>−</button>
              <span>{fountains}</span>
              <button onClick={() => changeFountains("up")} style={counterBtn}>+</button>
            </div>
          </div>

          <div style={totalPriceBox}>
            <span>Σύνολο</span>
            <strong>{totalPrice}€</strong>
          </div>

          <button onClick={scrollToBooking} style={{ ...darkButton, width: "100%" }}>
            ΣΥΝΕΧΕΙΑ ΣΤΗΝ ΚΡΑΤΗΣΗ
          </button>
        </div>
      </section>

      <section id="booking" style={bookingSection}>
        <div style={bookingIntro}>
          <p style={smallGold}>BOOK YOUR DATE</p>
          <h2 style={sectionTitle}>Στείλε αίτημα κράτησης.</h2>
          <p style={paragraph}>
            Διάλεξε ημερομηνία και στείλε τα στοιχεία σου. Οι πορτοκαλί ημερομηνίες έχουν ήδη εκκρεμές αίτημα.
          </p>
        </div>

        <form onSubmit={handleSubmit} style={form}>
          <input style={input} name="Ονοματεπώνυμο" placeholder="Ονοματεπώνυμο" required />
          <input style={input} name="Τηλέφωνο" placeholder="Τηλέφωνο" required />
          <input style={input} type="email" name="Email" placeholder="Email" required />

          <input
            style={{
              ...input,
              borderColor:
                getDateStatus(selectedDate) === "confirmed"
                  ? "red"
                  : getDateStatus(selectedDate) === "pending"
                  ? "orange"
                  : "#ddd",
            }}
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            required
          />

          {dateMessage && <div style={dateNotice}>{dateMessage}</div>}

          <input style={input} name="Τοποθεσία" placeholder="Περιοχή / Τοποθεσία εκδήλωσης" required />

          <select style={input} name="Τύπος εκδήλωσης" required defaultValue="">
            <option value="" disabled>Τύπος εκδήλωσης</option>
            <option>Γάμος</option>
            <option>Βάπτιση</option>
            <option>Party</option>
            <option>Corporate Event</option>
            <option>Live Event</option>
            <option>Πανηγύρι</option>
            <option>Άλλο</option>
          </select>

          <div style={bookingTotal}>
            <span>Σύνολο επιλογών</span>
            <strong>{totalPrice}€</strong>
          </div>

          <button type="submit" style={{ ...darkButton, width: "100%" }}>
            ΑΠΟΣΤΟΛΗ ΑΙΤΗΜΑΤΟΣ
          </button>
        </form>
      </section>

      <footer style={footer}>
        <strong>KALOGIROU TEAM</strong>
        <span>DJ • Sound • Lighting • Events</span>
      </footer>
    </main>
  );
}

const page = {
  background: "#faf8f3",
  color: "#171717",
  fontFamily: "Arial, Helvetica, sans-serif",
};

const nav = {
  position: "fixed" as const,
  top: 0,
  left: 0,
  right: 0,
  height: "72px",
  background: "rgba(250,248,243,0.85)",
  backdropFilter: "blur(18px)",
  zIndex: 50,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "0 7vw",
  borderBottom: "1px solid rgba(0,0,0,0.06)",
};

const logo = {
  fontWeight: 900,
  letterSpacing: "2px",
};

const navLinks = {
  display: "flex",
  gap: "10px",
  alignItems: "center",
};

const navButton = {
  border: "none",
  background: "transparent",
  fontWeight: 700,
  cursor: "pointer",
};

const navCta = {
  border: "none",
  background: "#171717",
  color: "white",
  padding: "11px 18px",
  borderRadius: "999px",
  fontWeight: 800,
  cursor: "pointer",
};

const hero = {
  minHeight: "100vh",
  display: "grid",
  gridTemplateColumns: "1.05fr 0.95fr",
  gap: "5vw",
  alignItems: "center",
  padding: "110px 7vw 60px",
  boxSizing: "border-box" as const,
};

const heroText = {
  maxWidth: "680px",
};

const smallGold = {
  color: "#a77a2d",
  fontWeight: 900,
  letterSpacing: "2px",
  fontSize: "13px",
  marginBottom: "16px",
};

const heroTitle = {
  fontSize: "clamp(48px, 7vw, 96px)",
  lineHeight: "0.95",
  margin: "0 0 24px",
  letterSpacing: "-4px",
};

const heroSubtitle = {
  fontSize: "20px",
  lineHeight: "1.65",
  color: "#555",
  maxWidth: "610px",
};

const heroButtons = {
  display: "flex",
  gap: "14px",
  marginTop: "34px",
  flexWrap: "wrap" as const,
};

const darkButton = {
  background: "#171717",
  color: "white",
  border: "none",
  padding: "16px 28px",
  borderRadius: "999px",
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 18px 35px rgba(0,0,0,0.18)",
};

const lightButton = {
  background: "white",
  color: "#171717",
  border: "1px solid #ddd",
  padding: "16px 28px",
  borderRadius: "999px",
  fontWeight: 900,
  cursor: "pointer",
};

const heroImage = {
  height: "72vh",
  minHeight: "520px",
  borderRadius: "36px",
  backgroundImage:
    "linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url('/booking-bg.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
  position: "relative" as const,
  boxShadow: "0 30px 80px rgba(0,0,0,0.22)",
};

const imageOverlayText = {
  position: "absolute" as const,
  bottom: "28px",
  left: "28px",
  right: "28px",
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  color: "white",
  fontWeight: 800,
  fontSize: "14px",
};

const section = {
  padding: "90px 7vw",
};

const sectionTitle = {
  fontSize: "clamp(34px, 5vw, 62px)",
  letterSpacing: "-2px",
  lineHeight: "1.05",
  margin: "0 0 30px",
};

const servicesGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
  gap: "18px",
};

const serviceCard = {
  minHeight: "230px",
  border: "1px solid #eee",
  borderRadius: "28px",
  padding: "28px",
  textAlign: "left" as const,
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "space-between",
  cursor: "pointer",
  transition: "0.2s",
};

const cardTitle = {
  fontSize: "24px",
  margin: "0 0 12px",
};

const cardText = {
  color: "#666",
  lineHeight: "1.55",
};

const cardPrice = {
  fontSize: "28px",
  color: "#a77a2d",
};

const gallerySection = {
  padding: "40px 7vw 100px",
  display: "grid",
  gridTemplateColumns: "1fr 1fr 1fr",
  gap: "22px",
  alignItems: "stretch",
};

const galleryOne = {
  minHeight: "460px",
  borderRadius: "34px",
  backgroundImage: "url('/details-bg.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const galleryTwo = {
  minHeight: "460px",
  borderRadius: "34px",
  backgroundImage: "url('/dj-console.jpg')",
  backgroundSize: "cover",
  backgroundPosition: "center",
};

const galleryText = {
  background: "#171717",
  color: "white",
  borderRadius: "34px",
  padding: "36px",
  display: "flex",
  flexDirection: "column" as const,
  justifyContent: "center",
};

const paragraph = {
  color: "#666",
  fontSize: "18px",
  lineHeight: "1.7",
};

const pricingSection = {
  padding: "100px 7vw",
  display: "grid",
  gridTemplateColumns: "1fr 440px",
  gap: "50px",
  alignItems: "center",
  background: "white",
};

const pricePanel = {
  background: "#faf8f3",
  border: "1px solid #eee",
  borderRadius: "34px",
  padding: "30px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
};

const summaryLine = {
  display: "flex",
  justifyContent: "space-between",
  padding: "18px 0",
  borderBottom: "1px solid #e8e2d8",
};

const fountainBox = {
  display: "grid",
  gap: "18px",
  padding: "24px 0",
};

const miniText = {
  color: "#777",
  margin: "8px 0 0",
};

const counter = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  background: "white",
  borderRadius: "999px",
  padding: "10px",
  fontWeight: 900,
};

const counterBtn = {
  width: "42px",
  height: "42px",
  borderRadius: "50%",
  border: "none",
  background: "#171717",
  color: "white",
  fontSize: "22px",
  cursor: "pointer",
};

const totalPriceBox = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  fontSize: "26px",
  fontWeight: 900,
  padding: "24px 0",
};

const bookingSection = {
  padding: "110px 7vw",
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "60px",
  alignItems: "start",
};

const bookingIntro = {
  position: "sticky" as const,
  top: "110px",
};

const form = {
  background: "white",
  borderRadius: "34px",
  padding: "32px",
  display: "grid",
  gap: "14px",
  boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
};

const input = {
  width: "100%",
  padding: "17px 18px",
  borderRadius: "16px",
  border: "1px solid #ddd",
  background: "#fafafa",
  color: "#171717",
  fontSize: "16px",
  boxSizing: "border-box" as const,
};

const dateNotice = {
  padding: "14px",
  borderRadius: "16px",
  background: "#faf8f3",
  fontWeight: 800,
};

const bookingTotal = {
  display: "flex",
  justifyContent: "space-between",
  padding: "18px 0",
  fontSize: "20px",
  fontWeight: 900,
};

const footer = {
  padding: "45px 7vw",
  display: "flex",
  justifyContent: "space-between",
  gap: "20px",
  borderTop: "1px solid #e8e2d8",
  color: "#555",
};

const successPage = {
  minHeight: "100vh",
  display: "grid",
  placeItems: "center",
  background: "#faf8f3",
  padding: "30px",
};

const successBox = {
  maxWidth: "620px",
  background: "white",
  borderRadius: "34px",
  padding: "50px",
  textAlign: "center" as const,
  boxShadow: "0 20px 60px rgba(0,0,0,0.1)",
};

const successTitle = {
  fontSize: "58px",
  margin: "0 0 18px",
};

const successText = {
  color: "#666",
  fontSize: "20px",
  lineHeight: "1.6",
};