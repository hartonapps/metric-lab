# Metric Lab Website

Official website for **Metric Lab**, a Shopify growth engineering team focused on building scalable e-commerce solutions.

This project is built using **Next.js, Tailwind CSS, and GSAP** to create a fast, modern, and responsive agency website.

---

## 🚀 Tech Stack

* **Next.js 16** – React framework for production applications
* **Tailwind CSS** – Utility-first styling
* **GSAP** – Smooth animations
* **Lucide Icons / Heroicons** – UI icons
* **TypeScript** – Type-safe development

---

## 📂 Project Structure

```
app/
  page.tsx            # Homepage
  layout.tsx          # Global layout
  gallery/            # Gallery page
  case-studies/       # Case studies pages
  team-directory/     # Full team listing
  not-found.tsx       # 404 page

components/
  Navbar.tsx
  TeamCard.tsx
  Container.tsx
  Section.tsx
  Footer.tsx

data/
  gallery.ts
  services.ts
  team.ts
  caseStudies.ts

public/
  images/             # Static assets
```

---

## ✨ Features

* Modern responsive design
* Animated UI using GSAP
* Team directory system
* Case studies showcase
* Image gallery
* FAQ section
* JSON-driven content (no backend required)
* Clean component architecture

---

## ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/yourusername/metric-lab.git
```

Navigate into the project:

```bash
cd metric-lab
```

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

The site will be available at:

```
http://localhost:3000
```

---

## 🧠 Content Management

This project does **not use a database**.

All dynamic content is managed through JSON/TypeScript files in the `/data` folder.

Example:

```
data/gallery.ts
```

To add a new gallery image, simply add another URL to the array.

```
const GALLERY = [
  "image1.jpg",
  "image2.jpg",
  "image3.jpg"
]
```

Push changes to GitHub and redeploy.

---

## 📦 Deployment

Recommended platform:

**Vercel**

Steps:

1. Push project to GitHub
2. Import repository into Vercel
3. Deploy

Every GitHub push will trigger automatic deployment.

## 📧 Contact

Metric Lab
Shopify Growth Engineering Team

For inquiries:

**[hellometriclab@gmail.com](mailto:hellometriclab@gmail.com)**


## 📜 License

This project is for the official Metric Lab website.

All rights reserved.
