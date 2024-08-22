let currentSong = new Audio();
let songs = [];
let currentPlaylist = "";

// Function to play music
const playMusic = (track, songName, autoPlay = true) => {
    currentSong.src = track;

    document.querySelector(".song-info").innerHTML = `${songName}`;
    document.querySelector(".song-duration").innerHTML = "00:00 / 00:00";

    currentSong.addEventListener("loadedmetadata", () => {
        let totalDuration = convertSecondsToHMS(currentSong.duration);
        document.querySelector(".song-duration").innerHTML = `00:00 / ${totalDuration}`;
    });

    if (autoPlay) {
        currentSong.play();
        play.src = "assets/icons/pause.svg";
    } else {
        currentSong.pause();
        play.src = "assets/icons/play.svg";
    }
};

// Function to convert time to proper format
function convertSecondsToHMS(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00";
    }
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);

    let formattedHrs = hrs > 0 ? `${hrs}:` : "";
    let formattedMins = mins < 10 ? `0${mins}` : mins;
    let formattedSecs = secs < 10 ? `0${secs}` : secs;

    return `${formattedHrs}${formattedMins}:${formattedSecs}`;
};

// Function to fetch songs from a specific playlist
let getPlaylistSongs = async (playlist) => {
    let a = await fetch(`http://127.0.0.1:5500/assets/playlists/${playlist}/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    let songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.title.endsWith(".mp3")) {
            let decodedTitle = decodeURIComponent(element.title);
            songs.push(decodedTitle);
        }
    }
    return songs;
};

// Function to load songs for a specific playlist and set the first song to play
const loadPlaylist = async (playlist) => {
    currentPlaylist = playlist;
    songs = await getPlaylistSongs(playlist);

    // Clear previous song list
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
    songUL.innerHTML = "";

    // Insert new songs into the web page
    for (const song of songs) {
        let songInfo = song.split(".mp3")[0];
        let songArtist = songInfo.split("-")[0].trim();
        let songName = songInfo.split("-")[1].trim();
        songUL.innerHTML += `
        <li class="glass4 rounded">
            <img src="assets/Icons/music.svg" alt="music">
            <div class="info">
                <div>${songName}</div>
                <div>${songArtist}</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="assets/Icons/play.svg" alt="play">
            </div>
        </li>`;
    }

    // Setting the first song of the playlist as default
    if (songs.length > 0) {
        let defaultSongInfo = songs[0].split(".mp3")[0];
        let defaultSongArtist = defaultSongInfo.split("-")[0].trim();
        let defaultSongName = defaultSongInfo.split("-")[1].trim();
        let defaultTrack = `http://127.0.0.1:5500/assets/playlists/${playlist}/${encodeURIComponent(defaultSongArtist)}-%20${encodeURIComponent(defaultSongName)}.mp3`;

        playMusic(defaultTrack, defaultSongName, false); // Load default song and pause it
    }
};


