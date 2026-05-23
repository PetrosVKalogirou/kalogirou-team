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
  { name: "Φωτορυθμικά", price: 150, desc: "Elegant φωτισμός για ατμόσφαιρα και ένταση." },
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

    if (status === "confirmed") setDateMessage("🔴 Αυτή η ημερομηνία έχει κλειστεί.");
    else if (status === "pending") setDateMessage("🟠 Υπάρχει ήδη εκκρεμές αίτημα για αυτή την ημερομηνία.");
    else setDateMessage("✅ Η ημερομηνία φαίνεται διαθέσιμη.");
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

    if (getDateStatus(selectedDate) === "confirmed") {
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
    formData.append("Συντριβάνια", fountains > 0 ? `${fountains} τεμάχια - ${fountainsPrice}€` : "Όχι");
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
      <main className="successPage">
        <div className="successBox">
          <p className="eyebrow">KALOGIROU TEAM</p>
          <h1>Ευχαριστούμε!</h1>
          <p>Το αίτημα κράτησης στάλθηκε επιτυχώς. Θα επικοινωνήσουμε μαζί σας σύντομα.</p>
          <button onClick={() => setSuccess(false)} className="darkBtn">ΕΠΙΣΤΡΟΦΗ</button>
        </div>
        <Styles />
      </main>
    );
  }

  return (
    <main className="page">
      <nav className="nav">
        <div className="logo">KALOGIROU TEAM</div>
        <div className="navLinks">
          <button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}>Services</button>
          <button onClick={() => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })}>Pricing</button>
          <button onClick={scrollToBooking} className="navCta">Booking</button>
        </div>
      </nav>

      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">DJ • SOUND • LIGHTING • LIVE EVENTS</p>
          <h1>Luxury event sound experience.</h1>
          <p>
            Μουσική, ηχητικός εξοπλισμός, φωτισμός και ειδικά εφέ για γάμους,
            βαφτίσεις, parties, live και πανηγύρια.
          </p>
          <div className="heroButtons">
            <button onClick={scrollToBooking} className="darkBtn">ΚΛΕΙΣΕ EVENT</button>
            <button onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })} className="lightBtn">
              ΔΕΣ ΥΠΗΡΕΣΙΕΣ
            </button>
          </div>
        </div>

        <div className="heroImage">
          <div>
            <span>Weddings</span>
            <span>Live Events</span>
            <span>Private Parties</span>
          </div>
        </div>
      </section>

      <section id="services" className="section">
        <p className="eyebrow">WHAT WE OFFER</p>
        <h2>Υπηρεσίες για κάθε στιγμή της εκδήλωσης.</h2>

        <div className="servicesGrid">
          {services.map((service) => (
            <button
              key={service.name}
              onClick={() => toggleService(service.name)}
              className={selectedServices.includes(service.name) ? "serviceCard active" : "serviceCard"}
            >
              <div>
                <h3>{service.name}</h3>
                <p>{service.desc}</p>
              </div>
              <strong>{service.price}€</strong>
            </button>
          ))}
        </div>
      </section>

      <section className="gallery">
        <div className="galleryImage one" />
        <div className="galleryText">
          <p className="eyebrow">EVENT ATMOSPHERE</p>
          <h2>Καθαρός ήχος, κομψός φωτισμός, σωστό setup.</h2>
          <p>
            Από τον πρώτο χορό μέχρι το τελευταίο τραγούδι, ο στόχος είναι η εκδήλωση
            να φαίνεται και να ακούγεται επαγγελματική.
          </p>
        </div>
        <div className="galleryImage two" />
      </section>

      <section id="pricing" className="pricing">
        <div>
          <p className="eyebrow">PRICE ESTIMATOR</p>
          <h2>Υπολόγισε ενδεικτικά το κόστος.</h2>
          <p>
            Επίλεξε υπηρεσίες και δες άμεσα το σύνολο. Η τελική τιμή επιβεβαιώνεται μετά την επικοινωνία.
          </p>
        </div>

        <div className="pricePanel">
          <div className="line">
            <span>Επιλεγμένες υπηρεσίες</span>
            <strong>{selectedServices.length}</strong>
          </div>

          <div className="fountainBox">
            <div>
              <strong>Επιδαπέδια Συντριβάνια</strong>
              <p>2 τεμ. = 80€ / από 4 και πάνω 35€ το τεμάχιο</p>
            </div>

            <div className="counter">
              <button onClick={() => changeFountains("down")}>−</button>
              <span>{fountains}</span>
              <button onClick={() => changeFountains("up")}>+</button>
            </div>

            <div className="fountainPrice">
              <span>Τιμή συντριβανιών</span>
              <strong>{fountainsPrice}€</strong>
            </div>
          </div>

          <div className="total">
            <span>Σύνολο</span>
            <strong>{totalPrice}€</strong>
          </div>

          <button onClick={scrollToBooking} className="darkBtn full">ΣΥΝΕΧΕΙΑ ΣΤΗΝ ΚΡΑΤΗΣΗ</button>
        </div>
      </section>

      <section id="booking" className="booking">
        <div className="bookingIntro">
          <p className="eyebrow">BOOK YOUR DATE</p>
          <h2>Στείλε αίτημα κράτησης.</h2>
          <p>
            Διάλεξε ημερομηνία και στείλε τα στοιχεία σου. Οι πορτοκαλί ημερομηνίες έχουν ήδη εκκρεμές αίτημα.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <input name="Ονοματεπώνυμο" placeholder="Ονοματεπώνυμο" required />
          <input name="Τηλέφωνο" placeholder="Τηλέφωνο" required />
          <input type="email" name="Email" placeholder="Email" required />

          <input
            className={
              getDateStatus(selectedDate) === "confirmed"
                ? "date red"
                : getDateStatus(selectedDate) === "pending"
                ? "date orange"
                : "date"
            }
            type="date"
            value={selectedDate}
            onChange={(e) => handleDateChange(e.target.value)}
            required
          />

          {dateMessage && <div className="dateNotice">{dateMessage}</div>}

          <input name="Τοποθεσία" placeholder="Περιοχή / Τοποθεσία εκδήλωσης" required />

          <select name="Τύπος εκδήλωσης" required defaultValue="">
            <option value="" disabled>Τύπος εκδήλωσης</option>
            <option>Γάμος</option>
            <option>Βάπτιση</option>
            <option>Party</option>
            <option>Corporate Event</option>
            <option>Live Event</option>
            <option>Πανηγύρι</option>
            <option>Άλλο</option>
          </select>

          <div className="bookingTotal">
            <span>Σύνολο επιλογών</span>
            <strong>{totalPrice}€</strong>
          </div>

          <button type="submit" className="darkBtn full">ΑΠΟΣΤΟΛΗ ΑΙΤΗΜΑΤΟΣ</button>
        </form>
      </section>

      <footer>
        <strong>KALOGIROU TEAM</strong>
        <span>DJ • Sound • Lighting • Events</span>
      </footer>

      <Styles />
    </main>
  );
}

