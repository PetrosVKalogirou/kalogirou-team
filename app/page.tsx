"use client";

import { useEffect, useRef, useState } from "react";

type BookingDate = {
  event_date: string;
  status: "pending" | "confirmed" | string;
};

type EventType = "Γάμος" | "Βάπτιση" | "Γάμος & Βάπτιση" | "Party" | "Corporate Event";
type GuestRange = "0-150" | "150-500" | "500+";
type VenueType = "Εσωτερικός χώρος" | "Εξωτερικός χώρος" | "Και τα δύο";
type OrchestraRange = "2-3" | "4-5" | "6-7" | "8+";

type StoryCategory = {
  id: string;
  title: string;
  icon: string;
  videos: string[];
};

const SUPABASE_URL = "https://edsepuksrgfuecpmgubj.supabase.co/rest/v1";
const SUPABASE_KEY = "sb_publishable_FqYvoviMiaR_A7Z6k_79jA_xKnYZ6FV";

const INSTAGRAM_URL =
  "https://www.instagram.com/djvasilis_kalogirou?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==";
const FACEBOOK_URL = "https://www.facebook.com/djkalogirou";
const PHONE = "6984249876";
const WEB3FORMS_KEY = "5645dbee-d04b-4046-9301-60f6a8ea2e8e";

const eventTypes: EventType[] = ["Γάμος", "Βάπτιση", "Γάμος & Βάπτιση", "Party", "Corporate Event"];
const guestRanges: GuestRange[] = ["0-150", "150-500", "500+"];
const venueTypes: VenueType[] = ["Εσωτερικός χώρος", "Εξωτερικός χώρος", "Και τα δύο"];
const orchestraRanges: OrchestraRange[] = ["2-3", "4-5", "6-7", "8+"];

const djPrices: Record<EventType, number> = {
  "Γάμος": 250,
  "Βάπτιση": 200,
  "Γάμος & Βάπτιση": 250,
  "Party": 200,
  "Corporate Event": 200,
};

const soundPrices: Record<GuestRange, number> = {
  "0-150": 250,
  "150-500": 300,
  "500+": 400,
};

const orchestraPrices: Record<OrchestraRange, number> = {
  "2-3": 200,
  "4-5": 200,
  "6-7": 200,
  "8+": 200,
};

const fixedServices = [
  { name: "Φωτορυθμικά", price: 150, desc: "Elegant φωτισμός για ατμόσφαιρα και ένταση." },
  { name: "Καπνός Ξηρού Πάγου", price: 150, desc: "Premium εφέ για πρώτο χορό και ξεχωριστές στιγμές." },
];

const fountainOptions = [0, 2, 4, 6, 8, 10, 12];

const storyCategories: StoryCategory[] = [
  {
    id: "wedding",
    title: "Γάμοι",
    icon: "💍",
    videos: ["/stories/wedding-1.mp4", "/stories/wedding-2.mp4", "/stories/wedding-3.mp4"],
  },
  {
    id: "dance",
    title: "Πίστα",
    icon: "🕺",
    videos: ["/stories/dance-1.mp4", "/stories/dance-2.mp4", "/stories/dance-3.mp4"],
  },
  {
    id: "party",
    title: "Party",
    icon: "🎉",
    videos: [
      "/stories/party-1.mp4",
      "/stories/party-2.mp4",
      "/stories/party-3.mp4",
      "/stories/party-4.mp4",
      "/stories/party-5.mp4",
    ],
  },
  {
    id: "setup",
    title: "Setup",
    icon: "🎛️",
    videos: ["/stories/setup-1.mp4", "/stories/setup-2.mp4", "/stories/setup-3.mp4"],
  },
];

