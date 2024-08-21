
let currentSong = new Audio();
let songs;

// get all songs
let getSongs = async () => {
    let a = await fetch("http://127.0.0.1:5500/assets/Songs/");
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


// function to play music
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

// function to convert time to proper format
function convertSecondsToHMS(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    let hrs = Math.floor(seconds / 3600);
    let mins = Math.floor((seconds % 3600) / 60);
    let secs = Math.floor(seconds % 60);

    let formattedHrs = hrs > 0 ? `${hrs}:` : "";
    let formattedMins = mins < 10 ? `0${mins}` : mins;
    let formattedSecs = secs < 10 ? `0${secs}` : secs;

    return `${formattedHrs}${formattedMins}:${formattedSecs}`;
}

//main function
main = async () => {
    songs = await getSongs();

    //inserting elements into the web page
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
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

    // setting default song
    if (songs.length > 0) {
        let defaultSongInfo = songs[7].split(".mp3")[0];
        let defaultSongArtist = defaultSongInfo.split("-")[0].trim();
        let defaultSongName = defaultSongInfo.split("-")[1].trim();
        let defaultTrack = `http://127.0.0.1:5500/assets/Songs/${encodeURIComponent(defaultSongArtist)}-%20${encodeURIComponent(defaultSongName)}.mp3`;

        playMusic(defaultTrack, defaultSongName, false); // Load default song and pause it
    }

    // adding event listener to each song in the library
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            let songName = e.querySelector(".info").firstElementChild.innerHTML.trim();
            let songArtist = e.querySelector(".info").lastElementChild.innerHTML.trim();
            let track = `http://127.0.0.1:5500/assets/Songs/${encodeURIComponent(songArtist)}-%20${encodeURIComponent(songName)}.mp3`;

            playMusic(track, songName); // Play clicked song immediately
        });
    });

    // event listener to play songs when a song is clicked
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "assets/icons/pause.svg";
        } else {
            currentSong.pause();
            play.src = "assets/icons/play.svg";
        }
    });

    // event listener to update time and duration of the songs and also update the circle of the seekbar
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".song-duration").innerHTML = `${convertSecondsToHMS(currentSong.currentTime)} / ${convertSecondsToHMS(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    });

    // event listener to control the seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })


    // event listener to hamburger to open side bar
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
        document.querySelector(".close").style.display = "inline";
    })


    // event listener to close button to close sidebar
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
        document.querySelector(".close").style.display = "none"
    })

    // event listener for previous button
    previous.addEventListener("click", () => {
        let currentSongTitle = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let currentIndex = songs.indexOf(currentSongTitle);

        if (currentIndex > 0) {
            let previousSong = songs[currentIndex - 1];
            let previousSongInfo = previousSong.split(".mp3")[0];
            let previousSongArtist = previousSongInfo.split("-")[0].trim();
            let previousSongName = previousSongInfo.split("-")[1].trim();
            let previousTrack = `http://127.0.0.1:5500/assets/Songs/${encodeURIComponent(previousSongArtist)}-%20${encodeURIComponent(previousSongName)}.mp3`;

            playMusic(previousTrack, previousSongName);
            console.log(`Playing previous song`);

        } else {
            console.log("No previous song available.");
        }
    });


    // event listener for next button
    next.addEventListener("click", () => {
        let currentSongTitle = decodeURIComponent(currentSong.src.split("/").slice(-1)[0]);
        let currentIndex = songs.indexOf(currentSongTitle);

        if (currentIndex < songs.length - 1) {
            let nextSong = songs[currentIndex + 1];
            let nextSongInfo = nextSong.split(".mp3")[0];
            let nextSongArtist = nextSongInfo.split("-")[0].trim();
            let nextSongName = nextSongInfo.split("-")[1].trim();
            let nextTrack = `http://127.0.0.1:5500/assets/Songs/${encodeURIComponent(nextSongArtist)}-%20${encodeURIComponent(nextSongName)}.mp3`;

            playMusic(nextTrack, nextSongName);
            console.log(`Playing next song!`);

        } else {
            console.log("No next song available.");
        }
    });


    // event listener to toggle volume slider visibility
    const volumeButton = document.querySelector('.volume-container img');
    const volumeSlider = document.querySelector('.volume-container input');
    volumeButton.addEventListener('click', () => {
        if (volumeSlider.style.display === 'block') {
            volumeSlider.style.display = 'none';
        } else {
            volumeSlider.style.display = 'block';
        }
    });

    // event listener to close the volume slider if clicked outside the slider
    document.addEventListener('click', (event) => {
        if (!volumeButton.contains(event.target) && !volumeSlider.contains(event.target)) {
            volumeSlider.style.display = 'none';
        }
    });


    // event listener to set volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log(`Setting volume to ${e.target.value}/100`);
        currentSong.volume = parseInt(e.target.value) / 100

    })

};

main();
