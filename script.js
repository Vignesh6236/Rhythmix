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

let currentSong = new Audio();

// function to play music
const playMusic = (track, songName, autoPlay = true) => {
    currentSong.src = track;
    currentSong.volume = 0.2;
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
    let songs = await getSongs();

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
    document.querySelector(".seekbar").addEventListener("click", e=>{
        let percent = (e.offsetX / e.target.getBoundingClientRect().width )* 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })
};

main();
