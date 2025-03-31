# Mavericks Cat CGs Frontend

This folder contains the frontend code for the Mavericks Cat CGs project. It is built using **React**, **TypeScript**, and **Vite** for a fast and modern development experience.

## Features

- **React**: A JavaScript library for building user interfaces.
- **TypeScript**: Adds static typing to JavaScript for better developer experience and fewer runtime errors.
- **Vite**: A fast build tool and development server with Hot Module Replacement (HMR).
- **ESLint**: Configured for linting and enforcing code quality.

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js** (v16 or later)
- **npm** or **yarn**

## Setup Instructions

1. Clone the repository and navigate to the `frontend` folder:

   ```bash
   git clone <repository-url>
   cd cis390/CardProject/Mavericks_Cat_CGs/frontend
   ```

2. Install the dependencies:

   ```bash
   npm install
   ```

   or, if you prefer yarn:

   ```bash
   yarn install
   ```

3. Start the development server:

   ```bash
   npm run dev
   ```

   or, with yarn:

   ```bash
   yarn dev
   ```

4. Open your browser and navigate to the URL provided in the terminal (usually `http://localhost:5173`).






## EXTRA
## Building for Production

To create a production build of the frontend:

1. Run the build command:

   ```bash
   npm run build
   ```

   or, with yarn:

   ```bash
   yarn build
   ```

2. The production-ready files will be available in the `dist` folder.

## Linting and Code Quality

This project uses ESLint for linting. To run the linter:

```bash
npm run lint
```

or, with yarn:

```bash
yarn lint
```

### Expanding ESLint Configuration

For stricter linting rules, you can update the ESLint configuration as described in the [Expanding the ESLint Configuration](#expanding-the-eslint-configuration) section of this README.

## Additional Notes

- The project uses the following ESLint plugins for React-specific linting:
  - [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x)
  - [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom)

- TypeScript configuration files (`tsconfig.node.json` and `tsconfig.app.json`) are used to define the project's type-checking behavior.

## Troubleshooting

If you encounter issues during setup or development:

1. Ensure all dependencies are installed correctly by running:

   ```bash
   npm install
   ```

2. Check for any errors in the terminal output when running the development server.

3. Verify that your Node.js version is compatible with the project requirements.

For further assistance, consult the project maintainers or open an issue in the repository.