# **App Name**: ArchivaSmart

## Core Features:

- Secure User Authentication & Role-Based Access: Manages user login, allows selection of roles (student, employee, manager), and enforces secure, role-based access control to the system functionalities, integrated with Firebase Authentication and Firestore for profiles.
- Intelligent Exam Upload & OCR Data Extraction: Provides a multi-step workflow for uploading exam image files (with drag & drop, multi-upload, and compression), allows preview and rearrangement, and uses an AI-powered tool to automatically extract and pre-fill student registration ID and name via OCR, stored in Firebase Storage and Firestore.
- Comprehensive Exam Archiving & Viewing: Enables efficient storage of archived exams in Firebase Storage, presents them in an organized browsable archive with togglable list/grid views, and offers a dedicated viewer with lazy loading, zoom, page navigation, and PDF download options.
- Dynamic Search & Filtering System: Facilitates quick discovery of archived exams through a smart search bar (supporting search by student ID or name) and robust filtering options (by year, term, subject, and specialization) utilizing Firestore.
- Personalized Employee Dashboard & RTL Navigation: Offers employees a central dashboard summarizing key statistics like daily uploads and total files, coupled with intuitive Right-to-Left (RTL) navigation through a consistent top navbar and a collapsible side menu.
- PWA Functionality & Offline Resilience: Ensures the application is a Progressive Web App (PWA) with features like installability, fast loading, offline mode with upload queuing capabilities, and mobile-first responsiveness for seamless access.
- System Settings & User Preferences: Allows users to manage account settings, including changing passwords, and ensures a fixed Arabic language UI (RTL) for all interactions.

## Style Guidelines:

- Primary color: Deep Luxury Blue (#0B3C5D). This deep, saturated blue evokes professionalism and trust, setting a serious tone appropriate for an ERP system.
- Background color: Light Gray/Blue (#F4F7FB). This very light, desaturated blue provides a clean, calm, and spacious canvas that aligns with the primary blue hue while offering strong contrast for content.
- Accent color: Soft Blue (#328CC1). This lighter and moderately saturated blue offers a subtle vibrancy for interactive elements, highlights, and supports gradient applications as specified, maintaining an analogous blue palette.
- Body and headline font: 'Cairo' (sans-serif) for clear and modern Arabic typography, suitable for both headlines and longer text passages to ensure excellent legibility across the application. Note: currently only Google Fonts are supported.
- Use modern, clean, and intuitive icons throughout the application, specifically for role selection cards (student, employee, manager), navigation menus, and content interactions, ensuring clarity and cultural relevance for an Arabic-speaking audience.
- Implement a Right-to-Left (RTL) layout universally across the application to support the Arabic language. Employ a mobile-first design strategy, utilizing a consistent top navigation bar and a collapsible RTL side menu. Utilize cards with rounded corners and soft shadows for organizing content, ensuring minimal clicks and a fast workflow.
- Integrate subtle yet informative animations for interactive elements such as hover/press states on cards and buttons. Include animated loading indicators, and smooth transitions for page changes or content updates to enhance the user experience and workflow clarity.