export default function Home() {
  const [eventType, setEventType] = useState<EventType>("Γάμος");
  const [guestRange, setGuestRange] = useState<GuestRange>("0-150");
  const [venueType, setVenueType] = useState<VenueType>("Εξωτερικός χώρος");
  const [hasOrchestra, setHasOrchestra] = useState(false);
  const [orchestraRange, setOrchestraRange] = useState<OrchestraRange>("4-5");

  const [selectedServices, setSelectedServices] = useState<string[]>(["DJing", "Ηχητικός Εξοπλισμός"]);
  const [fountains, setFountains] = useState(0);
  const [bookingDates, setBookingDates] = useState<BookingDate[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [dateMessage, setDateMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pricesUnlocked, setPricesUnlocked] = useState(false);
  const [unlockName, setUnlockName] = useState("");
  const [unlockEmail, setUnlockEmail] = useState("");
  const [isUnlocking, setIsUnlocking] = useState(false);

  const [activeCategoryIndex, setActiveCategoryIndex] = useState<number | null>(null);
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const activeStory = activeCategoryIndex !== null ? storyCategories[activeCategoryIndex] : null;

  useEffect(() => {
    fetchBookingDates();

    const savedUnlock = localStorage.getItem("kalogirou_prices_unlocked");
    if (savedUnlock === "yes") setPricesUnlocked(true);
  }, []);

  useEffect(() => {
    if (activeStory && videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeCategoryIndex, activeVideoIndex, activeStory]);

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

  const djPrice = djPrices[eventType];
  const soundPrice = soundPrices[guestRange];
  const orchestraPrice = hasOrchestra ? orchestraPrices[orchestraRange] : 0;
  const fountainsPrice = fountains === 0 ? 0 : fountains === 2 ? 80 : fountains * 35;

  const services = [
    { name: "DJing", price: djPrice, desc: "Μουσική κάλυψη προσαρμοσμένη στον τύπο της εκδήλωσης." },
    { name: "Ηχητικός Εξοπλισμός", price: soundPrice, desc: "Ηχητικό setup ανάλογα με τα άτομα και τις ανάγκες του χώρου." },
    ...fixedServices,
  ];

  const totalPrice =
    services
      .filter((item) => selectedServices.includes(item.name))
      .reduce((sum, item) => sum + item.price, 0) +
    fountainsPrice +
    orchestraPrice;

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

  const scrollToBooking = () => {
    document.getElementById("booking")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToCalculator = () => {
    document.getElementById("calculator")?.scrollIntoView({ behavior: "smooth" });
  };

  const openStory = (index: number) => {
    setActiveCategoryIndex(index);
    setActiveVideoIndex(0);
  };

  const closeStory = () => {
    setActiveCategoryIndex(null);
    setActiveVideoIndex(0);
  };

  const nextStoryVideo = () => {
    if (activeCategoryIndex === null) return;

    const currentCategory = storyCategories[activeCategoryIndex];

    if (activeVideoIndex < currentCategory.videos.length - 1) {
      setActiveVideoIndex((old) => old + 1);
      return;
    }

    if (activeCategoryIndex < storyCategories.length - 1) {
      setActiveCategoryIndex((old) => (old === null ? null : old + 1));
      setActiveVideoIndex(0);
      return;
    }

    closeStory();
  };

  const previousStoryVideo = () => {
    if (activeCategoryIndex === null) return;

    if (activeVideoIndex > 0) {
      setActiveVideoIndex((old) => old - 1);
      return;
    }

    if (activeCategoryIndex > 0) {
      const previousCategoryIndex = activeCategoryIndex - 1;
      setActiveCategoryIndex(previousCategoryIndex);
      setActiveVideoIndex(storyCategories[previousCategoryIndex].videos.length - 1);
    }
  };

  const handleStoryTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartY === null) return;

    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchEndY - touchStartY;

    if (diff > 90) closeStory();

    setTouchStartY(null);
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

  const handleUnlockPrices = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isUnlocking) return;

    const cleanName = unlockName.trim();
    const cleanEmail = unlockEmail.trim();

    if (cleanName.length < 3) {
      alert("Παρακαλώ γράψτε ονοματεπώνυμο.");
      return;
    }

    if (!cleanEmail.includes("@") || !cleanEmail.includes(".")) {
      alert("Παρακαλώ γράψτε ένα σωστό email.");
      return;
    }

    setIsUnlocking(true);

    const formData = new FormData();
    formData.append("access_key", WEB3FORMS_KEY);
    formData.append("subject", "Ξεκλείδωμα τιμών από Kalogirou Team");
    formData.append("Name", cleanName);
    formData.append("Email", cleanEmail);

    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.log("Unlock email failed:", error);
    }

    localStorage.setItem("kalogirou_prices_unlocked", "yes");
    setPricesUnlocked(true);
    setIsUnlocking(false);
  };

  const sendEmail = async (form: HTMLFormElement) => {
    const formData = new FormData(form);

    formData.append("access_key", WEB3FORMS_KEY);
    formData.append("subject", "Νέα κράτηση από Kalogirou Team");
    formData.append("Event type", eventType);
    formData.append("Guests", guestRange);
    formData.append("Venue", venueType);
    formData.append("Orchestra", hasOrchestra ? `Ναι - ${orchestraRange} άτομα` : "Όχι");
    formData.append("Event date", selectedDate);
    formData.append("Selected services", selectedServices.length ? selectedServices.join(", ") : "Δεν επιλέχθηκαν");
    formData.append("Fountains", fountains > 0 ? `${fountains} τεμάχια - ${fountainsPrice}€` : "Όχι");
    formData.append("Orchestra setup price", `${orchestraPrice}€`);
    formData.append("Total price", pricesUnlocked ? `${totalPrice}€` : "Οι τιμές δεν είχαν ξεκλειδωθεί");

    try {
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });
    } catch (error) {
      console.log("Email failed:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!selectedDate) {
      alert("Παρακαλώ επιλέξτε ημερομηνία.");
      return;
    }

    if (getDateStatus(selectedDate) === "confirmed") {
      alert("Αυτή η ημερομηνία έχει κλειστεί.");
      return;
    }

    setIsSubmitting(true);

    const form = e.currentTarget;
    const supabaseSaved = await saveBookingToSupabase();

    if (!supabaseSaved) {
      setIsSubmitting(false);
      alert("Δεν αποθηκεύτηκε η κράτηση. Δοκίμασε ξανά.");
      return;
    }

    setSuccess(true);
    window.scrollTo({ top: 0, behavior: "smooth" });

    await sendEmail(form);
    await fetchBookingDates();

    setIsSubmitting(false);
  };

  if (success) {
    return (
      <main className="successPage">
        <div className="successBox">
          <p className="eyebrow">KALOGIROU TEAM</p>
          <h1>Ευχαριστούμε!</h1>
          <p>
            Ευχαριστούμε για την προτίμησή σας. Το αίτημα κράτησης καταχωρήθηκε
            επιτυχώς και θα επικοινωνήσουμε μαζί σας σύντομα.
          </p>
          <button onClick={() => setSuccess(false)} className="darkBtn">
            ← ΕΠΙΣΤΡΟΦΗ ΣΤΗΝ ΑΡΧΙΚΗ
          </button>
        </div>
        <Styles />
      </main>
    );
  }

  return (
    <main className="page">
      <nav className="nav">
        <button
          type="button"
          className="logo"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <img
            src="/logo.png"
            alt="Kalogirou Team"
            style={{ height: "180px", width: "auto", display: "block", marginTop: "18px" }}
          />
        </button>

        <div className="navLinks">
          <button onClick={scrollToCalculator}>Calculator</button>
          <button onClick={scrollToBooking} className="navCta">
            Booking
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="heroText">
          <p className="eyebrow">DJ • SOUND • LIGHTING • LIVE EVENTS</p>
          <h1>Luxury event sound experience.</h1>
          <p>
            Μουσική, ηχητικός εξοπλισμός, φωτισμός και ειδικά εφέ για γάμους,
            βαφτίσεις, parties, live και εταιρικές εκδηλώσεις.
          </p>

          <div className="heroButtons">
            <button onClick={scrollToBooking} className="darkBtn">
              ΚΛΕΙΣΕ EVENT
            </button>
            <button onClick={scrollToCalculator} className="lightBtn">
              ΔΕΣ ΥΠΗΡΕΣΙΕΣ
            </button>
          </div>

          <div className="socialRow">
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="socialBtn">
              Instagram
            </a>
            <a href={FACEBOOK_URL} target="_blank" rel="noopener noreferrer" className="socialBtn">
              Facebook
            </a>
            <span className="phoneText">Τηλ. {PHONE}</span>
            <a href={`tel:${PHONE}`} className="callMobile">
              Κλήση τώρα
            </a>
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

      <section className="storiesSection">
        <div className="storiesIntro">
          <p className="eyebrow">REAL EVENT MOMENTS</p>
          <h2>Ζήστε την ατμόσφαιρα των εκδηλώσεών μας.</h2>
          <p>
            Δείτε πραγματικές στιγμές από γάμους, χορούς, parties και επαγγελματικά setups.
          </p>
        </div>

        <div className="storyCircles">
          {storyCategories.map((story, index) => (
            <button key={story.id} type="button" className="storyCircleBtn" onClick={() => openStory(index)}>
              <span className="storyRing">
                <span className="storyIcon">{story.icon}</span>
              </span>
              <strong>{story.title}</strong>
            </button>
          ))}
        </div>
      </section>

      <section id="calculator" className="calculator">
        <div className="calculatorIntro">
          <p className="eyebrow">SMART EVENT CALCULATOR</p>
          <h2>Προσαρμόστε την εκδήλωσή σας.</h2>
          <p>
            Επιλέξτε τύπο εκδήλωσης, άτομα, χώρο και ανάγκες ήχου για να δείτε πιο σωστή ενδεικτική τιμή.
          </p>
        </div>

        <div className="calculatorPanel">
          <div className="optionGroup">
            <h3>Τύπος εκδήλωσης</h3>
            <div className="optionGrid">
              {eventTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setEventType(item)}
                  className={eventType === item ? "optionBtn active" : "optionBtn"}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="optionGroup">
            <h3>Πόσα άτομα περίπου;</h3>
            <div className="optionGrid">
              {guestRanges.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setGuestRange(item)}
                  className={guestRange === item ? "optionBtn active" : "optionBtn"}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="optionGroup">
            <h3>Χώρος εκδήλωσης</h3>
            <div className="optionGrid">
              {venueTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setVenueType(item)}
                  className={venueType === item ? "optionBtn active" : "optionBtn"}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="optionGroup">
            <h3>Θα υπάρχει ορχήστρα;</h3>
            <div className="optionGrid two">
              <button
                type="button"
                onClick={() => setHasOrchestra(false)}
                className={!hasOrchestra ? "optionBtn active" : "optionBtn"}
              >
                Όχι
              </button>
              <button
                type="button"
                onClick={() => setHasOrchestra(true)}
                className={hasOrchestra ? "optionBtn active" : "optionBtn"}
              >
                Ναι
              </button>
            </div>
          </div>

          {hasOrchestra && (
            <div className="optionGroup">
              <h3>Άτομα ορχήστρας</h3>
              <div className="optionGrid">
                {orchestraRanges.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setOrchestraRange(item)}
                    className={orchestraRange === item ? "optionBtn active" : "optionBtn"}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="services" className="section servicesSection">
        <p className="eyebrow">SERVICES & PRICING</p>
        <h2>Υπηρεσίες και ενδεικτικές τιμές.</h2>

        <div className="servicesGrid">
          {services.map((service) => (
            <button
              key={service.name}
              type="button"
              onClick={() => toggleService(service.name)}
              className={selectedServices.includes(service.name) ? "serviceCard active" : "serviceCard"}
            >
              <div>
                <h3>{service.name}</h3>
                <p>{service.desc}</p>
              </div>

              {pricesUnlocked ? (
                <strong>{service.price}€</strong>
              ) : (
                <span
                  className="lockedPrice"
                  onClick={(e) => {
                    e.stopPropagation();
                    document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Ξεκλείδωμα τιμής
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      <section id="pricing" className="pricing">
        <div>
          <p className="eyebrow">PRICE ESTIMATOR</p>
          <h2>{pricesUnlocked ? "Υπολόγισε ενδεικτικά το κόστος." : "Ξεκλειδώστε τις ενδεικτικές τιμές."}</h2>
          <p>
            {pricesUnlocked
              ? "Η τιμή αλλάζει ανάλογα με τον τύπο εκδήλωσης, τα άτομα, τον χώρο και τις υπηρεσίες που θα επιλέξετε."
              : "Συμπληρώστε ονοματεπώνυμο και email για να δείτε τιμές και σύνολο."}
          </p>
          <p className="priceNote">
            Η τιμή είναι ενδεικτική. Η τελική προσφορά επιβεβαιώνεται μετά την επικοινωνία.
          </p>
        </div>

        <div className="pricePanel">
          <div className="summaryBox">
            <span>{eventType}</span>
            <span>{guestRange} άτομα</span>
            <span>{venueType}</span>
            <span>{hasOrchestra ? `Ορχήστρα ${orchestraRange}` : "Χωρίς ορχήστρα"}</span>
          </div>

          {pricesUnlocked ? (
            <>
              <div className="line">
                <span>Επιλεγμένες υπηρεσίες</span>
                <strong>{selectedServices.length}</strong>
              </div>

              {hasOrchestra && (
                <div className="line">
                  <span>Setup ορχήστρας</span>
                  <strong>{orchestraPrice}€</strong>
                </div>
              )}

              <div className="fountainBox">
                <div>
                  <strong>Επιδαπέδια Συντριβάνια</strong>
                  <p>2 τεμ. = 80€ / από 4 και πάνω 35€ το τεμάχιο</p>
                </div>

                <div className="counter">
                  <button type="button" onClick={() => changeFountains("down")}>−</button>
                  <span>{fountains}</span>
                  <button type="button" onClick={() => changeFountains("up")}>+</button>
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

              <button type="button" onClick={scrollToBooking} className="darkBtn full">
                ΣΥΝΕΧΕΙΑ ΣΤΗΝ ΚΡΑΤΗΣΗ
              </button>
            </>
          ) : (
            <form onSubmit={handleUnlockPrices} className="unlockBox">
              <p className="unlockTitle">Ξεκλείδωμα ενδεικτικών τιμών</p>
              <p className="unlockText">
                Συμπληρώστε ονοματεπώνυμο και email για να εμφανιστούν οι υπηρεσίες με τις ενδεικτικές τιμές.
              </p>

              <input
                value={unlockName}
                onChange={(e) => setUnlockName(e.target.value)}
                name="Unlock name"
                placeholder="Ονοματεπώνυμο"
                required
              />

              <input
                value={unlockEmail}
                onChange={(e) => setUnlockEmail(e.target.value)}
                type="email"
                name="Unlock email"
                placeholder="Email"
                required
              />

              <button type="submit" className="darkBtn full" disabled={isUnlocking}>
                {isUnlocking ? "ΓΙΝΕΤΑΙ ΣΥΝΔΕΣΗ..." : "ΔΕΙΤΕ ΤΙΣ ΤΙΜΕΣ"}
              </button>

              <p className="unlockSmall">
                Τα στοιχεία χρησιμοποιούνται μόνο για επικοινωνία σχετικά με τις υπηρεσίες της Kalogirou Team.
              </p>
            </form>
          )}
        </div>
      </section>

      <section id="booking" className="booking">
        <div className="bookingIntro">
          <p className="eyebrow">BOOK YOUR DATE</p>
          <h2>Στείλε αίτημα κράτησης.</h2>
          <p>
            Διάλεξε ημερομηνία και στείλε τα στοιχεία σου. Οι πορτοκαλί ημερομηνίες
            έχουν ήδη εκκρεμές αίτημα.
          </p>
          <p className="priceNote">
            Τα στοιχεία της εκδήλωσης που επιλέξατε πιο πάνω θα σταλούν μαζί με το αίτημα.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <input name="Full name" placeholder="Ονοματεπώνυμο" required />
          <input name="Phone" placeholder="Τηλέφωνο" required />
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

          <input name="Location" placeholder="Περιοχή / Τοποθεσία εκδήλωσης" required />

          <textarea
            name="Notes"
            placeholder="Προαιρετικά: γράψτε επιπλέον πληροφορίες για την εκδήλωση, ειδικές απαιτήσεις ή κάτι που θέλετε να γνωρίζουμε."
            rows={6}
          />

          <p className="helpText">
            Η τελική τιμή επιβεβαιώνεται μετά την επικοινωνία και τις λεπτομέρειες της εκδήλωσης.
          </p>

          <div className="bookingTotal">
            <span>Σύνολο επιλογών</span>
            <strong>{pricesUnlocked ? `${totalPrice}€` : "Ξεκλειδώστε τις τιμές"}</strong>
          </div>

          <button type="submit" className="darkBtn full" disabled={isSubmitting}>
            {isSubmitting ? "ΑΠΟΣΤΟΛΗ..." : "ΑΠΟΣΤΟΛΗ ΑΙΤΗΜΑΤΟΣ"}
          </button>
        </form>
      </section>

      <footer>
        <strong>KALOGIROU TEAM</strong>
        <span>DJ • Sound • Lighting • Events</span>
        <span>Τηλ. {PHONE}</span>
      </footer>

      {activeStory && (
  <div
    className="storyModal"
    onTouchStart={(e) => setTouchStartY(e.touches[0].clientY)}
    onTouchEnd={handleStoryTouchEnd}
  >
    <video
      key={activeStory.videos[activeVideoIndex]}
      ref={videoRef}
      className="storyVideo"
      autoPlay
      playsInline
      preload="auto"
      onEnded={nextStoryVideo}
    >
      <source src={activeStory.videos[activeVideoIndex]} type="video/mp4" />
    </video>

    <div className="storyOverlay">
      <div className="storyProgress">
        {activeStory.videos.map((_, index) => (
          <span key={index} className={index <= activeVideoIndex ? "progressPart active" : "progressPart"} />
        ))}
      </div>

      <div className="storyHeader">
        <span>{activeStory.icon}</span>
        <strong>{activeStory.title}</strong>

        <button type="button" className="storyClose" onClick={closeStory}>
          ×
        </button>
      </div>
    </div>

    <button type="button" className="storyTap left" onClick={previousStoryVideo} />
    <button type="button" className="storyTap right" onClick={nextStoryVideo} />
  </div>
)}

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
        background: rgb(250, 248, 243);
      }

      button,
      input,
      textarea {
        font-family: inherit;
      }

      .page {
        width: 100%;
        max-width: 100vw;
        overflow-x: hidden;
        background: rgb(250, 248, 243);
        color: rgb(23, 23, 23);
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
        background: transparent;
        border: none;
        padding: 0;
        cursor: pointer;
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
        background: rgb(23, 23, 23);
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
        color: rgb(167, 122, 45);
        font-weight: 900;
        letter-spacing: 2px;
        font-size: 13px;
        margin: 0 0 16px;
        text-align: center;
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
      .calculatorIntro p,
      .storiesIntro p {
        font-size: 18px;
        line-height: 1.7;
        color: rgb(102, 102, 102);
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
        background: rgb(23, 23, 23);
        color: white;
        box-shadow: 0 18px 35px rgba(0, 0, 0, 0.18);
      }

      .darkBtn:disabled {
        opacity: 0.65;
        cursor: not-allowed;
      }

      .lightBtn {
        background: white;
        color: rgb(23, 23, 23);
        border: 1px solid rgb(221, 221, 221);
      }

      .full {
        width: 100%;
      }

      .socialRow {
        margin-top: 22px;
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
      }

      .socialBtn,
      .callMobile,
      .phoneText {
        text-decoration: none;
        border: 1px solid rgb(221, 221, 221);
        background: white;
        color: rgb(23, 23, 23);
        padding: 12px 16px;
        border-radius: 999px;
        font-weight: 900;
        font-size: 14px;
      }

      .callMobile {
        display: none;
        background: rgb(23, 23, 23);
        color: white;
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

      .storiesSection {
        padding: 70px 7vw 80px;
        background: rgb(250, 248, 243);
        text-align: center;
      }

      .storiesIntro {
        max-width: 780px;
        margin: 0 auto 34px;
      }

      .storiesIntro h2,
      .section h2,
      .pricing h2,
      .booking h2,
      .calculator h2 {
        font-size: clamp(34px, 5vw, 62px);
        letter-spacing: -2px;
        line-height: 1.05;
        margin: 0 0 22px;
      }

      .storyCircles {
        display: flex;
        justify-content: center;
        gap: 28px;
        flex-wrap: wrap;
      }

      .storyCircleBtn {
        border: none;
        background: transparent;
        cursor: pointer;
        display: grid;
        justify-items: center;
        gap: 10px;
        color: rgb(23, 23, 23);
        font-weight: 900;
      }

      .storyRing {
        width: 94px;
        height: 94px;
        border-radius: 50%;
        padding: 4px;
        background: linear-gradient(135deg, rgb(255, 242, 0), rgb(167, 122, 45), rgb(23, 23, 23));
        display: grid;
        place-items: center;
        box-shadow: 0 16px 35px rgba(0,0,0,0.16);
      }

      .storyIcon {
        width: 82px;
        height: 82px;
        border-radius: 50%;
        background: rgb(23, 23, 23);
        color: rgb(255, 242, 0);
        display: grid;
        place-items: center;
        font-size: 34px;
        border: 3px solid rgb(250, 248, 243);
      }

      .section,
      .pricing,
      .booking,
      .calculator {
        padding: 90px 7vw;
      }

      .calculator {
        background: white;
      }

      .calculatorIntro {
        max-width: 780px;
        margin-bottom: 34px;
      }

      .calculatorPanel {
        background: rgb(250, 248, 243);
        border: 1px solid rgb(238, 238, 238);
        border-radius: 34px;
        padding: 30px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.08);
        display: grid;
        gap: 26px;
      }

      .optionGroup h3 {
        margin: 0 0 14px;
        font-size: 20px;
      }

      .optionGrid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 12px;
      }

      .optionGrid.two {
        grid-template-columns: repeat(2, 1fr);
      }

      .optionBtn {
        border: 1px solid rgb(221, 221, 221);
        background: white;
        color: rgb(23, 23, 23);
        padding: 15px 16px;
        border-radius: 18px;
        font-weight: 900;
        cursor: pointer;
        transition: 0.2s;
      }

      .optionBtn.active {
        background: rgb(23, 23, 23);
        color: white;
        border-color: rgb(23, 23, 23);
      }

      .servicesGrid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
        gap: 18px;
      }

      .serviceCard {
        min-height: 230px;
        border: 1px solid rgb(238, 238, 238);
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
        border-color: rgb(198, 161, 91);
        background: rgb(255, 250, 240);
      }

      .serviceCard h3 {
        font-size: 24px;
        margin: 0 0 12px;
      }

      .serviceCard p {
        color: rgb(102, 102, 102);
        line-height: 1.55;
      }

      .serviceCard strong {
        font-size: 28px;
        color: rgb(167, 122, 45);
      }

      .lockedPrice {
        display: inline-block;
        margin-top: 20px;
        color: rgb(167, 122, 45);
        font-weight: 900;
        font-size: 15px;
        cursor: pointer;
      }

      .pricing {
        display: grid;
        grid-template-columns: 1fr 440px;
        gap: 50px;
        align-items: center;
        background: white;
      }

      .priceNote {
        margin-top: 18px;
        padding: 18px;
        border-radius: 20px;
        background: rgb(250, 248, 243);
        font-weight: 700;
      }

      .pricePanel,
      .unlockBox {
        background: rgb(250, 248, 243);
        border: 1px solid rgb(238, 238, 238);
        border-radius: 34px;
        padding: 30px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.08);
      }

      .summaryBox {
        display: grid;
        gap: 8px;
        padding: 16px;
        border-radius: 20px;
        background: white;
        margin-bottom: 18px;
        font-weight: 900;
        color: rgb(85, 85, 85);
      }

      .unlockBox {
        display: grid;
        gap: 14px;
      }

      .unlockTitle {
        margin: 0;
        font-size: 24px;
        font-weight: 900;
        color: rgb(23, 23, 23);
      }

      .unlockText,
      .unlockSmall {
        margin: 0;
        color: rgb(102, 102, 102);
      }

      .unlockSmall {
        font-size: 13px;
      }

      .unlockBox input {
        width: 100%;
        padding: 17px 18px;
        border-radius: 16px;
        border: 1px solid rgb(221, 221, 221);
        background: white;
        color: rgb(23, 23, 23);
        font-size: 16px;
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
        border-bottom: 1px solid rgb(232, 226, 216);
      }

      .fountainBox {
        display: grid;
        gap: 18px;
        padding: 24px 0;
        border-bottom: 1px solid rgb(232, 226, 216);
      }

      .fountainBox p {
        color: rgb(119, 119, 119);
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
        background: rgb(23, 23, 23);
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
      .form textarea {
        width: 100%;
        padding: 17px 18px;
        border-radius: 16px;
        border: 1px solid rgb(221, 221, 221);
        background: rgb(250, 250, 250);
        color: rgb(23, 23, 23);
        font-size: 16px;
      }

      .form textarea {
        resize: vertical;
        min-height: 150px;
        line-height: 1.6;
      }

      .helpText {
        margin: 0;
        color: rgb(119, 119, 119);
        font-size: 14px;
        line-height: 1.5;
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
        background: rgb(250, 248, 243);
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
        border-top: 1px solid rgb(232, 226, 216);
        color: rgb(85, 85, 85);
        flex-wrap: wrap;
      }

      .storyModal {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  background: black;
  z-index: 9999;
  overflow: hidden;
  touch-action: pan-y;
}

.storyVideo {
  position: absolute;
  inset: 0;
  width: 100vw;
  height: 100dvh;
  object-fit: contain;
  background: black;
  display: block;
}

.storyOverlay {
  position: absolute;
  top: env(safe-area-inset-top);
  left: 0;
  right: 0;
  z-index: 5;
  padding: 14px;
  color: white;
}

.storyProgress {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
}

.progressPart {
  height: 4px;
  flex: 1;
  background: rgba(255,255,255,0.25);
  border-radius: 999px;
}

.progressPart.active {
  background: white;
}

.storyHeader {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
}

.storyClose {
  margin-left: auto;
  width: 42px;
  height: 42px;
  border: none;
  border-radius: 50%;
  background: rgba(255,255,255,0.18);
  color: white;
  font-size: 30px;
  cursor: pointer;
  display: grid;
  place-items: center;
}

.storyTap {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 35%;
  border: none;
  background: transparent;
  cursor: pointer;
  z-index: 4;
}

.storyTap.left {
  left: 0;
}

.storyTap.right {
  right: 0;
}

      .successPage {
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: rgb(250, 248, 243);
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
        color: rgb(102, 102, 102);
        font-size: 20px;
        line-height: 1.6;
      }

      @media (max-width: 900px) {
         
        .storyClose {
        display: none;
        }
        .nav {
          height: 66px;
          padding: 0 18px;
        }

        .logo img {
          height: 110px !important;
          margin-top: 12px !important;
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
        .calculatorIntro p,
        .storiesIntro p {
          font-size: 16px;
        }

        .heroButtons,
        .socialRow {
          display: grid;
          grid-template-columns: 1fr;
        }

        .darkBtn,
        .lightBtn,
        .socialBtn,
        .callMobile,
        .phoneText {
          width: 100%;
          text-align: center;
        }

        .callMobile {
          display: block;
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
        .booking,
        .calculator,
        .storiesSection {
          padding: 66px 18px;
        }

        .storiesIntro h2,
        .section h2,
        .pricing h2,
        .booking h2,
        .calculator h2 {
          font-size: 38px;
          letter-spacing: -1.5px;
        }

        .storyCircles {
          gap: 18px;
        }

        .storyRing {
          width: 82px;
          height: 82px;
        }

        .storyIcon {
          width: 70px;
          height: 70px;
          font-size: 28px;
        }

        .servicesGrid {
          grid-template-columns: 1fr;
        }

        .serviceCard {
          min-height: 190px;
          border-radius: 24px;
          padding: 24px;
        }

        .pricing {
          grid-template-columns: 1fr;
          gap: 28px;
        }

        .pricePanel,
        .calculatorPanel,
        .unlockBox {
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

        .storiesIntro h2,
        .section h2,
        .pricing h2,
        .booking h2,
        .calculator h2 {
          font-size: 34px;
        }

        .heroImage {
          height: 360px;
          min-height: 360px;
        }

        .storyCircles {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
        }

        .storyRing {
          width: 70px;
          height: 70px;
        }

        .storyIcon {
          width: 60px;
          height: 60px;
          font-size: 24px;
        }

        .storyCircleBtn strong {
          font-size: 12px;
        }

        .storyHeader small {
          display: none;
        }
      }
    `}</style>
  );
}