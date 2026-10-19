import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const geminiKey = process.env.GEMINI_API_KEY;
const youtubeKey = process.env.YOUTUBE_API_KEY;

if (!geminiKey) {
  throw new Error("GEMINI_API_KEY is not configured");
}

const ARTICLES_DIR = "src/content/articles";
fs.mkdirSync(ARTICLES_DIR, { recursive: true });

// ============================================================
// 1. LARGE TOPIC REGISTRY — 60+ UNIQUE BEAUTY TOPICS
// ============================================================
const TOPIC_REGISTRY = [
  // === HAIRCUTS ===
  {
    topic: "Korean Butterfly Layered Haircut Trends 2026",
    category: "Haircuts",
    searchKey: "Butterfly haircut tutorial step by step 2026",
    heroPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "The Hush Cut: Soft Korean Feathered Layers 2026",
    category: "Haircuts",
    searchKey: "Korean hush cut tutorial styling feathered layers",
    heroPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "The Clavicut: Collarbone-Skimming Lob Haircut 2026",
    category: "Haircuts",
    searchKey: "Clavicut collarbone lob haircut tutorial styling",
    heroPhoto: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "Modern Shag Haircut for Naturally Curly Hair 2026",
    category: "Haircuts",
    searchKey: "Curly shag haircut styling full tutorial 2026",
    heroPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Ayo Ogunseinde on Unsplash"
  },
  {
    topic: "Textured Lob with Curtain Bangs: Complete Guide 2026",
    category: "Haircuts",
    searchKey: "textured lob curtain bangs haircut tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Ali Pazani on Unsplash"
  },
  {
    topic: "Octopus Haircut: The Layered Volume Trend 2026",
    category: "Haircuts",
    searchKey: "Octopus haircut tutorial layers volume styling",
    heroPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Reza Mehrad on Unsplash"
  },
  {
    topic: "Asymmetrical Bob: Bold Edge Haircut Guide 2026",
    category: "Haircuts",
    searchKey: "Asymmetrical bob haircut tutorial step by step",
    heroPhoto: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Aw Creative on Unsplash"
  },
  {
    topic: "Long Layers with Face-Framing Highlights 2026",
    category: "Haircuts",
    searchKey: "Long layers face framing highlights haircut tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "Curtain Bangs Styling Guide for All Hair Types 2026",
    category: "Haircuts",
    searchKey: "Curtain bangs styling tutorial all hair types",
    heroPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Ali Pazani on Unsplash"
  },
  {
    topic: "The Rachel Cut: 90s Comeback Layers for 2026",
    category: "Haircuts",
    searchKey: "Rachel cut 90s layers haircut tutorial modern",
    heroPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Sarah Comeau on Unsplash"
  },

  // === HAIRSTYLES ===
  {
    topic: "Heatless Silk Ribbon Waves & Overnight Styling 2026",
    category: "Hairstyles",
    searchKey: "Heatless curls robe belt tutorial overnight waves",
    heroPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Clean Girl Slicked-Back Bun Styling Routine 2026",
    category: "Hairstyles",
    searchKey: "Clean girl slick back sleek bun tutorial styling",
    heroPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "The Barrel Wave Blowout: Retro Glam Tutorial 2026",
    category: "Hairstyles",
    searchKey: "Barrel wave blowout retro glam hair tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "Braided Updo Masterclass for Weddings & Events 2026",
    category: "Hairstyles",
    searchKey: "Braided updo wedding tutorial step by step",
    heroPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Ayo Ogunseinde on Unsplash"
  },
  {
    topic: "Coquette Hair Bows & Ribbon Styling Trends 2026",
    category: "Hairstyles",
    searchKey: "Coquette hair bow ribbon styling tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Reza Mehrad on Unsplash"
  },
  {
    topic: "Mermaid Waves: Long Hair Styling Masterclass 2026",
    category: "Hairstyles",
    searchKey: "Mermaid waves long hair tutorial curling iron",
    heroPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Guilherme Petri on Unsplash"
  },

  // === HAIR COLOR ===
  {
    topic: "Honey Vanilla & Buttercream Blonde Balayage 2026",
    category: "Hair Color",
    searchKey: "Honey blonde balayage transformation masterclass tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Guilherme Petri on Unsplash"
  },
  {
    topic: "Warm Copper & Peach Fuzz Hair Color Trends 2026",
    category: "Hair Color",
    searchKey: "Copper peach hair color dying tutorial formula 2026",
    heroPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Strawberry Blonde: The Dreamy Color Formula 2026",
    category: "Hair Color",
    searchKey: "Strawberry blonde hair color formula tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Aw Creative on Unsplash"
  },
  {
    topic: "Brunette Money Piece Highlights: Face Framing 2026",
    category: "Hair Color",
    searchKey: "Money piece highlights brunette face framing tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Jet Black & Midnight Hair Color Trend Guide 2026",
    category: "Hair Color",
    searchKey: "Jet black midnight hair color tutorial shiny",
    heroPhoto: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Reza Mehrad on Unsplash"
  },
  {
    topic: "Dimensional Brunette Gloss & Toning Guide 2026",
    category: "Hair Color",
    searchKey: "Brunette gloss toning hair color tutorial salon",
    heroPhoto: "https://images.unsplash.com/photo-1492106087820-71f1a00d2b11?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },

  // === NAIL ART ===
  {
    topic: "Glazed Donut Chrome Nails Style Guide 2026",
    category: "Nail Art",
    searchKey: "Glazed donut chrome nails tutorial hailey bieber",
    heroPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Giorgio Trovato on Unsplash"
  },
  {
    topic: "Milky Soap Nails: The Clean Minimalist Look 2026",
    category: "Nail Styles",
    searchKey: "Soap nails milky manicure clean girl tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo on Unsplash (Free Commercial License)"
  },
  {
    topic: "Nail Stamping & Foil Art Techniques 2026",
    category: "Nail Art",
    searchKey: "Nail stamping foil art technique tutorial step by step",
    heroPhoto: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo on Unsplash (Free Commercial License)"
  },
  {
    topic: "Jelly Nails & Translucent Gel Manicure 2026",
    category: "Nail Art",
    searchKey: "Jelly nails translucent gel manicure tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Element5 Digital on Unsplash"
  },
  {
    topic: "Negative Space Geometric Nail Art Designs 2026",
    category: "Nail Art",
    searchKey: "Negative space geometric nail art tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Giorgio Trovato on Unsplash"
  },
  {
    topic: "Aqua & Ocean-Inspired Nail Art Masterclass 2026",
    category: "Nail Art",
    searchKey: "Ocean aqua nail art tutorial step by step",
    heroPhoto: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo on Unsplash (Free Commercial License)"
  },

  // === MAKEUP & BEAUTY ===
  {
    topic: "Glass Skin Barrier Repair Skincare Routine 2026",
    category: "Beauty Trends",
    searchKey: "Korean glass skin routine barrier repair tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Raphael Lovaski on Unsplash"
  },
  {
    topic: "Fluffy Feathered Brows & Clean Beauty Guide 2026",
    category: "Beauty Trends",
    searchKey: "Fluffy laminated brows tutorial masterclass 2026",
    heroPhoto: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "Dewy Blush & Luminous Glow Makeup Tutorial 2026",
    category: "Beauty Trends",
    searchKey: "Dewy skin blush glow makeup tutorial step by step",
    heroPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Smoky Eye Mastery: Classic to Modern 2026",
    category: "Beauty Trends",
    searchKey: "Smoky eye makeup tutorial step by step beginner",
    heroPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "Skin Tint & Tinted Moisturizer: No-Makeup Look 2026",
    category: "Beauty Trends",
    searchKey: "Skin tint no makeup look tutorial natural finish",
    heroPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Raphael Lovaski on Unsplash"
  },
  {
    topic: "Cherry Red Lip Trend: Classic & Modern Formulas 2026",
    category: "Beauty Trends",
    searchKey: "Cherry red lip tutorial classic bold makeup",
    heroPhoto: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "Contour & Sculpt: Full Face Tutorial 2026",
    category: "Beauty Trends",
    searchKey: "Contouring sculpting face makeup tutorial full",
    heroPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Sunscreen & SPF Skincare Routine for 2026",
    category: "Beauty Trends",
    searchKey: "Sunscreen skincare routine SPF daytime guide tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Raphael Lovaski on Unsplash"
  },
  {
    topic: "Eyelash Extension Styles & Aftercare Guide 2026",
    category: "Beauty Trends",
    searchKey: "Eyelash extensions styles aftercare tutorial guide",
    heroPhoto: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },
  {
    topic: "Retinol & Vitamin C Skincare Layering Guide 2026",
    category: "Beauty Trends",
    searchKey: "Retinol vitamin C skincare layering guide tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Raphael Lovaski on Unsplash"
  },
  {
    topic: "Blush Draping Technique: Editorial Makeup 2026",
    category: "Beauty Trends",
    searchKey: "Blush draping editorial makeup technique tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Laminated Brow Soap Styling Tutorial 2026",
    category: "Beauty Trends",
    searchKey: "Soap brow lamination tutorial at home styling",
    heroPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Tamara Bellis on Unsplash"
  },

  // === HAIR CARE ===
  {
    topic: "Protein Treatment & Bond Repair for Damaged Hair 2026",
    category: "Hair Care",
    searchKey: "Protein treatment bond repair damaged hair tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Scalp Care & Hair Growth Routine 2026",
    category: "Hair Care",
    searchKey: "Scalp care hair growth routine tutorial massage",
    heroPhoto: "https://images.unsplash.com/photo-1505502416-9de2f1eef3bc?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo on Unsplash (Free Commercial License)"
  },
  {
    topic: "Olaplex vs K18: Hair Repair Treatment Comparison 2026",
    category: "Hair Care",
    searchKey: "Olaplex K18 hair repair bond treatment comparison",
    heroPhoto: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Curly Girl Method: Defining Curls for 2026",
    category: "Hair Care",
    searchKey: "Curly girl method curl definition tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Ayo Ogunseinde on Unsplash"
  },
  {
    topic: "Hair Oiling Rituals: Ayurvedic Beauty Guide 2026",
    category: "Hair Care",
    searchKey: "Hair oiling Ayurvedic ritual tutorial scalp massage",
    heroPhoto: "https://images.unsplash.com/photo-1505502416-9de2f1eef3bc?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo on Unsplash (Free Commercial License)"
  },

  // === NAIL CARE ===
  {
    topic: "At-Home Gel Manicure: Complete Beginner Guide 2026",
    category: "Nail Styles",
    searchKey: "At home gel manicure tutorial step by step beginner",
    heroPhoto: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo on Unsplash (Free Commercial License)"
  },
  {
    topic: "Nail Strengthening & Cuticle Care Routine 2026",
    category: "Nail Styles",
    searchKey: "Nail strengthening cuticle care routine tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Element5 Digital on Unsplash"
  },
  {
    topic: "Press-On Nails: Pro Application & Design 2026",
    category: "Nail Styles",
    searchKey: "Press on nails application professional tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Giorgio Trovato on Unsplash"
  },
  {
    topic: "Acrylic vs Dip Powder Nails: Full Comparison 2026",
    category: "Nail Styles",
    searchKey: "Acrylic vs dip powder nails comparison tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1519014816548-bf5fe059798b?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo on Unsplash (Free Commercial License)"
  },

  // === WELLNESS & LIFESTYLE ===
  {
    topic: "Gua Sha & Facial Massage: Anti-Aging Ritual 2026",
    category: "Beauty Trends",
    searchKey: "Gua sha facial massage anti aging tutorial ritual",
    heroPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Raphael Lovaski on Unsplash"
  },
  {
    topic: "Facial Yoga & Lymphatic Drainage Techniques 2026",
    category: "Beauty Trends",
    searchKey: "Facial yoga lymphatic drainage technique tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Valerie Elash on Unsplash"
  },
  {
    topic: "Hyaluronic Acid Serum Guide for All Skin Types 2026",
    category: "Beauty Trends",
    searchKey: "Hyaluronic acid serum tutorial all skin types guide",
    heroPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Raphael Lovaski on Unsplash"
  },
  {
    topic: "Night Skin Routine: Repair & Regeneration 2026",
    category: "Beauty Trends",
    searchKey: "Night skin routine repair regeneration tutorial",
    heroPhoto: "https://images.unsplash.com/photo-1512290900672-1f0230722391?auto=format&fit=crop&w=1200&h=675&q=85",
    detailPhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&h=675&q=85",
    photoCredit: "Photo by Raphael Lovaski on Unsplash"
  }
];

// ============================================================
// 2. SMART TOPIC SELECTION — Avoids duplicates across registry
// ============================================================
function selectUniqueTopic() {
  const existingFiles = fs.existsSync(ARTICLES_DIR)
    ? fs.readdirSync(ARTICLES_DIR).map((f) => f.toLowerCase().replace(/\.md$/, ""))
    : [];

  const available = TOPIC_REGISTRY.filter((item) => {
    const topicSlug = item.topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    // Check if any existing file contains a significant overlap
    return !existingFiles.some((f) => {
      const words = topicSlug.split("-").filter((w) => w.length > 4);
      const matchCount = words.filter((w) => f.includes(w)).length;
      return matchCount >= 2; // Only skip if 2+ significant words match
    });
  });

  const pool = available.length > 0 ? available : TOPIC_REGISTRY;
  // Use crypto for better randomness
  const randomIndex = crypto.randomInt(pool.length);
  return pool[randomIndex];
}

// ============================================================
// 3. GEMINI API CLIENT (Retries + Fallbacks)
// ============================================================
const GEMINI_MODELS = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-flash"];
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function callGemini({ model, prompt, useSearch = false, jsonMode = false }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }]
  };

  // NOTE: jsonMode and useSearch are mutually exclusive
  if (jsonMode && !useSearch) {
    body.generationConfig = {
      responseMimeType: "application/json",
      temperature: 0.7,
      maxOutputTokens: 8192
    };
  }

  if (useSearch) {
    body.tools = [{ google_search: {} }];
    body.generationConfig = { temperature: 0.3 };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": geminiKey
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(120000) // 2 minute timeout
  });

  const text = await response.text();
  if (!response.ok) {
    let msg = text;
    try {
      const json = JSON.parse(text);
      msg = json?.error?.message || text;
    } catch {}
    const err = new Error(`Gemini API error (${response.status}): ${msg}`);
    err.status = response.status;
    throw err;
  }

  const data = JSON.parse(text);
  const output = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("").trim();
  if (!output) throw new Error("Empty response from Gemini");
  return output;
}

