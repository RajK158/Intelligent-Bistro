# Velora Bistro

## Demo Video

Loom Walkthrough: https://www.loom.com/share/748745cb18b141979c42612422ca5155

Velora Bistro is a React Native Expo mobile ordering experience built for the Viridien AI Full-Stack Engineering Internship challenge.

The app allows users to browse a restaurant menu, add items manually, and manage their cart through a conversational AI dining concierge named V. The backend processes natural language order requests and returns structured cart actions such as adding items, removing items, updating quantities, and clearing the cart.

## Features

- Premium dark luxury restaurant UI
- React Native Expo frontend
- Node.js Express backend
- Conversational AI ordering assistant
- Structured JSON cart actions from backend
- Live Order Ticket cart experience
- Manual cart controls for add, remove, and quantity updates
- Menu suggestions and unavailable item handling
- Real OpenAI API integration with fallback parsing

## Tech Stack

### Frontend
- React Native
- Expo
- TypeScript
- React Native StyleSheet

### Backend
- Node.js
- Express
- TypeScript
- Zod
- OpenAI API

## Project Structure

```text
Intelligent-Bistro/
  frontend/
    src/
      components/
      data/
      types/
    App.tsx
    package.json

  backend/
    src/
      aiOrder.ts
      index.ts
      menu.ts
    package.json
    .env.example

  README.md