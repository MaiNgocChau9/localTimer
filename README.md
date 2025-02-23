# Rubik's Cube Timer

## Overview
This is a simple and interactive Rubik's Cube timer designed for speedcubers. It allows users to generate scrambles, track their solving times, and view statistics like personal bests. The timer supports both 2D and 3D visualization of the cube scramble.

## Features
- **Timer with inspection time**: Hold space to start inspection, release to start timing.
- **Scramble generation**: Generates a random scramble for each solve.
- **Solve history**: Stores previous solve times in local storage.
- **Personal Best tracking**: Displays the best time recorded.
- **2D & 3D visualization**: Toggle between different scramble visualizations.
- **Solve detail modal**: View detailed information about each solve.
- **Dark mode support**: Automatic adaptation based on system preferences.

## Installation
No installation is required; just open `index.html` in a web browser.

Alternatively, if you want to install dependencies, run:
```sh
npm install
```

## Usage
1. Open `index.html` in a browser.
2. Press **Space** to start inspection.
3. Hold **Space** and release to start the timer.
4. Press **Space** again to stop the timer.
5. View history, personal best, and scramble visualization.
6. Toggle dark mode for better visibility.

## Directory Structure
```
localTimer/
├── index.html       # Main HTML file
├── package.json     # Dependencies (scramble-display)
├── script.js        # Timer logic and UI handling
├── style.css        # Styling
└── dark-mode.js     # Handles dark mode switching
```

## Dependencies
This project uses:
- [Bootstrap 5.3.3](https://getbootstrap.com/)
- [scramble-display](https://github.com/cubing/scramble-display)

## License
This project is open-source and available under the MIT License.

## Acknowledgments
Special thanks to the speedcubing community for inspiring this project!