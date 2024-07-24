# SpotyTube

## Overview


This script automates the process of creating a new playlist in Spotify from a YouTube playlist. It uses `readline-sync` for user input and `puppeteer` for web automation and a `dot-env` package.

## Getting Started

### Prerequisites

- Node.js (>= 14.x)
  
### Installation

1. **Clone the Repository:**

   ```bash
   https://github.com/Ansh2004P/SpotyTube.git

2. **Add .env file same as the format of .env.sample file**

3. **Run the following commands:**
   ```bash
     npm install
     npm run index.js

## Usage
1. Follow the prompts to enter:
	* The URL of the YouTube playlist you want to import.
	* Your Spotify email and password.
	* A description for the new Spotify playlist.
2. The script will create a new playlist in Spotify with the same name as the YouTube playlist and add all the tracks from the YouTube playlist to it.

## Notes

* Make sure you have the necessary permissions to access your Spotify account and create new playlists.
* Make sure the playlist link provided is active and public.
* This script uses `puppeteer` to automate the Spotify web interface, so it may not work if Spotify changes their website layout or functionality.

## Troubleshooting

If you encounter any issues while running the script, check the console output for error messages. You can also try debugging the script by adding `console.log` statements to identify the problem.

## Contributing

If you'd like to contribute to this project, please fork the repository and submit a pull request with your changes. You can also report issues or suggest new features by creating an issue on this repository.