function Styles() {
  return (
    <style jsx global>{`
      * {
        box-sizing: border-box;
      }

      html,
      body {
        margin: 0;
        padding: 0;
        overflow-x: hidden;
        background: #faf8f3;
      }

      button,
      input,
      select {
        font-family: inherit;
      }

      .page {
        width: 100%;
        max-width: 100vw;
        overflow-x: hidden;
        background: #faf8f3;
        color: #171717;
        font-family: Arial, Helvetica, sans-serif;
      }

      .nav {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        height: 72px;
        background: rgba(250, 248, 243, 0.9);
        backdrop-filter: blur(18px);
        z-index: 50;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 7vw;
        border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      }

      .logo {
        font-weight: 900;
        letter-spacing: 2px;
        font-size: 15px;
        white-space: nowrap;
      }

      .navLinks {
        display: flex;
        gap: 10px;
        align-items: center;
      }

      .navLinks button {
        border: none;
        background: transparent;
        font-weight: 800;
        cursor: pointer;
      }

      .navLinks .navCta {
        background: #171717;
        color: white;
        padding: 11px 18px;
        border-radius: 999px;
      }

      .hero {
        min-height: 100vh;
        display: grid;
        grid-template-columns: 1.05fr 0.95fr;
        gap: 5vw;
        align-items: center;
        padding: 110px 7vw 60px;
      }

      .eyebrow {
        color: #a77a2d;
        font-weight: 900;
        letter-spacing: 2px;
        font-size: 13px;
        margin: 0 0 16px;
      }

      .hero h1 {
        font-size: clamp(48px, 7vw, 96px);
        line-height: 0.95;
        margin: 0 0 24px;
        letter-spacing: -4px;
      }

      .hero p,
      .pricing p,
      .booking p,
      .galleryText p {
        font-size: 18px;
        line-height: 1.7;
        color: #666;
      }

      .heroButtons {
        display: flex;
        gap: 14px;
        margin-top: 34px;
        flex-wrap: wrap;
      }

      .darkBtn,
      .lightBtn {
        border: none;
        padding: 16px 28px;
        border-radius: 999px;
        font-weight: 900;
        cursor: pointer;
        font-size: 15px;
      }

      .darkBtn {
        background: #171717;
        color: white;
        box-shadow: 0 18px 35px rgba(0, 0, 0, 0.18);
      }

      .lightBtn {
        background: white;
        color: #171717;
        border: 1px solid #ddd;
      }

      .full {
        width: 100%;
      }

      .heroImage {
        height: 72vh;
        min-height: 520px;
        border-radius: 36px;
        background-image: linear-gradient(to bottom, rgba(0,0,0,0.05), rgba(0,0,0,0.45)), url('/booking-bg.jpg');
        background-size: cover;
        background-position: center;
        position: relative;
        box-shadow: 0 30px 80px rgba(0, 0, 0, 0.22);
      }

      .heroImage div {
        position: absolute;
        bottom: 28px;
        left: 28px;
        right: 28px;
        display: flex;
        justify-content: space-between;
        gap: 10px;
        color: white;
        font-weight: 800;
        font-size: 14px;
      }

      .section,
      .pricing,
      .booking {
        padding: 90px 7vw;
      }

      .section h2,
      .pricing h2,
      .booking h2,
      .galleryText h2 {
        font-size: clamp(34px, 5vw, 62px);
        letter-spacing: -2px;
        line-height: 1.05;
        margin: 0 0 30px;
      }

      .servicesGrid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 18px;
      }

      .serviceCard {
        min-height: 230px;
        border: 1px solid #eee;
        border-radius: 28px;
        padding: 28px;
        text-align: left;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        cursor: pointer;
        transition: 0.2s;
        background: white;
      }

      .serviceCard.active {
        border-color: #c6a15b;
        background: #fffaf0;
      }

      .serviceCard h3 {
        font-size: 24px;
        margin: 0 0 12px;
      }

      .serviceCard p {
        color: #666;
        line-height: 1.55;
      }

      .serviceCard strong {
        font-size: 28px;
        color: #a77a2d;
      }

      .gallery {
        padding: 40px 7vw 100px;
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 22px;
      }

      .galleryImage {
        min-height: 460px;
        border-radius: 34px;
        background-size: cover;
        background-position: center;
      }

      .galleryImage.one {
        background-image: url('/details-bg.jpg');
      }

      .galleryImage.two {
        background-image: url('/dj-console.jpg');
      }

      .galleryText {
        background: #171717;
        color: white;
        border-radius: 34px;
        padding: 36px;
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .galleryText p {
        color: #d5d5d5;
      }

      .pricing {
        display: grid;
        grid-template-columns: 1fr 440px;
        gap: 50px;
        align-items: center;
        background: white;
      }

      .pricePanel {
        background: #faf8f3;
        border: 1px solid #eee;
        border-radius: 34px;
        padding: 30px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.08);
      }

      .line,
      .total,
      .fountainPrice,
      .bookingTotal {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .line {
        padding: 18px 0;
        border-bottom: 1px solid #e8e2d8;
      }

      .fountainBox {
        display: grid;
        gap: 18px;
        padding: 24px 0;
        border-bottom: 1px solid #e8e2d8;
      }

      .fountainBox p {
        color: #777;
        margin: 8px 0 0;
        font-size: 14px;
      }

      .counter {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: white;
        border-radius: 999px;
        padding: 10px;
        font-weight: 900;
      }

      .counter button {
        width: 42px;
        height: 42px;
        border-radius: 50%;
        border: none;
        background: #171717;
        color: white;
        font-size: 22px;
        cursor: pointer;
      }

      .fountainPrice {
        background: white;
        padding: 15px 18px;
        border-radius: 18px;
        font-weight: 900;
      }

      .total {
        font-size: 26px;
        font-weight: 900;
        padding: 24px 0;
      }

      .booking {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 60px;
        align-items: start;
      }

      .bookingIntro {
        position: sticky;
        top: 110px;
      }

      .form {
        background: white;
        border-radius: 34px;
        padding: 32px;
        display: grid;
        gap: 14px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.08);
      }

      .form input,
      .form select {
        width: 100%;
        padding: 17px 18px;
        border-radius: 16px;
        border: 1px solid #ddd;
        background: #fafafa;
        color: #171717;
        font-size: 16px;
      }

      .form .date.red {
        border-color: red;
      }

      .form .date.orange {
        border-color: orange;
      }

      .dateNotice {
        padding: 14px;
        border-radius: 16px;
        background: #faf8f3;
        font-weight: 800;
      }

      .bookingTotal {
        padding: 18px 0;
        font-size: 20px;
        font-weight: 900;
      }

      footer {
        padding: 45px 7vw;
        display: flex;
        justify-content: space-between;
        gap: 20px;
        border-top: 1px solid #e8e2d8;
        color: #555;
      }

      .successPage {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #faf8f3;
        padding: 30px;
        font-family: Arial, Helvetica, sans-serif;
      }

      .successBox {
        max-width: 620px;
        background: white;
        border-radius: 34px;
        padding: 50px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0,0,0,0.1);
      }

      .successBox h1 {
        font-size: 58px;
        margin: 0 0 18px;
      }

      .successBox p {
        color: #666;
        font-size: 20px;
        line-height: 1.6;
      }

      @media (max-width: 900px) {
        .nav {
          height: 66px;
          padding: 0 18px;
        }

        .logo {
          font-size: 13px;
          letter-spacing: 1.2px;
        }

        .navLinks button:not(.navCta) {
          display: none;
        }

        .navLinks .navCta {
          padding: 10px 14px;
          font-size: 13px;
        }

        .hero {
          min-height: auto;
          grid-template-columns: 1fr;
          padding: 96px 18px 44px;
          gap: 28px;
        }

        .hero h1 {
          font-size: 48px;
          letter-spacing: -2px;
        }

        .hero p,
        .pricing p,
        .booking p,
        .galleryText p {
          font-size: 16px;
        }

        .heroButtons {
          display: grid;
          grid-template-columns: 1fr;
        }

        .darkBtn,
        .lightBtn {
          width: 100%;
          padding: 15px 20px;
        }

        .heroImage {
          height: 430px;
          min-height: 430px;
          border-radius: 28px;
        }

        .heroImage div {
          flex-direction: column;
          align-items: flex-start;
          bottom: 22px;
          left: 22px;
          right: 22px;
        }

        .section,
        .pricing,
        .booking {
          padding: 66px 18px;
        }

        .section h2,
        .pricing h2,
        .booking h2,
        .galleryText h2 {
          font-size: 38px;
          letter-spacing: -1.5px;
        }

        .servicesGrid {
          grid-template-columns: 1fr;
        }

        .serviceCard {
          min-height: 190px;
          border-radius: 24px;
          padding: 24px;
        }

        .gallery {
          padding: 20px 18px 66px;
          grid-template-columns: 1fr;
        }

        .galleryImage {
          min-height: 330px;
          border-radius: 28px;
        }

        .galleryText {
          border-radius: 28px;
          padding: 28px;
        }

        .pricing {
          grid-template-columns: 1fr;
          gap: 28px;
        }

        .pricePanel {
          padding: 22px;
          border-radius: 28px;
        }

        .booking {
          grid-template-columns: 1fr;
          gap: 28px;
        }

        .bookingIntro {
          position: static;
        }

        .form {
          padding: 22px;
          border-radius: 28px;
        }

        footer {
          padding: 34px 18px;
          flex-direction: column;
        }

        .successBox {
          padding: 30px 22px;
          border-radius: 28px;
        }

        .successBox h1 {
          font-size: 42px;
        }
      }

      @media (max-width: 420px) {
        .hero h1 {
          font-size: 42px;
        }

        .section h2,
        .pricing h2,
        .booking h2,
        .galleryText h2 {
          font-size: 34px;
        }

        .heroImage {
          height: 360px;
          min-height: 360px;
        }
      }
    `}</style>
  );
}