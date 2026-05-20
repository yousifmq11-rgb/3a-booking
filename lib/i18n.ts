export type Lang = "fi" | "en";

export const translations = {
  fi: {
    // ── Nav / Header
    shopName: "3A Service",
    shopSubtitle: "Autokorjaamo Espoossa",
    address: "Sillankorva 8, 02300 Espoo",
    shopPhone: "+358 44 977 3677",

    // ── Steps
    steps: ["Palvelu", "Päivä & Aika", "Tiedot", "Valmis"],
    stepDescriptions: [
      "Valitse palvelu",
      "Valitse päivä ja aika",
      "Täytä yhteystiedot",
      "Varaus vahvistettu",
    ],

    // ── Step 1 — Service
    chooseService: "Valitse palvelu",
    chooseServiceSub: "Valitse haluamasi palvelu alta",
    popular: "SUOSITTU",
    duration: "Kesto",
    priceOnRequest: "Pyydä tarjous",
    free: "Ilmainen",
    selectService: "Valitse tämä palvelu",
    selected: "Valittu",
    min: "min",

    // ── Categories
    categoryMaintenance: "Huolto",
    categoryTires: "Renkaat",
    categoryBrakes: "Jarrut & Jousitus",
    categoryEngine: "Moottorin korjaukset",
    categoryElectric: "Sähkö & Diagnostiikka",
    categoryExtra: "Lisäpalvelut",

    // ── Step 2 — Date & Time
    chooseDate: "Valitse päivä",
    chooseDateSub: "Valitse sopiva päivä kalenterista",
    chooseTime: "Valitse aika",
    chooseTimeSub: "Valitse sopiva aika",
    availableSlots: "vapaata aikaa",
    noSlots: "Ei vapaita aikoja tälle päivälle",
    bookedSlot: "Varattu",
    weekdays: ["Ma", "Ti", "Ke", "To", "Pe", "La", "Su"],
    months: [
      "Tammikuu", "Helmikuu", "Maaliskuu", "Huhtikuu",
      "Toukokuu", "Kesäkuu", "Heinäkuu", "Elokuu",
      "Syyskuu", "Lokakuu", "Marraskuu", "Joulukuu",
    ],
    durationWarning: (h: string) => `Tämä palvelu kestää ${h} — varaa riittävästi aikaa`,
    loadingSlots: "Haetaan aikoja...",

    // ── Step 3 — Customer
    yourDetails: "Yhteystietosi",
    yourDetailsSub: "Täytä alla olevat tiedot",
    firstName: "Etunimi",
    lastName: "Sukunimi",
    phone: "+358 puhelinnumero",
    phonePlaceholder: "0441234567",
    email: "Sähköposti (valinnainen)",
    emailPlaceholder: "sinä@email.fi",
    licensePlate: "Rekisterinumero",
    licensePlatePlaceholder: "ABC-123",
    carMakeModel: "Auton merkki ja malli (valinnainen)",
    carMakeModelPlaceholder: "esim. Toyota Corolla 2019",
    mileage: "Kilometrit (valinnainen)",
    mileagePlaceholder: "esim. 85000",
    notes: "Lisätietoja (valinnainen)",
    notesPlaceholder: "Kerro lisää autosta tai toiveistasi...",
    smsReminder: "Haluan muistutuksen 24h ennen WhatsAppilla",
    acceptTerms: "Hyväksyn palveluehdot",
    termsRequired: "Sinun täytyy hyväksyä palveluehdot",
    confirmBooking: "Vahvista varaus",
    bookingInProgress: "Varataan...",
    summaryTitle: "Varauksen yhteenveto",
    bookingError: "Varauksen tekeminen epäonnistui. Yritä uudelleen.",

    // ── Step 4 — Success
    bookingConfirmed: "Varaus vahvistettu!",
    bookingConfirmedSub: "Varauksesi on vastaanotettu onnistuneesti.",
    referenceNumber: "Varaustunnus",
    whatsappMessage: "Lähetämme vahvistuksen WhatsAppilla pian.",
    whatsappButton: "Avaa WhatsApp",
    addToCalendar: "Lisää kalenteriin",
    backToHome: "Takaisin etusivulle",
    newBooking: "Tee uusi varaus",

    // ── Booking Summary
    service: "Palvelu",
    date: "Päivä",
    time: "Aika",
    price: "Hinta",
    location: "Sijainti",
    durationLabel: "Kesto",

    // ── Validation
    required: "Pakollinen kenttä",
    invalidPhone: "Tarkista puhelinnumero",
    invalidEmail: "Tarkista sähköpostiosoite",

    // ── Misc
    loading: "Ladataan...",
    error: "Virhe",
    retry: "Yritä uudelleen",
    back: "Takaisin",
    next: "Seuraava",
    continueBtn: "Jatka",
  },

  en: {
    shopName: "3A Service",
    shopSubtitle: "Auto Repair Shop in Espoo",
    address: "Sillankorva 8, 02300 Espoo",
    shopPhone: "+358 44 977 3677",

    steps: ["Service", "Date & Time", "Details", "Done"],
    stepDescriptions: [
      "Choose a service",
      "Choose date & time",
      "Fill in your details",
      "Booking confirmed",
    ],

    chooseService: "Choose a service",
    chooseServiceSub: "Select the service you need below",
    popular: "POPULAR",
    duration: "Duration",
    priceOnRequest: "Quote on request",
    free: "Free",
    selectService: "Select this service",
    selected: "Selected",
    min: "min",

    categoryMaintenance: "Maintenance",
    categoryTires: "Tires",
    categoryBrakes: "Brakes & Suspension",
    categoryEngine: "Engine Repairs",
    categoryElectric: "Electrical & Diagnostics",
    categoryExtra: "Additional Services",

    chooseDate: "Choose a date",
    chooseDateSub: "Pick a suitable day from the calendar",
    chooseTime: "Choose a time",
    chooseTimeSub: "Select a suitable time",
    availableSlots: "available slots",
    noSlots: "No available times for this date",
    bookedSlot: "Booked",
    weekdays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    months: [
      "January", "February", "March", "April",
      "May", "June", "July", "August",
      "September", "October", "November", "December",
    ],
    durationWarning: (h: string) => `This service takes ${h} — please allow sufficient time`,
    loadingSlots: "Loading times...",

    yourDetails: "Your details",
    yourDetailsSub: "Fill in the form below",
    firstName: "First name",
    lastName: "Last name",
    phone: "+358 phone number",
    phonePlaceholder: "0441234567",
    email: "Email (optional)",
    emailPlaceholder: "you@email.com",
    licensePlate: "License plate",
    licensePlatePlaceholder: "ABC-123",
    carMakeModel: "Car make & model (optional)",
    carMakeModelPlaceholder: "e.g. Toyota Corolla 2019",
    mileage: "Mileage (optional)",
    mileagePlaceholder: "e.g. 85000",
    notes: "Additional notes (optional)",
    notesPlaceholder: "Tell us more about your car or requests...",
    smsReminder: "I want a WhatsApp reminder 24h before",
    acceptTerms: "I accept the terms of service",
    termsRequired: "You must accept the terms of service",
    confirmBooking: "Confirm booking",
    bookingInProgress: "Booking...",
    summaryTitle: "Booking summary",
    bookingError: "Booking failed. Please try again.",

    bookingConfirmed: "Booking confirmed!",
    bookingConfirmedSub: "Your booking has been received successfully.",
    referenceNumber: "Reference number",
    whatsappMessage: "We will send a confirmation via WhatsApp shortly.",
    whatsappButton: "Open WhatsApp",
    addToCalendar: "Add to calendar",
    backToHome: "Back to home",
    newBooking: "Make a new booking",

    service: "Service",
    date: "Date",
    time: "Time",
    price: "Price",
    location: "Location",
    durationLabel: "Duration",

    required: "Required field",
    invalidPhone: "Check the phone number",
    invalidEmail: "Check the email address",

    loading: "Loading...",
    error: "Error",
    retry: "Try again",
    back: "Back",
    next: "Next",
    continueBtn: "Continue",
  },
} as const;

export type Translations = typeof translations.fi;

export function t(lang: Lang): Translations {
  return translations[lang] as unknown as Translations;
}
