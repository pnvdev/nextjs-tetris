# Tetris Game

A classic Tetris game implemented in React and TypeScript. This project showcases a basic implementation of the Tetris game mechanics, including piece movement, rotation, line clearing, and scoring.

## Features

- **Piece Movement**: Move pieces left, right, and down using arrow keys.
- **Piece Rotation**: Rotate pieces using the up arrow key.
- **Line Clearing**: Automatically clears full lines and updates the score.
- **Game Over**: Displays a "Game Over" screen with the final score and a button to restart the game.
- **Responsive Design**: Styled using Tailwind CSS for a clean and modern look.

## Top Scores

The game integrates with Supabase to manage and display the top 10 scores. When the game ends and if the final score is high enough, the player can input their name to save the score. The top 10 scores are fetched from Supabase and displayed on the screen.

### How It Works

1. **Score Submission**: Upon game over, players can submit their scores along with their name. The score is saved to a Supabase database table called `score`.
2. **Score Display**: The top 10 scores are fetched from the Supabase database and displayed on the screen.

## Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/pnvdev/nextjs-tetris.git
   cd tetris-game
   ```

2. **Install Dependencies**

   Ensure you have [Node.js](https://nodejs.org/) installed. Then, install the project dependencies:

   ```bash
   pnpm install
   ```

3. **Run the Development Server**

   Start the development server to run the game:

   ```bash
   pnpm dev
   ```

   Open `http://localhost:3000` in your browser to play the game.

## Usage

- **Arrow Keys**:

  - **Left Arrow**: Move the piece left.
  - **Right Arrow**: Move the piece right.
  - **Down Arrow**: Move the piece down faster.
  - **Up Arrow**: Rotate the piece.

- **Play Again**: After the game is over, click the "Play Again" button to restart the game.

## Development

- **Code Style**: Follow TypeScript and React best practices.
- **Styling**: Tailwind CSS is used for styling. Customize styles in `tailwind.config.js` if needed.
- **State Management**: React's `useState` and `useEffect` hooks are used for managing game state and effects.

## Contributing

1. Fork the repository.
2. Create a new branch for your feature or fix.
3. Make your changes and commit them.
4. Push your changes to your fork.
5. Open a pull request with a description of your changes.

## License

This project is licensed under the [MIT License](LICENSE).

## Contact

For any questions or feedback, please reach out to [paulvallejos@gmail.com](mailto:paulvallejos@gmail.com).