async function callGeminiSafe({ prompt, useSearch = false, jsonMode = false }) {
  let lastError = null;
  for (const model of GEMINI_MODELS) {
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[Gemini] Trying model: ${model} | Attempt ${attempt}/${MAX_RETRIES}`);
        return await callGemini({ model, prompt, useSearch, jsonMode });
      } catch (err) {
        lastError = err;
        console.warn(`[Gemini] ⚠️ Failed (${model}, attempt ${attempt}): ${err.message}`);
        if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS);
      }
    }
  }
  throw new Error(`❌ All Gemini models failed. Last error: ${lastError?.message}`);
}

function cleanJson(text) {
  let val = String(text || "").trim();
  val = val.replace(/^```json\s*/i, "").replace(/^```\s*/i, "").replace(/\s*```$/i, "").trim();
  const firstBrace = val.indexOf("{");
  const lastBrace = val.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    val = val.slice(firstBrace, lastBrace + 1);
  }
  return val.trim();
}

function robustJsonParse(text) {
  const cleaned = cleanJson(text);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    try {
      const sanitized = cleaned
        .replace(/[\u0000-\u0009\u000B-\u001F]+/g, " ")
        .replace(/\r\n/g, "\\n")
        .replace(/\r/g, "\\n");
      return JSON.parse(sanitized);
    } catch (err2) {
      console.warn("⚠️ JSON parse failed — extracting fields safely.");
      const titleM = cleaned.match(/"title"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      const descM = cleaned.match(/"description"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      const excerptM = cleaned.match(/"excerpt"\s*:\s*"((?:[^"\\]|\\.)*)"/);
      const contentM = cleaned.match(/"content"\s*:\s*"((?:[^"\\]|\\.)*)"/s);
      
      let extractedContent = "";
      if (contentM) {
        extractedContent = contentM[1].replace(/\\n/g, "\n").replace(/\\"/g, '"');
      } else {
        extractedContent = cleaned
          .replace(/^\{?\s*"title":.*?"content":\s*"/s, "")
          .replace(/",\s*"faq":.*$/s, "")
          .replace(/\\n/g, "\n");
      }

      return {
        title: titleM ? titleM[1].replace(/\\"/g, '"') : "",
        slug: "",
        description: descM ? descM[1].replace(/\\"/g, '"') : "",
        excerpt: excerptM ? excerptM[1].replace(/\\"/g, '"') : "",
        keywords: [],
        content: extractedContent.trim(),
        faq: []
      };
    }
  }
}

// ============================================================
// 4. YOUTUBE TUTORIAL FETCHER
// ============================================================
async function fetchYouTubeTutorial(searchKey) {
  if (!youtubeKey) {
    console.log("[YouTube] No YOUTUBE_API_KEY. Skipping.");
    return [];
  }

  try {
    const url = new URL("https://www.googleapis.com/youtube/v3/search");
    url.searchParams.set("part", "snippet");
    url.searchParams.set("q", searchKey);
    url.searchParams.set("type", "video");
    url.searchParams.set("videoDuration", "medium");
    url.searchParams.set("maxResults", "2");
    url.searchParams.set("order", "relevance");
    url.searchParams.set("videoEmbeddable", "true");
    url.searchParams.set("safeSearch", "strict");
    url.searchParams.set("key", youtubeKey);

    const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
    if (!res.ok) {
      console.warn(`[YouTube] Status ${res.status}. Continuing without videos.`);
      return [];
    }

    const data = await res.json();
    let videos = (data.items || [])
      .filter((item) => item?.id?.videoId)
      .map((item) => ({
        title: item.snippet.title.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
        videoId: item.id.videoId,
        channel: item.snippet.channelTitle
      }));

    // Fallback: try without duration filter
    if (videos.length === 0) {
      url.searchParams.delete("videoDuration");
      url.searchParams.set("maxResults", "1");
      const fallbackRes = await fetch(url, { signal: AbortSignal.timeout(10000) });
      if (fallbackRes.ok) {
        const fbData = await fallbackRes.json();
        videos = (fbData.items || [])
          .filter((item) => item?.id?.videoId)
          .map((item) => ({
            title: item.snippet.title.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&'),
            videoId: item.id.videoId,
            channel: item.snippet.channelTitle
          }));
      }
    }

    console.log(`[YouTube] Found ${videos.length} video(s)`);
    return videos;
  } catch (err) {
    console.warn(`[YouTube] Error: ${err.message}`);
    return [];
  }
}

// ============================================================
// 5. GENERATE ONE COMPLETE ARTICLE
// ============================================================
async function generateSingleArticle() {
  const topicItem = selectUniqueTopic();
  console.log(`\n${"=".repeat(50)}`);
  console.log(`📌 Topic: ${topicItem.topic}`);
  console.log(`📂 Category: ${topicItem.category}`);
  console.log(`${"=".repeat(50)}`);

  // STEP 1: Research (Google grounded)
  const researchPrompt = `You are a senior beauty journalist and SEO specialist.
Research and synthesize top insights about: "${topicItem.topic}" for 2026.

Provide a detailed structured summary covering:
- What makes this trend unique and dominant in 2026 (runway, social media, salon)
- Specific techniques, formulas, cutting angles, or product ingredients
- Face shape and hair/skin type suitability analysis
- Step-by-step technique breakdown (minimum 5 detailed steps)
- Professional secrets and common mistakes to avoid
- Maintenance schedule and at-home aftercare

Be specific, authoritative, and detailed. Focus on practical expert-level content.`;

  let researchSummary = "";
  try {
    researchSummary = await callGeminiSafe({ prompt: researchPrompt, useSearch: true, jsonMode: false });
    console.log(`✅ Research completed (${researchSummary.split(" ").length} words)`);
  } catch (err) {
    console.warn(`⚠️ Research failed: ${err.message}. Using fallback.`);
    researchSummary = `Comprehensive 2026 beauty expert insights for: ${topicItem.topic}.`;
  }

  // STEP 2: YouTube videos
  const videos = await fetchYouTubeTutorial(topicItem.searchKey);
  const featuredVideo = videos[0] || null;
  console.log(`🎬 Video: ${featuredVideo ? featuredVideo.title : "None found"}`);

  // STEP 3: Write the full article
  const articlePrompt = `You are the Editor-in-Chief of "BeautyTrend Daily" — an elite beauty magazine.
Write a COMPREHENSIVE, authoritative editorial masterclass on: "${topicItem.topic}" (2026).

RESEARCH CONTEXT TO USE:
${researchSummary}

STRICT REQUIREMENTS:
1. WORD COUNT: Minimum 1,300 words of rich, detailed, human-quality prose. NO shortcuts.
2. USE THESE EXACT H2 SECTIONS in this order:
   - ## The 2026 Trend Evolution & Aesthetic Allure
   - ## Anatomy & Key Characteristics
   - ## Step-by-Step Styling Masterclass
   - ## Face Shape & Hair Texture Suitability
   - ## Essential Tools & Product Recommendations
   - ## Salon Consultation: What to Tell Your Stylist
   - ## At-Home Maintenance & Longevity Routine
3. Do NOT include the article title as H1 inside the content field
4. Start content with an engaging 2-sentence magazine intro paragraph
5. Write 5 detailed FAQ entries relevant to the topic
6. Content must be 100% unique, SEO-optimized, and Google-friendly

RETURN ONLY THIS EXACT JSON (no other text before or after):
{
  "title": "High-CTR SEO headline for this topic (2026)",
  "slug": "url-friendly-hyphenated-slug",
  "description": "Compelling meta description under 160 characters",
  "excerpt": "Two-sentence engaging preview teaser",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6"],
  "content": "Full 1300+ word markdown content starting with opening paragraph (NO H1 title)...",
  "faq": [
    {"question": "FAQ Question 1?", "answer": "Detailed answer 1..."},
    {"question": "FAQ Question 2?", "answer": "Detailed answer 2..."},
    {"question": "FAQ Question 3?", "answer": "Detailed answer 3..."},
    {"question": "FAQ Question 4?", "answer": "Detailed answer 4..."},
    {"question": "FAQ Question 5?", "answer": "Detailed answer 5..."}
  ]
}`;

  const articleText = await callGeminiSafe({ prompt: articlePrompt, useSearch: false, jsonMode: true });
  const article = robustJsonParse(articleText);

  const now = new Date().toISOString().split("T")[0];
  const slug = (article.slug || topicItem.topic.toLowerCase().replace(/[^a-z0-9]+/g, "-")).replace(/^-|-$/g, "");
  const filePath = path.join(ARTICLES_DIR, `${slug}.md`);

  // Clean content — remove accidental H1 at top
  let cleanContent = String(article.content || "").trim();
  cleanContent = cleanContent.replace(/^#+\s+[^\n]+\n+/, "").trim();

  // INJECT VIDEO after Step-by-Step section
  if (featuredVideo) {
    const videoBlock = `\n\n<div class="in-article-video">
  <div class="video-label">📺 Watch: ${featuredVideo.title}</div>
  <div class="video-responsive-frame">
    <iframe src="https://www.youtube-nocookie.com/embed/${featuredVideo.videoId}" title="${featuredVideo.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
  </div>
</div>\n\n`;

    const stepMatch = cleanContent.match(/(## Step-by-Step[\s\S]*?)(?=## Face Shape|## Essential Tools|$)/i);
    if (stepMatch) {
      cleanContent = cleanContent.replace(stepMatch[1], stepMatch[1] + videoBlock);
    } else {
      cleanContent += videoBlock;
    }
  }

  // INJECT secondary photo after Face Shape section
  if (topicItem.detailPhoto) {
    const photoBlock = `\n\n<figure class="in-article-figure">
  <img src="${topicItem.detailPhoto}" alt="${article.title || topicItem.topic} Visual Guide" class="in-article-img" loading="lazy" />
  <figcaption class="in-article-caption">Visual Inspiration: ${topicItem.topic} — ${topicItem.photoCredit}</figcaption>
</figure>\n\n`;

    const faceMatch = cleanContent.match(/(## Face Shape[\s\S]*?)(?=## Essential Tools|## Salon|$)/i);
    if (faceMatch) {
      cleanContent = cleanContent.replace(faceMatch[1], faceMatch[1] + photoBlock);
    } else {
      cleanContent = photoBlock + cleanContent;
    }
  }

  const wordCount = cleanContent.split(/\s+/).filter(w => w.length > 0).length;
  console.log(`📊 Word Count: ${wordCount} words (Target: 1300+)`);

  // Build frontmatter
  const safeTitle = JSON.stringify(article.title || topicItem.topic);
  const safeDesc = JSON.stringify(article.description || `Discover ${topicItem.topic} trends for 2026.`);
  const safeExcerpt = JSON.stringify(article.excerpt || article.description || "");
  const safeCategory = JSON.stringify(topicItem.category);
  const keywordsYaml = (article.keywords || []).map((k) => `  - ${JSON.stringify(k)}`).join("\n");
    const youtubeYaml = videos.length > 0
    ? videos.map((v) => `  - title: ${JSON.stringify(v.title)}\n    videoId: ${JSON.stringify(v.videoId)}`).join("\n")
    : "[]";
  const faqYaml = (article.faq && article.faq.length > 0)
    ? (article.faq)
        .map((f) => `  - question: ${JSON.stringify(f.question)}\n    answer: ${JSON.stringify(f.answer)}`)
        .join("\n")
    : "[]";
  const frontmatter = ---
$1
faq:
${faqYaml}
---

${cleanContent}
`;

  fs.writeFileSync(filePath, frontmatter, "utf8");
  console.log(`✅ Saved: ${filePath} (${wordCount} words)`);
  return { slug, wordCount, title: article.title };
}

// ============================================================
// 6. MAIN — Run N articles
// ============================================================
async function main() {
  const count = parseInt(process.argv[2] || "1", 10);
  console.log(`\n🚀 BeautyTrend Daily — Publishing ${count} article(s)...\n`);

  const results = [];
  for (let i = 1; i <= count; i++) {
    console.log(`\n--- Article ${i} of ${count} ---`);
    try {
      const result = await generateSingleArticle();
      results.push({ success: true, ...result });
      if (i < count) {
        console.log("⏳ Waiting 5s before next article...");
        await sleep(5000);
      }
    } catch (err) {
      console.error(`❌ Article ${i} failed:`, err.message);
      results.push({ success: false, error: err.message });
    }
  }

  console.log("\n=== PUBLICATION SUMMARY ===");
  results.forEach((r, i) => {
    if (r.success) {
      console.log(`  ✅ Article ${i + 1}: "${r.title}" (${r.wordCount} words)`);
    } else {
      console.log(`  ❌ Article ${i + 1}: FAILED — ${r.error}`);
    }
  });

  const successCount = results.filter(r => r.success).length;
  console.log(`\n📊 Result: ${successCount}/${count} articles generated successfully.`);
  
  if (successCount === 0 && count > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("🔴 Pipeline Fatal Error:", err);
  process.exit(1);
});
