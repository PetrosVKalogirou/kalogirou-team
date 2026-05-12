"use client";

import { useEffect, useState } from "react";

type Page = "home" | "booking" | "details" | "success";
type BookingDate = {
  event_date: string;
  status: "pending" | "confirmed" | string;
};

const SUPABASE_URL = "https://edsepuksrgfuecpmgubj.supabase.co/rest/v1";
const SUPABASE_KEY = "sb_publishable_FqYvoviMiaR_A7Z6k_79jA_xKnYZ6FV";

const services = [
  { name: "DJing", price: 350, image: "/dj-console.jpg" },
  { name: "Ηχητικός Εξοπλισμός (Ξεκιναει απο 300€) ", price: 300, image: "/sound-system.jpg" },
];

const effects = [
  { name: "Φωτορυθμικά", price: 150, image: "/lights.jpg" },
  { name: "Καπνός (Ξηρού Πάγου)", price: 150, image: "/dry-ice.jpg" },
];

const fountainOptions = [0, 2, 4, 6, 8, 10, 12];

export default function Home() {
  const [page, setPage] = useState<Page>("home");
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [fountains, setFountains] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [bookingDates, setBookingDates] = useState<BookingDate[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dateMessage, setDateMessage] = useState("");

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
      setDateMessage("🔴 Αυτή η ημερομηνία έχει κλειστεί και δεν είναι διαθέσιμη.");
    } else if (status === "pending") {
      setDateMessage("🟠 Για αυτή την ημερομηνία υπάρχουν ήδη εκκρεμή αιτήματα.");
    } else {
      setDateMessage("✅ Η ημερομηνία φαίνεται διαθέσιμη.");
    }
  };

  const fountainsPrice = fountains === 0 ? 0 : fountains === 2 ? 80 : fountains * 35;

  const totalPrice =
    [...services, ...effects]
      .filter((item) => selectedServices.includes(item.name))
      .reduce((sum, item) => sum + item.price, 0) + fountainsPrice;

  const toggleService = (name: string) => {
    setSelectedServices((old) =>
      old.includes(name) ? old.filter((item) => item !== name) : [...old, name]
    );
  };

  const changeFountains = (direction: "up" | "down") => {
    const index = fountainOptions.indexOf(fountains);
    if (direction === "up" && index < fountainOptions.length - 1) setFountains(fountainOptions[index + 1]);
    if (direction === "down" && index > 0) setFountains(fountainOptions[index - 1]);
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
      alert("Αυτή η ημερομηνία έχει κλειστεί και δεν μπορεί να γίνει αποστολή.");
      return;
    }

    const formData = new FormData(e.currentTarget);
    formData.append("access_key", "89ec85a7-a56b-4940-885d-55d02282101b");
    formData.append("subject", "Νέα κράτηση από Kalogirou Team");
    formData.append("Ημερομηνία", selectedDate);
    formData.append("Υπηρεσίες", selectedServices.join(", "));
    formData.append("Συντριβάνια", fountains > 0 ? `${fountains} τεμάχια` : "Όχι");
    formData.append("Σύνολο", `${totalPrice}€`);

    const supabaseSaved = await saveBookingToSupabase();

    if (!supabaseSaved) {
      alert("Δεν αποθηκεύτηκε η ημερομηνία στο Supabase. Πρέπει να φτιάξουμε τα Policies.");
      return;
    }

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      await fetchBookingDates();
      setPage("success");
    } else {
      alert("Σφάλμα αποστολής. Δοκίμασε ξανά.");
    }
  };

  if (page === "home") {
    return (
      <main
        style={{
          ...homePage,
          backgroundImage: isMobile
            ? "url('/kalogirou-poster-mobile.png')"
            : "url('/kalogirou-poster.png')",
        }}
      >
        <button
          onClick={() => setPage("booking")}
          style={{
            ...homeButton,
            top: isMobile ? "42%" : "46%",
            left: isMobile ? "50%" : "38%",
            width: isMobile ? "86%" : "auto",
            fontSize: isMobile ? "15px" : "18px",
            padding: isMobile ? "16px 11px" : "17px 36px",
          }}
        >
          ΚΛΕΙΣΕ ΤΟ ΕΠΟΜΕΝΟ EVENT
        </button>
      </main>
    );
  }

  if (page === "booking") {
    return (
      <section
        style={{
          ...bookingPage,
          backgroundImage: isMobile ? "url('/booking-bg-mobile.jpg')" : "url('/booking-bg.jpg')",
          padding: isMobile ? "80px 18px 40px" : "70px 80px",
        }}
      >
        <div style={darkOverlay} />
        <button onClick={() => setPage("home")} style={backButton}>←</button>

        <div style={content}>
          <h1 style={{ ...title, fontSize: isMobile ? "34px" : "54px" }}>Κλείσε το event σου</h1>
          <p style={subtitle}>Επίλεξε τις υπηρεσίες που θέλεις</p>

          <h3 style={sectionTitle}>ΥΠΗΡΕΣΙΕΣ</h3>

          <div style={{ ...topGrid, gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr" }}>
            {services.map((service) => (
              <label key={service.name} style={wideCard}>
                <input
                  type="checkbox"
                  checked={selectedServices.includes(service.name)}
                  onChange={() => toggleService(service.name)}
                  style={checkBox}
                />
                <img src={service.image} alt={service.name} style={wideImage} />
                <div>
                  <div style={cardName}>{service.name}</div>
                  <div style={price}>{service.price}€</div>
                </div>
              </label>
            ))}
          </div>

          <h3 style={sectionTitle}>SPECIAL EFFECTS</h3>

          <div style={{ ...effectsGrid, gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)" }}>
            {effects.map((effect) => (
              <label key={effect.name} style={effectCard}>
                <input
                  type="checkbox"
                  checked={selectedServices.includes(effect.name)}
                  onChange={() => toggleService(effect.name)}
                  style={checkBox}
                />

                <div style={smallName}>{effect.name}</div>
                <div style={smallPrice}>{effect.price}€</div>

                <div style={photoBox}>
                  <img src={effect.image} alt={effect.name} style={photo} />
                </div>
              </label>
            ))}

            <div style={effectCard}>
              <div style={smallName}>Επιδαπέδια Συντριβάνια</div>

              <div style={smallDescription}>
                2 τεμ. = 80€<br />
                από 4 και πάνω 35€ το τεμάχιο
              </div>

              <div style={fountainLayout}>
                <div style={counterBox}>
                  <button onClick={() => changeFountains("down")} style={counterButton}>−</button>

                  <div style={counterMiddle}>
                    <div style={{ fontSize: "24px", color: "#fff200", fontWeight: "900" }}>{fountains}</div>
                    <div style={{ fontSize: "12px", color: "#ccc" }}>τεμάχια</div>
                  </div>

                  <button onClick={() => changeFountains("up")} style={counterButton}>+</button>
                </div>

                <img src="/fountains.jpg" alt="Συντριβάνια" style={fountainImage} />
              </div>

              <div style={{ ...price, marginTop: "14px", textAlign: "center" }}>
                {fountainsPrice}€
              </div>
            </div>
          </div>

          <div style={totalBox}>
            <div style={{ fontSize: isMobile ? "24px" : "30px" }}>
              Σύνολο: <span style={{ color: "#fff200", fontWeight: "900" }}>{totalPrice}€</span>
            </div>

            <button onClick={() => setPage("details")} style={mainButton}>
              ΣΥΝΕΧΕΙΑ ΣΤΑ ΣΤΟΙΧΕΙΑ
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (page === "success") {
    return (
      <section
        style={{
          ...detailsPage,
          backgroundImage: isMobile ? "url('/details-bg-mobile.jpg')" : "url('/details-bg.jpg')",
        }}
      >
        <div style={darkOverlay} />
        <div style={content}>
          <h1 style={title}>Ευχαριστούμε!</h1>
          <p style={subtitle}>Το αίτημα κράτησης στάλθηκε επιτυχώς.</p>
          <button onClick={() => setPage("home")} style={mainButton}>ΕΠΙΣΤΡΟΦΗ ΣΤΗΝ ΑΡΧΙΚΗ</button>
        </div>
      </section>
    );
  }

  return (
    <section
      style={{
        ...detailsPage,
        backgroundImage: isMobile ? "url('/details-bg-mobile.jpg')" : "url('/details-bg.jpg')",
      }}
    >
      <div style={darkOverlay} />
      <button onClick={() => setPage("booking")} style={backButton}>←</button>

      <div style={{ ...content, maxWidth: "760px" }}>
        <h1 style={{ ...title, fontSize: isMobile ? "36px" : "54px" }}>Ημερομηνία & Στοιχεία</h1>

        <p style={{ ...subtitle, color: "#fff200" }}>
          Σύνολο: {totalPrice}€
        </p>

        <form onSubmit={handleSubmit} style={formStyle}>
          <input style={inputStyle} name="Ονοματεπώνυμο" placeholder="Ονοματεπώνυμο" required />
          <input style={inputStyle} name="Τηλέφωνο" placeholder="Τηλέφωνο" required />
          <input style={inputStyle} type="email" name="Email" placeholder="Email" required />

          <input
            style={{
              ...inputStyle,
              border:
                getDateStatus(selectedDate) === "confirmed"
                  ? "2px solid red"
                  : getDateStatus(selectedDate) === "pending"
                  ? "2px solid orange"
                  : "1px solid rgba(255,255,255,0.5)",
            }}
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            required
          />

          {dateMessage && (
            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                background:
                  getDateStatus(selectedDate) === "confirmed"
                    ? "rgba(255,0,0,0.18)"
                    : getDateStatus(selectedDate) === "pending"
                    ? "rgba(255,165,0,0.18)"
                    : "rgba(0,255,0,0.12)",
                color: "white",
                fontWeight: "800",
              }}
            >
              {dateMessage}
            </div>
          )}

          <input style={inputStyle} name="Τοποθεσία" placeholder="Περιοχή / Τοποθεσία εκδήλωσης" required />

          <select style={inputStyle} name="Τύπος εκδήλωσης" required defaultValue="">
            <option value="" disabled>Τύπος εκδήλωσης</option>
            <option>Γάμος</option>
            <option>Βάπτιση</option>
            <option>Party</option>
            <option>Corporate Event</option>
            <option>Live Event</option>
            <option>Άλλο</option>
          </select>

          <button type="submit" style={{ ...mainButton, width: "100%" }}>
            ΑΠΟΣΤΟΛΗ ΑΙΤΗΜΑΤΟΣ
          </button>
        </form>

        <p style={{ color: "#aaa", fontSize: "14px", marginTop: "20px" }}>
          🔒 Τα στοιχεία σας χρησιμοποιούνται μόνο για επικοινωνία σχετικά με την κράτησή σας.
        </p>
      </div>
    </section>
  );
}

const homePage = {
  minHeight: "100vh",
  width: "100vw",
  backgroundColor: "#000",
  backgroundSize: "contain",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "relative" as const,
  overflow: "hidden",
};

const bookingPage = {
  minHeight: "100vh",
  width: "100vw",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "relative" as const,
  color: "white",
  boxSizing: "border-box" as const,
};

const detailsPage = {
  minHeight: "100vh",
  width: "100vw",
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
  position: "relative" as const,
  color: "white",
  padding: "80px 20px",
  boxSizing: "border-box" as const,
  textAlign: "center" as const,
};

const darkOverlay = {
  position: "absolute" as const,
  inset: 0,
  background: "rgba(0,0,0,0.72)",
  zIndex: 0,
};

const content = {
  position: "relative" as const,
  zIndex: 1,
  margin: "0 auto",
  maxWidth: "1100px",
  textAlign: "center" as const,
};

const title = {
  fontSize: "54px",
  fontWeight: "900",
  margin: "0 0 10px",
  color: "white",
};

const subtitle = {
  fontSize: "22px",
  color: "#ccc",
  marginBottom: "50px",
};

const sectionTitle = {
  color: "#fff200",
  fontSize: "24px",
  fontWeight: "900",
  textAlign: "left" as const,
  margin: "35px 0 16px",
};

const topGrid = {
  display: "grid",
  gap: "34px",
  marginBottom: "35px",
};

const effectsGrid = {
  display: "grid",
  gap: "28px",
};

const wideCard = {
  minHeight: "155px",
  border: "2px solid #fff200",
  borderRadius: "18px",
  background: "rgba(0,0,0,0.72)",
  display: "flex",
  alignItems: "center",
  gap: "28px",
  padding: "22px",
  cursor: "pointer",
  position: "relative" as const,
  boxShadow: "0 0 25px rgba(255,242,0,0.12)",
};

const effectCard = {
  border: "2px solid #fff200",
  borderRadius: "18px",
  background: "rgba(0,0,0,0.76)",
  padding: "22px",
  cursor: "pointer",
  minHeight: "300px",
  position: "relative" as const,
  boxShadow: "0 0 25px rgba(255,242,0,0.12)",
  textAlign: "left" as const,
};

const checkBox = {
  width: "24px",
  height: "24px",
  accentColor: "#fff200",
};

const wideImage = {
  width: "190px",
  height: "115px",
  objectFit: "contain" as const,
};

const cardName = {
  fontSize: "24px",
  fontWeight: "900",
};

const price = {
  fontSize: "25px",
  fontWeight: "900",
  color: "#fff200",
  marginTop: "8px",
};

const smallName = {
  fontSize: "20px",
  fontWeight: "900",
  marginBottom: "8px",
};

const smallPrice = {
  fontSize: "20px",
  fontWeight: "900",
  color: "#fff200",
  marginBottom: "16px",
};

const smallDescription = {
  fontSize: "13px",
  color: "#ddd",
  lineHeight: "1.45",
  marginBottom: "18px",
};

const photoBox = {
  marginTop: "12px",
  width: "100%",
  height: "150px",
  borderRadius: "10px",
  overflow: "hidden",
  background: "rgba(255,255,255,0.04)",
};

const photo = {
  width: "100%",
  height: "100%",
  objectFit: "cover" as const,
};

const fountainLayout = {
  display: "grid",
  gridTemplateColumns: "1fr 120px",
  gap: "14px",
  alignItems: "center",
};

const fountainImage = {
  width: "120px",
  height: "145px",
  objectFit: "cover" as const,
  borderRadius: "10px",
};

const counterBox = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const counterButton = {
  width: "46px",
  height: "54px",
  border: "1px solid #fff200",
  background: "rgba(0,0,0,0.7)",
  color: "#fff200",
  fontSize: "24px",
  cursor: "pointer",
};

const counterMiddle = {
  width: "70px",
  height: "54px",
  borderTop: "1px solid #fff200",
  borderBottom: "1px solid #fff200",
  display: "grid",
  placeItems: "center",
  background: "rgba(0,0,0,0.5)",
  textAlign: "center" as const,
};

const totalBox = {
  margin: "35px auto 0",
  maxWidth: "700px",
  border: "2px solid #fff200",
  borderRadius: "18px",
  background: "rgba(0,0,0,0.75)",
  padding: "24px",
  textAlign: "center" as const,
};

const mainButton = {
  marginTop: "22px",
  background: "linear-gradient(90deg, #ffdd00, #fff200)",
  color: "black",
  border: "none",
  padding: "18px 34px",
  borderRadius: "12px",
  fontWeight: "900",
  fontSize: "16px",
  cursor: "pointer",
  boxShadow: "0 0 25px rgba(255,242,0,0.35)",
};

const homeButton = {
  position: "absolute" as const,
  transform: "translate(-50%, -50%)",
  backgroundColor: "#fff200",
  color: "black",
  borderRadius: "14px",
  fontWeight: "900",
  boxShadow: "0 0 25px rgb(246, 255, 0)",
  border: "none",
  cursor: "pointer",
};

const backButton = {
  position: "fixed" as const,
  top: "24px",
  left: "24px",
  backgroundColor: "rgba(0,0,0,0.5)",
  color: "#fff200",
  border: "2px solid #fff200",
  borderRadius: "50%",
  width: "52px",
  height: "52px",
  fontSize: "28px",
  fontWeight: "900",
  cursor: "pointer",
  zIndex: 10,
};

const formStyle = {
  display: "grid",
  gap: "14px",
};

const inputStyle = {
  width: "100%",
  padding: "17px 20px",
  borderRadius: "8px",
  border: "1px solid rgba(255,255,255,0.5)",
  background: "rgba(0,0,0,0.62)",
  color: "white",
  fontSize: "16px",
  boxSizing: "border-box" as const,
};