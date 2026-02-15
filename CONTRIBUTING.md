# Contributing to AEGIS+

Thank you for your interest in contributing to AEGIS+! We welcome contributions from everyone.

## Getting Started

1.  **Fork the Repository**: Use the "Fork" button on GitHub.
2.  **Clone your Fork**:
    ```bash
    git clone https://github.com/StartInfinia/AEGIS.git
    cd AEGIS
    ```
3.  **Install Dependencies**:
    - Backend: `cd backend && npm install`
    - Frontend: `cd frontend && npm install`

## Development Workflow

1.  **Create a Branch**: Always work on a new branch for each feature or bug fix.
    ```bash
    git checkout -b feature/your-feature-name
    ```
2.  **Run Locally**: Ensure both backend and frontend servers are running.
    - Backend: `cd backend && npm run dev` (Port 5000)
    - Frontend: `cd frontend && npm run dev` (Port 3000)
3.  **Code Style**:
    - Follow standard JavaScript/React conventions.
    - Use meaningful variable and function names.
    - Comment complex logic.
4.  **Commit Messages**: Write clear, descriptive commit messages.
    ```bash
    git commit -m "feat(auth): Add Google Sign-In support"
    ```

## Pull Requests

1.  **Push to your Fork**: `git push origin feature/your-feature-name`
2.  **Open a Pull Request**: Go to the original repository and click "Compare & pull request".
3.  **Describe your changes**: Explain what you did and why. Include screenshots if applicable.
4.  **Wait for Review**: A maintainer will review your PR.

## Reporting Issues

If you find a bug or have a suggestion, please open an issue in the repository.

- **Bug Reports**: Describe the issue, steps to reproduce, expected behavior, and actual behavior.
- **Feature Requests**: Describe the feature and why it would be useful.

## License

By contributing, you agree that your contributions will be licensed under the project's [ISC License](LICENSE).