// Function to load the playlist cards
async function displayPlaylists() {
    let a = await fetch(`http://127.0.0.1:5500/assets/playlists/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");

    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];
        if (e.href.includes("/playlists/")) {
            // extraction of folder name
            let hrefParts = e.href.split("/").filter(part => part);
            let folder = hrefParts[hrefParts.length - 1].replace(/\/$/, '');


            // Fetching metadata of the folder
            let a = await fetch(`http://127.0.0.1:5500/assets/playlists/${folder}/info.json`);
            let response = await a.json();


            let cardContainer = document.querySelector(".cardContainer");
            cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card glass2">
                        <div class="play">
                            <img src="assets/Icons/Play icon.svg" alt="">
                        </div>
                        <img src="assets//playlists/${folder}/cover.png" alt="">
                        <span>${response.title}</span>
                        <p>${response.description}</p>
                    </div>`;
        }
    }
    // Adding event listener to each playlist card
    Array.from(document.querySelectorAll(".card")).forEach(card => {
        card.addEventListener("click", () => {
            let playlist = card.getAttribute("data-folder");
            loadPlaylist(playlist);
        });
    });

};





// Main function
const main = async () => {

    displayPlaylists()



    // Adding event listener to each song in the library
    document.querySelector(".songList").addEventListener("click", e => {
        if (e.target.closest("li")) {
            let songName = e.target.closest("li").querySelector(".info").firstElementChild.innerHTML.trim();
            let songArtist = e.target.closest("li").querySelector(".info").lastElementChild.innerHTML.trim();
            let track = `http://127.0.0.1:5500/assets/playlists/${currentPlaylist}/${encodeURIComponent(songArtist)}-%20${encodeURIComponent(songName)}.mp3`;

            playMusic(track, songName);
        }
    });

    // Event listener to play/pause button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assets/icons/pause.svg";
        } else {
            currentSong.pause();
            play.src = "assets/icons/play.svg";
        }
    });

    // Event listener to update time and duration of the songs and also update the circle of the seekbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-duration").innerHTML = `${convertSecondsToHMS(currentSong.currentTime)} / ${convertSecondsToHMS(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // Event listener to control the seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    });

    // Event listener to open the sidebar
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
        document.querySelector(".close").style.display = "inline";

        // event listener to close the sidebar when clicking outside
        document.addEventListener("click", handleClickOutside);
    });

    // Event listener to close the sidebar
    document.querySelector(".close").addEventListener("click", () => {
        closeSidebar();
    });

    // Function to close the sidebar
    function closeSidebar() {
        document.querySelector(".left").style.left = "-100%";
        document.querySelector(".close").style.display = "none";

        // Remove the event listener to prevent multiple listeners being added
        document.removeEventListener("click", handleClickOutside);
    }

    // Function to handle clicks outside the sidebar
    function handleClickOutside(event) {
        const sidebar = document.querySelector(".left");
        const closeBtn = document.querySelector(".close");
        const hamburger = document.querySelector(".hamburger");

        // Check if the click is outside the sidebar and not on the hamburger or close button
        if (!sidebar.contains(event.target) && !closeBtn.contains(event.target) && !hamburger.contains(event.target)) {
            closeSidebar();
        }
    }


    // Event listener for previous button
    previous.addEventListener("click", () => {
        let currentSongTitle = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let currentIndex = songs.indexOf(currentSongTitle);

        if (currentIndex > 0) {
            let previousSong = songs[currentIndex - 1];
            let previousSongInfo = previousSong.split(".mp3")[0];
            let previousSongArtist = previousSongInfo.split("-")[0].trim();
            let previousSongName = previousSongInfo.split("-")[1].trim();
            let previousTrack = `http://127.0.0.1:5500/assets/playlists/${currentPlaylist}/${encodeURIComponent(previousSongArtist)}-%20${encodeURIComponent(previousSongName)}.mp3`;

            playMusic(previousTrack, previousSongName);
            console.log(`Playing previous song`);

        } else {
            console.log("No previous song available.");
        }
    });

    // Event listener for next button
    next.addEventListener("click", () => {
        let currentSongTitle = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let currentIndex = songs.indexOf(currentSongTitle);

        if (currentIndex < songs.length - 1) {
            let nextSong = songs[currentIndex + 1];
            let nextSongInfo = nextSong.split(".mp3")[0];
            let nextSongArtist = nextSongInfo.split("-")[0].trim();
            let nextSongName = nextSongInfo.split("-")[1].trim();
            let nextTrack = `http://127.0.0.1:5500/assets/playlists/${currentPlaylist}/${encodeURIComponent(nextSongArtist)}-%20${encodeURIComponent(nextSongName)}.mp3`;

            playMusic(nextTrack, nextSongName);
            console.log(`Playing next song!`);

        } else {
            console.log("No next song available.");
        }
    });

    // Event listener to toggle volume slider visibility
    const volumeButton = document.querySelector('.volume-container img');
    const volumeSlider = document.querySelector('.volume-container input');
    volumeButton.addEventListener('click', () => {
        if (volumeSlider.style.display === 'block') {
            volumeSlider.style.display = 'none';
        } else {
            volumeSlider.style.display = 'block';
        }
    });

    // Event listener to close the volume slider if clicked outside the slider
    document.addEventListener('click', (event) => {
        if (!volumeButton.contains(event.target) && !volumeSlider.contains(event.target)) {
            volumeSlider.style.display = 'none';
        }
    });

    // Event listener to set volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(`Setting volume to ${e.target.value}/100`);
        currentSong.volume = parseInt(e.target.value) / 100;
    });
};

main();
