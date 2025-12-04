# Agentic Shop

[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![MCP](https://img.shields.io/badge/MCP-Ready-purple)](https://modelcontextprotocol.io/)
[![Stripe](https://img.shields.io/badge/Stripe-Payments-635bff)](https://stripe.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Database-3ecf8e)](https://supabase.com/)

A proof-of-concept e-commerce platform demonstrating **agentic commerce**, where AI agents can autonomously browse, recommend, and facilitate purchases through natural language interactions.

![Agentic Shop Preview](https://agentic-t-shirt-shop.vercel.app/)

## About

This project is a dummy T-shirt store that serves as a research platform for exploring agentic commerce concepts. Agentic commerce represents a paradigm shift where artificial intelligence agents can act autonomously in commerce workflows, enabling users to shop through conversational interfaces like ChatGPT.

## POC Purpose

This proof-of-concept was built to:

- **Research Agentic Commerce**: Understand how AI agents can autonomously handle shopping workflows on behalf of users
- **Explore AI Web Scraping**: Investigate how ChatGPT and similar models can discover products through structured data feeds
- **Demonstrate Conversational Commerce**: Show end-to-end shopping experiences through natural language interactions
- **Build Tool Integration**: Create MCP (Model Context Protocol) interfaces that LLMs can use to interact with commerce platforms

## Features

### 🌐 Complete E-Commerce Experience

- **Product Catalog**: Browse T-shirts, hoodies, and accessories
- **Advanced Search & Filters**: Find products by category, price, and keywords
- **Product Pages**: Detailed views with images, descriptions, and reviews
- **Shopping Cart**: Add/remove items with persistent cart state
- **Secure Checkout**: Stripe-powered payment processing
- **Order Management**: Track purchases and view order history
- **User Reviews**: Customer ratings and feedback system

### 🤖 AI Agent Integration

- **MCP Server**: Exposes commerce tools to large language models
- **OpenAI Product Feed**: Structured data feed enabling ChatGPT to discover products
- **Product Widgets**: Visual product displays renderable in chat interfaces
- **Agent Tools**:
  - `getProducts` - Browse catalog with filtering/sorting
  - `getProductBySlug` - Get detailed product information
  - `showProduct` - Display products in chat with purchase buttons

### 💳 Technical Infrastructure

- **Database**: Supabase for products, orders, and user data
- **Caching**: Redis for performance optimization (tried using it, but didnt manage to get it to work)
- **Security**: Type-safe APIs with Zod validation
- **Responsive**: Mobile-first design with Tailwind CSS
- **Webhooks**: Real-time Stripe payment confirmations

## Tech Stack

| Category           | Technologies                                               |
| ------------------ | ---------------------------------------------------------- |
| **Frontend**       | Next.js 16, React 19, TypeScript, Tailwind CSS             |
| **Backend**        | Next.js API Routes, Supabase                               |
| **Payments**       | Stripe Checkout API                                        |
| **AI Integration** | Model Context Protocol (MCP), OpenAI Product Feeds         |
| **Database**       | PostgreSQL (via Supabase)                                  |
| **Caching**        | Redis (tried using it, but didnt manage to get it to work) |
| **Deployment**     | Vercel                                                     |
| **Validation**     | Zod                                                        |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Trond00/agentic-T-shirt-shop.git
   cd agentic-shop
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment Configuration**

   Create `.env.local` with your service credentials:

   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # Stripe Configuration
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

   # Redis (optional, for caching)
   REDIS_URL=redis://localhost:6379
   ```

4. **Set up Supabase Database**

   Run the SQL migrations in `supabase/migrations/` or set up tables manually:

   - `products` table with inventory fields
   - `orders` table for purchase tracking
   - `reviews` table for user feedback

5. **Configure Stripe**

   - Create products in Stripe dashboard
   - Set up webhooks for payment confirmation

6. **Development Server**

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) to see the store.

## Usage

### 🛒 Web Store Experience

- Browse products on the homepage featured section
- Use `/catalog` for filtered search and category browsing
- Click product images for detailed views
- Add items to cart and proceed to checkout

### 🤖 AI Agent Integration

The platform provides several integration points:

#### MCP Tools

The `/mcp` endpoint exposes tools that LLMs can use for commerce interactions:

```javascript
// Example: AI can browse products
tool: "getProducts"
parameters: { limit: 5, category: "T-Shirts" }

// Example: AI can show specific products
tool: "getProductBySlug"
parameters: { slug: "classic-white-tshirt" }
```

#### OpenAI Product Feed

The `/openai-feed` endpoint provides structured product data that ChatGPT can scrape for:

- Product discovery and recommendations
- Price comparisons
- Availability checking
- Purchase facilitation

#### Product Widgets

The `/widgets/show-product.html` provides iframe-compatible displays for chat interfaces.

## Project Architecture

```
src/
├── app/                          # Next.js App Router
│   ├── api/                      # Backend API routes
│   │   ├── products/            # Product CRUD endpoints
│   │   ├── openai/              # AI integration feeds
│   │   └── stripe/              # Payment processing
│   ├── catalog/                 # Product listing pages
│   ├── products/[slug]/         # Dynamic product pages
│   ├── checkout/                # Payment flow
│   ├── mcp/                     # Model Context Protocol
│   └── orders/                  # Order management
├── components/                   # Reusable UI components
├── lib/                         # Business logic and utilities
│   ├── supabase/               # Database operations
│   ├── stripe.ts               # Payment configuration
│   └── openai-product-feed.ts  # AI integration logic
└── types.ts                     # TypeScript definitions
```

## Key Files & Concepts

- **`src/lib/openai-product-feed.ts`**: Transforms products into OpenAI-compliant schema
- **`src/app/mcp/route.ts`**: MCP server i tried to sett up for learning about MCP and if its viable for Agentic commerce
- **`src/app/api/openai/products/route.ts`**: AI product discovery endpoint

## Future Enhancements

- [ ] Further research when the tech advances
- [ ] A cool poc like https://www.agenticcommerce.dev/
- [ ] Cross-platform AI integrations

## Contributing

Its just a POC to test :3

## License

**Built with ❤️ for the future of conversational commerce**

_Researching the intersection of AI agents and e-commerce workflows_
