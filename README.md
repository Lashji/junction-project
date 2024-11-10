# Quorum - Digital Democracy Platform

## Overview
Quorum is a hackathon project created for Junction 2024, designed to enable secure, transparent, and authentic participation in online voting and discussions. Our platform combines robust identity verification with privacy-preserving technology to ensure genuine democratic engagement while maintaining user privacy.

## Core Features

### 🔐 Secure Identity Verification
- Bank-based strong authorization for establishing unique digital identities
- Zero-knowledge proofs for privacy-preserving authentication
- One-person-one-vote integrity through combined approach:
  - Browser fingerprinting for anonymous user identification
  - W3C Verifiable Credentials for strong authentication
  - Decentralized Identifiers (DIDs) for identity management

### 🗳️ Democratic Participation
- Create and participate in community polls
- Engage in meaningful discussions
- Demographic-based voting with privacy-preserving ZK proofs
  - Filter participation based on verified attributes
  - Maintain complete privacy of user data

### 🛡️ Privacy & Security
- Personal information remains encrypted on user devices
- Anonymous voting while maintaining authenticity
- Bot-free environment through multi-layer verification

## Technical Stack

### Frontend
- Next.js 15.0
- TypeScript
- TailwindCSS with ShadcnUI components
- Framer Motion for animations

### Identity & Verification
- [PolygonID Verifier Backend](https://github.com/0xPolygonID/verifier-backend) for credential verification
- [PolygonID Issuer Node](https://github.com/0xPolygonID/issuer-node) for credential issuance
- FingerprintJS Pro for device fingerprinting
- Polygon ID integration for identity verification
- Signicat Bank ID verification using FTN (Finnish Trust Network) 

### Backend Services
- FastAPI Python backend for core functionality
- Backend repository https://github.com/ink-waffle/QuorumBackend
- PostgreSQL for data persistence
- Redis for caching
- Custom authentication system

## Live Demo

Experience Quorum in action at [junction-project-dbun.vercel.app](https://junction-project-dbun.vercel.app/)

Key features you can try:
- Secure bank-based identity verification
- Zero-knowledge credential issuance
- Privacy-preserving participation in polls
- Anonymous but verified discussions

Note: Bank ID verification currently supports Finnish bank credentials through the FTN network.

Another note: Issuer and verifier might not work on the live demo as they are hosted/tunneled from local network currently and there might be downtimes.