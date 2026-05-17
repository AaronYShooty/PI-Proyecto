# Project Overview

This project is a single-page web application prototype called "Mundial AR Clips". It appears to be designed as a mobile-first web app for browsing video clips, applying filters, and interacting with Augmented Reality (AR) content triggered by QR codes.

The application has the following sections:
*   **Home:** A landing screen with a button to enter the main feed.
*   **Feed:** Displays a video clip with social interaction buttons (like, comment, share) and options to edit filters or scan a QR code.
*   **Video Editor:** A placeholder for a video editing interface with filters.
*   **QR Scanner:** A screen to scan a QR code using the device's camera, which seems intended to unlock AR content or player information.
*   **Profile:** A section to display a list of unlocked experiences.

## Technologies

*   **HTML:** The structure of the application is defined in `index.html`.
*   **CSS:** The application is styled with `styles.css`, using a modern, dark theme.
*   **JavaScript:** The application logic is intended to be in `app.js`, which is currently empty.

# Building and Running

This is a static web project. To run the application, you just need to open the `index.html` file in a web browser.

For the QR code scanning functionality to work, you will need to serve the files from a web server and access it via `https-` to allow camera access. You can use a simple python web server for this.

```bash
python -m http.server
```

Then open `https-://localhost:8000` in your browser.

# Development Conventions

*   The project uses a multi-screen single-page application (SPA) architecture, where different sections are shown or hidden dynamically.
*   The styling is self-contained in `styles.css` and uses CSS variables for theming.
*   The JavaScript logic in `app.js` will need to be implemented to handle screen navigation, video playback, QR code scanning, and dynamic content updates.
