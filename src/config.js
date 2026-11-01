export const shop = {
  name: "Amit Flower Diaries",
  city: "Gurgaon, Haryana",
  whatsapp: "917428908002",
  phone: "+91 7428908002",
  address: "Sector 14 Market, Gurgaon",
  hours: "Open 24 hours, all week",
};

// WhatsApp ka link banata hai, message pehle se likha aata hai
export const waLink = (text) =>
  `https://wa.me/${shop.whatsapp}?text=${encodeURIComponent(text)}`;